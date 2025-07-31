import { type NextRequest, NextResponse } from "next/server";
import {
  StatsManagerRedis,
  type StatsUpdateType,
} from "@/lib/statsManagerRedis";

export async function GET() {
  try {
    const statsManager = StatsManagerRedis.getInstance();
    const stats = await statsManager.readStats();

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to read stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // בדיקת תקינות הבקשה
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { botId, botName, type, inputText, outputText } = body;

    // בדיקת שדות חובה
    if (!botId || typeof botId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid botId" },
        { status: 400 }
      );
    }

    if (!botName || typeof botName !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid botName" },
        { status: 400 }
      );
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid type" },
        { status: 400 }
      );
    }

    // בדיקת תקינות סוג העדכון
    const validTypes: StatsUpdateType[] = [
      "conversation_start",
      "user_message",
      "conversation_completed",
    ];
    if (!validTypes.includes(type as StatsUpdateType)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const statsManager = StatsManagerRedis.getInstance();
    const updatedStats = await statsManager.updateStats(
      botId,
      botName,
      type as StatsUpdateType,
      inputText,
      outputText
    );

    return NextResponse.json({
      success: true,
      stats: updatedStats,
      message: `Successfully updated ${type} for ${botName}`,
    });
  } catch (error) {
    console.error("POST /api/stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to update stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
