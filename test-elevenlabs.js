const apiKey = "sk_40b8d4a80692c0288aa15ba7394ec572551db33ef324a749";

// Common pre-made voices
const voicesToTest = [
  { name: "Rachel (Legacy)", id: "21m00Tcm4TlvDq8ikWAM" },
  { name: "Rachel (New)", id: "cgSgspJ2msm6clMCmAsc" },
  { name: "Bella", id: "EXAVITQu4vr4xnSDxMaL" },
  { name: "Adam", id: "pNInz6obpgHsOHSWgWqQ" },
  { name: "Antoni", id: "ErXwobaYiN019PkySvjV" },
  { name: "Josh", id: "TxGEqn7nUa67jQY63181" },
  { name: "Nicole", id: "piTKgcLEGmPEeTo7G3vs" }
];

async function testVoices() {
  for (const voice of voicesToTest) {
    try {
      console.log(`Testing voice: ${voice.name} (${voice.id})...`);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Olá! Testando conexão de áudio.",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      console.log(`  -> Status for ${voice.name}:`, response.status);
      if (response.ok) {
        console.log(`  -> SUCCESS! Voice ${voice.name} (${voice.id}) works!`);
      } else {
        const errText = await response.text();
        console.error(`  -> Error details:`, errText.trim());
      }
    } catch (err) {
      console.error(`  -> Exception:`, err);
    }
    console.log("-----------------------------------------");
  }
}

testVoices();
