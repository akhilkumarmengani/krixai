import { chatWithAI } from "@/lib/ai";

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const result = await chatWithAI(message, history || []);

    return Response.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { success: false, text: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
