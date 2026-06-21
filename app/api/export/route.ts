import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "CSV export will be available in Phase 4." },
    { status: 501 }
  );
}
