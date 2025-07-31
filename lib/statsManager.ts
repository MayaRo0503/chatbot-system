import { promises as fs } from "fs";
import path from "path";

// מחירי GPT-4o-mini (לפי $1M טוקנים)
const GPT_4O_MINI_PRICING = {
  input: 0.15, // $0.15 per 1M input tokens
  output: 0.6, // $0.60 per 1M output tokens
};

export interface BotStats {
  name: string;
  conversationStarts: number;
  userMessages: number;
  completedConversations: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  totalCost: number;
}

export interface StatsData {
  [botId: string]: BotStats;
}

export type StatsUpdateType =
  | "conversation_start"
  | "user_message"
  | "conversation_completed";

export class StatsManager {
  private static instance: StatsManager;
  private statsFilePath: string;

  private constructor() {
    this.statsFilePath = path.join(process.cwd(), "data", "stats.json");
  }

  public static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager();
    }
    return StatsManager.instance;
  }

  // פונקציה להערכת מספר טוקנים (4 תווים = 1 טוקן בערך)
  private estimateTokens(text: string): number {
    if (!text || typeof text !== "string") return 0;
    return Math.ceil(text.length / 4);
  }

  // פונקציה לחישוב עלות
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * GPT_4O_MINI_PRICING.input;
    const outputCost = (outputTokens / 1_000_000) * GPT_4O_MINI_PRICING.output;
    return inputCost + outputCost;
  }

  // יצירת בוט חדש בסטטיסטיקות
  private createNewBotStats(botName: string): BotStats {
    return {
      name: botName,
      conversationStarts: 0,
      userMessages: 0,
      completedConversations: 0,
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      totalCost: 0,
    };
  }

  // וידוא שהתיקייה קיימת
  private async ensureDirectoryExists(): Promise<void> {
    const dir = path.dirname(this.statsFilePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
      throw new Error("Failed to create stats directory");
    }
  }

  // קריאת סטטיסטיקות מהקובץ
  public async readStats(): Promise<StatsData> {
    try {
      await this.ensureDirectoryExists();
      const data = await fs.readFile(this.statsFilePath, "utf8");
      const parsed = JSON.parse(data);

      // וידוא שהמבנה תקין
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid stats file format");
      }

      return parsed;
    } catch (error) {
      console.log("Stats file not found or invalid, creating new one");
      const defaultStats: StatsData = {};
      await this.writeStats(defaultStats);
      return defaultStats;
    }
  }

  // כתיבת סטטיסטיקות לקובץ
  public async writeStats(stats: StatsData): Promise<void> {
    try {
      await this.ensureDirectoryExists();
      const jsonData = JSON.stringify(stats, null, 2);
      await fs.writeFile(this.statsFilePath, jsonData, "utf8");
    } catch (error) {
      console.error("Error writing stats file:", error);
      throw new Error("Failed to write stats file");
    }
  }

  // עדכון סטטיסטיקות
  public async updateStats(
    botId: string,
    botName: string,
    type: StatsUpdateType,
    inputText?: string,
    outputText?: string
  ): Promise<BotStats> {
    try {
      const stats = await this.readStats();

      // אם הבוט לא קיים, צור אותו
      if (!stats[botId]) {
        stats[botId] = this.createNewBotStats(botName);
      }

      // עדכן לפי סוג הפעולה
      switch (type) {
        case "conversation_start":
          stats[botId].conversationStarts += 1;
          if (inputText && outputText) {
            const inputTokens = this.estimateTokens(inputText);
            const outputTokens = this.estimateTokens(outputText);
            stats[botId].estimatedInputTokens += inputTokens;
            stats[botId].estimatedOutputTokens += outputTokens;
            stats[botId].totalCost += this.calculateCost(
              inputTokens,
              outputTokens
            );
          }
          break;

        case "user_message":
          stats[botId].userMessages += 1;
          if (inputText && outputText) {
            const inputTokens = this.estimateTokens(inputText);
            const outputTokens = this.estimateTokens(outputText);
            stats[botId].estimatedInputTokens += inputTokens;
            stats[botId].estimatedOutputTokens += outputTokens;
            stats[botId].totalCost += this.calculateCost(
              inputTokens,
              outputTokens
            );
          }
          break;

        case "conversation_completed":
          stats[botId].completedConversations += 1;
          break;

        default:
          throw new Error(`Invalid update type: ${type}`);
      }

      await this.writeStats(stats);
      return stats[botId];
    } catch (error) {
      console.error("Error updating stats:", error);
      throw new Error("Failed to update stats");
    }
  }
}
