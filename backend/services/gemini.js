import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// console.log("Gemini Key:", process.env.GEMINI_API_KEY);

// Convert file to base64
export const fileToBase64 = (filePath) =>
  new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data.toString("base64"));
    });
  });

// Generate transcript
export const generateTranscript = async (audioFilePath) => {
  try {
    const base64Audio = await fileToBase64(audioFilePath);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe this audio into plain text only (no summary):" },
            {
              inline_data: {
                mime_type: "audio/wav",
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Error generating transcript:", error);
    return "Transcription failed.";
  }
};

// Generate summary
export const generateSummary = async (transcriptText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Summarize the following transcript clearly and concisely:\n\n${transcriptText}`,
            },
          ],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Summary generation failed.";
  }
};
