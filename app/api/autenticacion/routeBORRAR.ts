/*

// app/api/auth/route.ts
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/app/dashboard/session/session";



export async function POST(request: Request) {
  const session = await getIronSession(request, NextResponse.next(), sessionOptions);

  // Lógica de autenticación aquí
  session.user = { id: 1, email: "user@example.com", role: "user" }; // Ejemplo
  await session.save();

  return NextResponse.json({ success: true });
}*/