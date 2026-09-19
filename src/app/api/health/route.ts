import { NextResponse } from "next/server";
import { pingDatabase } from "@/db";

// Envelope de resposta conforme PROJECT_SPEC §18. Nunca expõe stack trace nem
// detalhes de conexão; o erro real vai apenas para o log do servidor.
export async function GET() {
  try {
    await pingDatabase();
    return NextResponse.json({
      data: { status: "ok", database: "up" },
      meta: {},
    });
  } catch (error) {
    console.error("[health] falha ao verificar o banco de dados", error);
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Banco de dados indisponível",
        },
      },
      { status: 503 },
    );
  }
}
