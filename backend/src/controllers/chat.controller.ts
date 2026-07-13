import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const chatWithAI = async (
  req: Request,
  res: Response
) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "Invalid messages format",
      });
    }

    const systemPrompt = `
You are an expert AI assistant similar to ChatGPT.

Response Guidelines:
- Always respond using clean Markdown formatting.
- Use headings (##) for sections when appropriate.
- Use bullet points for lists.
- Use numbered lists for step-by-step instructions.
- Use properly formatted code blocks with language identifiers.
- Keep responses concise but complete.
- Prefer practical examples when explaining concepts.
- Avoid excessive repetition and unnecessary filler text.
- Maintain a professional and friendly tone.
- For coding questions, provide production-quality solutions and explain important decisions briefly.
`;

    const conversation = messages
      .map(
        (m: { role: string; content: string }) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    const prompt = `
${systemPrompt}

Conversation History:
${conversation}

Assistant:
`;

    const result = await model.generateContent(prompt);

    const reply = result.response
      .text()
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      message: "Failed to generate AI response",
    });
  }
};