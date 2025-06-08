import { NextResponse } from "next/server";
import { clearApiKeySession } from "~/lib/api-auth";

export async function POST() {
  try {
    await clearApiKeySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
