import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STATS_FILE_PATH = path.join(process.cwd(), "data", "stats.json");

// מחירי GPT-4o-mini (לפי $1M טוקנים)
const GPT_4O_MINI_PRICING = {
  input: 0.15, // $0.15 per 1M input tokens
  output: 0.6, // $0.60 per 1M output tokens
};

interface BotStats {
  name: string;
  conversationStarts: number;
  userMessages: number;
  completedConversations: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  totalCost: number;
}

interface StatsData {
  [botId: string]: BotStats;
}

// פונקציה להערכת מספר טוקנים (4 תווים = 1 טוקן בערך)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// פונקציה לחישוב עלות
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * GPT_4O_MINI_PRICING.input;
  const outputCost = (outputTokens / 1_000_000) * GPT_4O_MINI_PRICING.output;
  return inputCost + outputCost;
}

async function readStats(): Promise<StatsData> {
  try {
    const data = await fs.readFile(STATS_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading stats file:", error);
    return {};
  }
}

async function writeStats(stats: StatsData): Promise<void> {
  try {
    const dir = path.dirname(STATS_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(STATS_FILE_PATH, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error("Error writing stats file:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const stats = await readStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: "Failed to read stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { botId, botName, type, inputText, outputText } =
      await request.json();

    if (!botId || !botName || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const stats = await readStats();

    // אם הבוט לא קיים, צור אותו
    if (!stats[botId]) {
      stats[botId] = {
        name: botName,
        conversationStarts: 0,
        userMessages: 0,
        completedConversations: 0,
        estimatedInputTokens: 0,
        estimatedOutputTokens: 0,
        totalCost: 0,
      };
    }

    // עדכן לפי סוג הפעולה
    if (type === "conversation_start") {
      stats[botId].conversationStarts += 1;

      // הערכת טוקנים להתחלת שיחה (system prompt + starter message)
      if (inputText && outputText) {
        const inputTokens = estimateTokens(inputText);
        const outputTokens = estimateTokens(outputText);

        stats[botId].estimatedInputTokens += inputTokens;
        stats[botId].estimatedOutputTokens += outputTokens;

        const cost = calculateCost(inputTokens, outputTokens);
        stats[botId].totalCost += cost;
      }
    } else if (type === "user_message") {
      stats[botId].userMessages += 1;

      // הערכת טוקנים להודעת משתמש
      if (inputText && outputText) {
        const inputTokens = estimateTokens(inputText);
        const outputTokens = estimateTokens(outputText);

        stats[botId].estimatedInputTokens += inputTokens;
        stats[botId].estimatedOutputTokens += outputTokens;

        const cost = calculateCost(inputTokens, outputTokens);
        stats[botId].totalCost += cost;
      }
    } else if (type === "conversation_completed") {
      stats[botId].completedConversations += 1;
    }

    await writeStats(stats);

    return NextResponse.json({ success: true, stats: stats[botId] });
  } catch (error) {
    console.error("POST /api/stats error:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
