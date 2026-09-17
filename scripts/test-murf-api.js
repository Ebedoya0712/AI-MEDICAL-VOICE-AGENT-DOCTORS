const fs = require('fs');
const path = require('path');

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

async function testMurf() {
    const apiKey = process.env.MURF_API_KEY;
    console.log("Testing with API Key:", apiKey ? "Present" : "Missing");

    console.log("\n1. Generating Token from /v1/auth/token...");
    let authToken = "";
    try {
        const response = await fetch("https://api.murf.ai/v1/auth/token", {
            method: "GET",
            headers: { "api-key": apiKey }
        });
        console.log("Token Status:", response.status);
        if (response.ok) {
            authToken = await response.text();
            // Remove quotes if any
            authToken = authToken.replace(/"/g, '');
            console.log("Successfully generated token:", authToken.substring(0, 10) + "...");
        } else {
            const err = await response.text();
            console.log("Token Error Body:", err);
        }
    } catch (e) {
        console.error("Token Request failed:", e.message);
    }

    if (authToken) {
        const tryAuth = async (label, headers) => {
            console.log(`\n--- Testing ${label} Auth ---`);
            try {
                const voiceResponse = await fetch("https://api.murf.ai/v1/speech/voices", { headers });
                console.log(`Voices Status (${label}):`, voiceResponse.status);

                const genResponse = await fetch("https://api.murf.ai/v1/speech/generate", {
                    method: "POST",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        voiceId: "en-US-marcus",
                        text: "Hello, testing Murf AI auth."
                    })
                });
                console.log(`Generate Status (${label}):`, genResponse.status);
                if (!genResponse.ok) {
                    console.log(`Generate Error Body (${label}):`, await genResponse.text());
                } else {
                    const data = await genResponse.json();
                    console.log(`Generate Success! Audio URL:`, data.audioFile);
                }
            } catch (e) {
                console.error(`${label} Auth Request failed:`, e.message);
            }
        };

        await tryAuth("token header", { "token": authToken });
        await tryAuth("Bearer header", { "Authorization": `Bearer ${authToken}` });
        await tryAuth("api-key header directly", { "api-key": apiKey });
    }
}

testMurf();
