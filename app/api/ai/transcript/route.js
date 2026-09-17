// NEXT JS - AI TRANSCRIPT ROUTE

import { NextResponse } from "next/server";
import { STT_SERVICE, LLM_SERVICE } from "@/lib/services/ai-service";

export async function POST(req) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let transcript = "";
        let history = [];

        if (contentType.includes("application/json")) {
            const body = await req.json();
            transcript = body.text || "";
            history = body.history || [];
        } else {
            const formData = await req.formData();
            const audioBlob = formData.get("audio");
            const historyJson = formData.get("history");
            history = historyJson ? JSON.parse(historyJson) : [];

            if (!audioBlob) {
                console.error("TRANSCRIPT API: No audio blob received");
                return NextResponse.json({ error: "No audio provided" }, { status: 400 });
            }
            console.log("TRANSCRIPT API: Received audio blob. Size:", audioBlob.size);

            // 1. STT: Transcribe audio
            transcript = await STT_SERVICE.transcribe(audioBlob);
        }

        console.log("TRANSCRIPT API: Final transcript:", transcript);

        let aiResponse;
        if (!transcript || transcript.trim().length === 0) {
            console.warn("TRANSCRIPT API: Empty transcript generated, returning retry prompt");
            aiResponse = {
                displayText: "I'm sorry, I didn't quite catch that. Could you please repeat what you said?",
                status: "Listening",
                data: { isComplete: false }
            };
            return NextResponse.json({
                userText: "(No speech detected)",
                aiResponse: aiResponse,
            });
        }

        // 2. LLM: Get AI response based on transcript and history
        aiResponse = await LLM_SERVICE.getResponse(transcript, history);

        return NextResponse.json({
            userText: transcript,
            aiResponse: aiResponse,
        });
    } catch (error) {
        console.error("Transcript API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
