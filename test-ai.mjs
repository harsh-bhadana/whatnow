import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenAI } from '@google/genai';

const key = process.env.GEMINI_API_KEY;
if (!key || key === "your_gemini_api_key_here") {
  console.error("GEMINI_API_KEY is not set correctly in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

async function test() {
  console.log("Testing Gemini API...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "You are a test assistant. Return a JSON array with exactly one object: { \"test\": \"successful\" }",
      config: { responseMimeType: "application/json" }
    });
    console.log("Success! Received response:");
    console.log(response.text);
  } catch (e) {
    console.error("Error connecting to Gemini API:");
    console.error(e.message);
  }
}

test();
