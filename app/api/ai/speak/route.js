// NEXT JS - AI SPEAK ROUTE

import { NextResponse } from "next/server";
import { TTS_SERVICE } from "@/lib/services/ai-service";

export async function POST(req) {
    try {
        const { text } = await req.json();
        console.log("SPEAK API: Request received for text:", text);

        if (!text) {
            console.error("SPEAK API: No text provided in request body");
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const audioUrl = await TTS_SERVICE.getAudio(text);

        return NextResponse.json({ audioUrl });
    } catch (error) {
        console.error("Speak API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
