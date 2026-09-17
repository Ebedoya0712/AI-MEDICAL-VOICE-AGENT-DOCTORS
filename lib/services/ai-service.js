export const STT_SERVICE = {
    async transcribe(audioBlob) {
        if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {
            throw new Error("AssemblyAI API Key is missing");
        }

        console.log("STT: Starting upload. Blob size:", audioBlob.size);
        const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
            method: "POST",
            headers: {
                authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
            },
            body: audioBlob,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            console.error("STT: Upload failed:", errorData);
            throw new Error(`AssemblyAI Upload Error: ${uploadResponse.status} ${errorData}`);
        }

        const uploadData = await uploadResponse.json();
        const uploadUrl = uploadData.upload_url;
        console.log("STT: Audio uploaded to:", uploadUrl);

        const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
            method: "POST",
            headers: {
                authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                audio_url: uploadUrl,
                speech_models: ["universal-3-pro", "universal-2"]
            }),
        });

        if (!transcriptResponse.ok) {
            const errorData = await transcriptResponse.text();
            console.error("STT: Transcription start failed:", errorData);
            throw new Error(`AssemblyAI Transcription Start Error: ${transcriptResponse.status} ${errorData}`);
        }

        const transcriptData = await transcriptResponse.json();
        const transcriptId = transcriptData.id;
        
        if (!transcriptId) {
            console.error("STT: No transcript ID returned in response:", transcriptData);
            throw new Error("AssemblyAI failed to provide a transcript ID");
        }
        
        console.log("STT: Transcription started. ID:", transcriptId);

        // Polling for completion
        let status = "queued";
        let pollingData;
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max

        while (status !== "completed" && status !== "error" && attempts < maxAttempts) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: {
                    authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
                },
            });

            if (!pollingResponse.ok) {
                console.error(`STT: Polling error on attempt ${attempts}:`, pollingResponse.status);
                continue; // Try again unless maxAttempts is reached
            }

            pollingData = await pollingResponse.json();
            status = pollingData.status;
            console.log(`STT: Polling status (Attempt ${attempts}):`, status);
        }

        if (status === "error") {
            console.error("STT: AssemblyAI error detail:", pollingData.error);
            throw new Error(`AssemblyAI transcription failed: ${pollingData.error}`);
        }

        if (attempts >= maxAttempts && status !== "completed") {
            throw new Error("AssemblyAI transcription timed out after 60 seconds");
        }

        console.log("STT: Transcription complete. Text:", pollingData.text);
        return pollingData.text || "";
    },
};

export const LLM_SERVICE = {
    async getResponse(transcript, history = []) {
        if (!process.env.OPEN_ROUTER_API_KEY) {
            throw new Error("OpenRouter API Key is missing");
        }

        const systemPrompt = `You are Dr. AI Assistant, an experienced and empathetic AI medical triage doctor.

Your role is to conduct a structured medical intake conversation, analyze symptoms, provide possible causes, give safe health guidance, and optionally recommend consulting a real doctor when appropriate.

IMPORTANT: You are NOT a replacement for a licensed physician. Your goal is triage and guidance, not diagnosis.

--------------------------------------------------
CONVERSATION OBJECTIVES
--------------------------------------------------

1. Collect patient information gradually through conversation.

You MUST collect:
• Patient Name
• Patient Age
• Main symptom or health concern
• Duration of symptoms
• Severity level (1–10)
• Any related symptoms
• Any known medical conditions
• Current medications (if relevant)

Ask ONE question at a time.

--------------------------------------------------
MEDICAL REASONING
--------------------------------------------------

After understanding the symptoms, you should:

• Identify possible causes of the condition
• Explain them in simple language
• Suggest safe home-care or lifestyle advice
• Recommend monitoring if symptoms persist

Do NOT make definitive diagnoses. Only discuss possible causes.

--------------------------------------------------
DOCTOR RECOMMENDATION RULES
--------------------------------------------------

You may suggest consulting a real doctor when:

• Symptoms are severe
• Symptoms persist for a long time
• The condition may require professional diagnosis
• The user explicitly asks for a doctor

When suggesting a doctor:
• Mention the recommended specialist type
• Do NOT end the conversation
• Continue answering user questions

Example:
"This may be related to gastritis. If the pain continues, consulting a gastroenterologist would be helpful. Would you like help finding a doctor?"

--------------------------------------------------
EMERGENCY RULE
--------------------------------------------------

If symptoms indicate a medical emergency (severe chest pain, breathing difficulty, stroke symptoms, uncontrolled bleeding, etc.):

Set severity to "Emergency" and advise immediate medical attention.

Example:
"Your symptoms may require urgent medical care. Please seek immediate medical attention or visit the nearest emergency room."

--------------------------------------------------
CONVERSATION STYLE
--------------------------------------------------

• Be warm, professional, and reassuring
• Use the patient's name once known
• Explain medical ideas in simple terms
• Encourage follow-up questions
• Keep the conversation active
• Do NOT end consultation early

You should continue assisting the user even after recommending a doctor.

--------------------------------------------------
CONSULTATION COMPLETION RULE
--------------------------------------------------

Only set "isComplete": true when:

• The user clearly indicates they are finished
OR
• The user confirms they will proceed with doctor consultation
OR
• The user says they no longer need assistance

Otherwise keep the consultation active.

--------------------------------------------------
MEDICAL CLASSIFICATION
--------------------------------------------------

Categorize symptoms into one of these departments:

General Medicine  
Cardiology  
Dermatology  
Endocrinology  
Gastroenterology  
Neurology  
Obstetrics & Gynecology  
Oncology  
Ophthalmology  
Orthopedics  
Pediatrics  
Psychiatry  
Pulmonology  
Radiology  
Urology  
Emergency

Assign severity:

Low  
Medium  
High  
Emergency

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Respond ONLY in valid JSON using this structure:

{
  "displayText": "Your empathetic doctor response that will be spoken to the user.",
  "status": "Listening" | "Processing" | "Speaking",
  "data": {
    "userName": "string | null",
    "userAge": "number | null",
    "department": "string | null",
    "severity": "Low" | "Medium" | "High" | "Emergency",
    "summary": "Short summary of symptoms",
    "possibleCauses": "Explain possible causes of the symptoms in simple language",
    "suggestedSpecialist": "Type of doctor if consultation might help",
    "report": "Detailed medical summary of the conversation so far",
    "feedback": "Health advice, lifestyle suggestions, and next steps",
    "isComplete": false
  }
}

Always respond strictly in JSON.`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: transcript },
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: messages,
                response_format: { type: "json_object" },
            }),
        });

        const data = await response.json();
        console.log("LLM: OpenRouter raw response:", JSON.stringify(data));

        if (!data.choices || data.choices.length === 0) {
            console.error("LLM: No choices in response", data);
            throw new Error(data.error?.message || "OpenRouter AI returned no response.");
        }

        const content = data.choices[0].message.content;
        try {
            return typeof content === 'string' ? JSON.parse(content.trim()) : content;
        } catch (parseError) {
            console.error("LLM: Failed to parse JSON content:", content);
            console.error("LLM: Parse error detailed:", parseError);

            // Safe fallback to prevent crash
            return {
                displayText: "I'm having a bit of trouble processing that. Could you please say it again?",
                status: "Listening",
                data: { isComplete: false }
            };
        }
    },
};

export const TTS_SERVICE = {
    async getAudio(text) {
        console.log("TTS: Requested text:", text);
        if (!text) throw new Error("TTS Error: No text provided");
        if (!process.env.MURF_API_KEY) {
            throw new Error("Murf AI API Key is missing");
        }

        const response = await fetch("https://api.murf.ai/v1/speech/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.MURF_API_KEY,
            },
            body: JSON.stringify({
                voiceId: "en-UK-peter",
                text: text,
                format: "mp3",
                speed: 1.0,
                pitch: 0,
                sampleRate: 44100
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            const errorText = await response.text();
            console.error("TTS: Failed to parse JSON. Murf AI raw error:", errorText);
            throw new Error(`Murf AI Error (${response.status}): ${errorText || response.statusText}`);
        }

        if (!response.ok) {
            console.error("TTS: Murf AI error status:", response.status);
            console.error("TTS: Murf AI error response data:", JSON.stringify(data));
            throw new Error(`Murf AI Generate Error: ${data.message || data.error || response.statusText}`);
        }

        return data.audioFile;
    },
};
