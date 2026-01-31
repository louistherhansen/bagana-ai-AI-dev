import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

const SYSTEM_PROMPT = `You are BAGANA AI, an AI assistant that helps agencies create clear PRD (Product Requirements Document) and MRD (Market Requirements Document) for client campaigns and internal projects.

You guide users through structured requirements discovery using the AAMAD framework. Ask clarifying questions, gather requirements step by step, and help produce complete, executive-ready documents.

For MVP, focus on PRD creation. Guide users through: problem statement, user personas, functional requirements, success metrics, and acceptance criteria.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.messages ?? body;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "OPENAI_API_KEY is not configured. Add it to .env.local to enable chat.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: openai("gpt-4o-mini") as any,
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[api/chat]", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
