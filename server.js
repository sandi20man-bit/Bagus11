import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// untuk static file (frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const HEYGEN_KEY = process.env.HEYGEN_API_KEY;

app.post("/api/chat", async (req, res) => {
  const { text } = req.body;

  // 1. ChatGPT
  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
    }),
  });
  const gptData = await gptRes.json();
  const reply = gptData.choices[0].message.content;

  // 2. ElevenLabs (audio)
  const voiceId = "YOUR_VOICE_ID"; // ganti dengan voice id di dashboard ElevenLabs
  const ttsRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: reply }),
    }
  );
  const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
  // NOTE: untuk demo cepat, kita langsung pakai text di HeyGen (bisa juga upload audio ini ke storage)

  // 3. HeyGen (Talking Avatar)
  const heygenRes = await fetch("https://api.heygen.com/v1/talkingPhoto/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HEYGEN_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      photo_url: "https://yourdomain.com/avatar.jpg", // ganti dengan URL foto kamu
      text: reply,
      voice: "en_us_male", // bisa diganti dengan opsi suara HeyGen
    }),
  });
  const heygenData = await heygenRes.json();
  const videoUrl = heygenData.data.video_url;

  res.json({ reply, video: videoUrl });
});

app.listen(3000, () => console.log("✅ Server jalan di http://localhost:3000"));
  
