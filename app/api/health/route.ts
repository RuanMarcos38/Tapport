import { prisma } from "@/lib/prisma";
import { isMailConfigured } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`select 1`;

    return Response.json(
      {
        status: "ok",
        database: "ok",
        mail: isMailConfigured() ? "configured" : "not_configured",
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch {
    return Response.json(
      {
        status: "error",
        database: "unavailable",
        timestamp: new Date().toISOString()
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
