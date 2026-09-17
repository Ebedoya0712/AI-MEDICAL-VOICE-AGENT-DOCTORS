const fs = require('fs');
const path = require('path');

// Manually parse .env file
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim();
            }
        });
    }
}

loadEnv();

async function testServices() {
    console.log("--- Testing AI Services Native ---");

    // 1. Test OpenRouter (LLM)
    console.log("\n1. Testing OpenRouter (LLM)...");
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are an AI Medical Triage Assistant. Respond ONLY with a JSON object containing 'displayText' and 'data' fields." },
                    { role: "user", content: "Hi, I'm Sarah, 25. My head hurts." }
                ],
                response_format: { type: "json_object" }
            }),
        });
        const data = await response.json();
        console.log("LLM Response:", JSON.stringify(data.choices[0].message.content, null, 2));
    } catch (err) {
        console.error("LLM Test Failed:", err.message);
    }

    // 2. Test Murf AI (TTS)
    console.log("\n2. Testing Murf AI (TTS)...");
    try {
        const response = await fetch("https://api.murf.ai/v1/speech/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apiKey": process.env.MURF_API_KEY,
            },
            body: JSON.stringify({
                voiceId: "en-US-marcus",
                text: "Hello Sarah, I am your medical assistant. I'm sorry to hear about your head hurting.",
                format: "MP3",
            }),
        });
        const data = await response.json();
        console.log("TTS Response Audio URL:", data.audioFile);
    } catch (err) {
        console.error("TTS Test Failed:", err.message);
    }

    console.log("\n--- Tests Completed ---");
}

testServices();
