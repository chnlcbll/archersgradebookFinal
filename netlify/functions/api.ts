import express from "express";
import serverless from "serverless-http";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();

// Middleware to parse JSON with a larger limit for base64 images/pdfs
app.use(express.json({ limit: '50mb' }));

app.post("/api/extract-syllabus", async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Missing file data" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          }
        },
        "Extract the subject name and grading criteria (with their percentage weights) from this syllabus. Ensure the total weights sum up to exactly 100. If you can't find a subject name, use 'Untitled Subject'."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjectName: { type: Type.STRING },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const data = JSON.parse(text);
      res.json(data);
    } else {
      res.status(500).json({ error: "Failed to generate content" });
    }
  } catch (error) {
    console.error("Error extracting syllabus:", error);
    res.status(500).json({ error: "Internal server error during extraction" });
  }
});

export const handler = serverless(app);
