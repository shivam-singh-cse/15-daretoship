import { NextRequest, NextResponse } from "next/server";
import { sendBuilderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, kind, name } = await request.json();

    if (!email || !kind) {
      return NextResponse.json({ error: "Missing email or kind" }, { status: 400 });
    }

    const result = await sendBuilderEmail(email, kind, name);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
