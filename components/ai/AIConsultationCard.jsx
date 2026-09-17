// NEXT JS - AI CONSULTATION CARD

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mic, PhoneOff, Play, Save, Loader2, Send, FileText, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AIConsultationCard = () => {
    const [isCalling, setIsCalling] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState("Idle"); // Idle, Listening, Processing, Speaking
    const [messages, setMessages] = useState([]);
    const [consultationData, setConsultationData] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [inputText, setInputText] = useState("");
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const router = useRouter();

    // Auto-scroll to bottom of chat
    const scrollToBottom = (force = false) => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150; // 150px threshold

            if (force || isAtBottom) {
                scrollContainerRef.current.scrollTo({
                    top: scrollHeight,
                    behavior: "smooth"
                });
            }
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length]);

    const startCall = async () => {
        setIsCalling(true);
        setStatus("Speaking");
        setIsFinished(false);
        const greeting = "Hello! I'm Dr. AI Assistant. Before we begin, can you please tell me your Name?";
        const initialAIResponse = {
            displayText: greeting,
            role: "assistant",
            data: {}
        };
        setMessages([initialAIResponse]);
        handleSpeak(greeting);
    };

    const endCall = () => {
        setIsCalling(false);
        setStatus("Idle");
        setIsRecording(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsFinished(true);
        toast.success("Consultation ended.");
    };

    const resetCall = () => {
        setMessages([]);
        setConsultationData(null);
        setIsFinished(false);
        startCall();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const duration = Date.now() - startTimeRef.current;
                if (duration < 500) {
                    toast.error("Recording too short. Please hold the button longer.");
                    setStatus("Idle");
                    return;
                }
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
                processAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            startTimeRef.current = Date.now();
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 0.1);
            }, 100);

            setIsRecording(true);
            setStatus("Listening");
        } catch (err) {
            console.error("Recording error:", err);
            toast.error("Microphone access denied.");
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setIsRecording(false);
            setStatus("Processing");
        }
    };

    const processAudio = async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob);
            formData.append("history", JSON.stringify(messages.map(m => ({ role: m.role, content: m.displayText }))));

            const response = await fetch("/api/ai/transcript", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const userMessage = { displayText: data.userText, role: "user" };
            const aiResponse = { ...data.aiResponse, role: "assistant" };

            setMessages((prev) => [...prev, userMessage, aiResponse]);
            setConsultationData(aiResponse.data);

            if (aiResponse.data?.isComplete) {
                setIsFinished(true);
            }

            if (aiResponse.displayText) {
                handleSpeak(aiResponse.displayText);
            } else {
                setStatus("Idle");
            }
        } catch (err) {
            console.error("Process Audio error:", err);
            toast.error("Error processing voice. Try typing instead.");
            setStatus("Idle");
        }
    };

    const handleTextSend = async () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText("");
        const userMessage = { displayText: text, role: "user" };
        setMessages(prev => [...prev, userMessage]);
        setStatus("Processing");

        try {
            const history = messages.map(m => ({ role: m.role, content: m.displayText }));
            history.push({ role: "user", content: text });

            const response = await fetch("/api/ai/transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history, text })
            });

            const data = await response.json();
            const aiResponse = { ...data.aiResponse, role: "assistant" };
            setMessages((prev) => [...prev, aiResponse]);
            setConsultationData(aiResponse.data);

            if (aiResponse.data?.isComplete) {
                setIsFinished(true);
            }

            handleSpeak(aiResponse.displayText);
        } catch (err) {
            console.error("Text send error:", err);
            toast.error("Error sending message.");
            setStatus("Idle");
        }
    };

    const handleSpeak = async (text) => {
        try {
            setStatus("Speaking");
            const response = await fetch("/api/ai/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            if (data.audioUrl && audioRef.current) {
                audioRef.current.src = data.audioUrl;
                audioRef.current.play();
            } else {
                throw new Error("No audio URL returned");
            }
        } catch (err) {
            console.error("Speak API error, falling back to browser TTS:", err);
            // Browser Fallback
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => setStatus("Idle");
                window.speechSynthesis.speak(utterance);
            } else {
                setStatus("Idle");
            }
        }
    };

    const handleAudioEnd = () => setStatus("Idle");

    const navigateToBooking = () => {
        if (consultationData?.department && consultationData.department !== "Emergency") {
            router.push(`/doctors/${encodeURIComponent(consultationData.department)}`);
        } else {
            router.push("/doctors");
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto border-emerald-900/20 bg-[#0f172a] overflow-hidden shadow-2xl">
            <CardHeader className="text-center pb-6 border-b border-emerald-500/10">
                <div className="mx-auto w-24 h-24 mb-4 relative drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Image
                        src="/ai-doctor.png"
                        alt="Dr. AI Assistant"
                        width={96}
                        height={96}
                        className="rounded-full border-4 border-emerald-500/30 object-cover aspect-square"
                    />
                    {status === "Speaking" && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full animate-ping"></div>
                    )}
                </div>
                <CardTitle className="text-2xl font-bold text-white tracking-tight">Dr. AI Assistant</CardTitle>
                <div className="flex justify-center gap-2 mt-2">
                    <Badge variant="outline" className={`px-4 py-1 text-xs font-medium transition-colors ${status === "Idle" ? "text-slate-400" : "text-emerald-400 border-emerald-500/50 bg-emerald-500/5 animate-pulse"}`}>
                        {status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col min-h-[500px] max-h-[750px] h-auto transition-all">
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-950/30"
                >
                    {messages.length === 0 && !isCalling && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 py-12 space-y-6">
                            <div className="p-6 rounded-full bg-emerald-500/10 mb-2">
                                <HeartPulse className="w-12 h-12 text-emerald-500 opacity-60" />
                            </div>
                            <h4 className="text-2xl font-semibold text-slate-200">Start Your Consultation</h4>
                            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                                Connect with our AI medical agent for structured triage and expert specialist matching.
                            </p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-2 animate-in slide-in-from-bottom-2`}>
                            <div
                                className={`max-w-[85%] p-4 rounded-2xl shadow-md leading-relaxed ${msg.role === "user"
                                    ? "bg-emerald-600 text-white rounded-tr-none"
                                    : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none"
                                    }`}
                            >
                                <p className="text-[14px]">{msg.displayText}</p>

                                {msg.data?.possibleCauses && (
                                    <div className="mt-3 p-2 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs italic text-slate-400">
                                        Possible: {msg.data.possibleCauses}
                                    </div>
                                )}
                            </div>

                            {msg.data?.suggestedSpecialist && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="ml-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-xs rounded-full h-8 px-4"
                                    onClick={() => {
                                        router.push(`/doctors/${encodeURIComponent(msg.data.suggestedSpecialist)}`);
                                    }}
                                >
                                    Book {msg.data.suggestedSpecialist}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {isFinished && consultationData && (
                    <div className="bg-emerald-950/20 p-6 border-t border-emerald-500/10 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-emerald-400 flex items-center tracking-wide uppercase">
                                <FileText className="w-4 h-4 mr-2" /> Consultation Summary
                            </h3>
                            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-[10px] px-2">
                                {consultationData.severity} Severity
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
                                <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Recommended Specialist</p>
                                <p className="text-white font-semibold flex items-center justify-between">
                                    {consultationData.suggestedSpecialist || "General Physician"}
                                    <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-[10px] px-3 ml-2" onClick={navigateToBooking}>
                                        Book Now
                                    </Button>
                                </p>
                            </div>
                            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
                                <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Status</p>
                                <Button variant="ghost" size="sm" className="h-7 text-slate-400 hover:text-white text-[10px] p-0" onClick={resetCall}>
                                    Restart Consultation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {!isFinished && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900/40">
                        {!isCalling ? (
                            <Button
                                size="lg"
                                className="bg-emerald-600 hover:bg-emerald-700 w-full rounded-xl h-14 text-lg font-bold shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                                onClick={startCall}
                            >
                                <Play className="mr-2 h-5 w-5 fill-white" /> Start Health Intake
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
                                        placeholder="Type your response..."
                                        className="flex-1 bg-slate-800 border-slate-700 text-white rounded-xl px-4 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    />
                                    <Button
                                        size="icon"
                                        className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 rounded-xl"
                                        onClick={handleTextSend}
                                        disabled={!inputText.trim() || status === "Processing"}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center gap-8 pt-2">
                                    <div className="flex flex-col items-center gap-2">
                                        <Button
                                            size="icon"
                                            className={`h-16 w-16 rounded-full transition-all border-4 ${isRecording ? "bg-red-500 border-red-400/30 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-emerald-600 border-emerald-400/30 hover:bg-emerald-700"}`}
                                            onClick={handleToggleRecording}
                                            disabled={status === "Speaking" || status === "Processing"}
                                        >
                                            {status === "Processing" ? (
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                            ) : isRecording ? (
                                                <div className="text-[10px] font-bold text-white leading-none">{recordingTime.toFixed(1)}s</div>
                                            ) : (
                                                <Mic className="h-8 w-8 text-white" />
                                            )}
                                        </Button>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                            {isRecording ? "Stop" : "Click to Talk"}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-full border-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                                        onClick={endCall}
                                    >
                                        <PhoneOff className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <audio ref={audioRef} onEnded={handleAudioEnd} hidden />
        </Card>
    );
};

export default AIConsultationCard;
