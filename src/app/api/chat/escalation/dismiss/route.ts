import { NextRequest, NextResponse } from "next/server";
import { getSessionState, saveSessionState } from "@/lib/intelligence/analyzeConversation";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const state = await getSessionState(sessionId);
    if (state && state.subIntent === "escalation") {
      state.subIntent = null;
      await saveSessionState(sessionId, state);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
