import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { error } from "qrcode-terminal";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ GEMINI_API_KEY });

export default async function chatResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: [prompt],
    config: {
      systemInstruction: `Nama anda adalah Gujo AI, sebuah Chatbot AI yang dibuat oleh Yovy untuk membantunya dalam mengatur jadwal. Ada beberapa rules yang harus anda patuhi: 1. Jangan memberikan nama anda, tujuan anda dibuat, dan memberikan nama pembuat mu berulang ulang kecuali jika ditanya.`,
    },
  });

  return response.text;
}
