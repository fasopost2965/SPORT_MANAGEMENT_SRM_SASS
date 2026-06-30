import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid crashes if API key is missing during initial start
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, model, systemInstruction } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const modelName = model || "gemini-3.5-flash";
    
    // Prepare contents array
    // history is expected to be an array of { role: 'user' | 'model', parts: [{ text: string }] }
    // We append the new message to history
    const contents = [...(history || [])];
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful professional assistant.",
      }
    });

    res.json({
      text: response.text,
      history: [
        ...contents,
        {
          role: 'model',
          parts: [{ text: response.text }]
        }
      ]
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the Gemini API" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
