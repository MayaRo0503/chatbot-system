import { createClient } from "redis";

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

const STATS_KEY = "chatbot_stats";

export class StatsManagerRedis {
  private static instance: StatsManagerRedis;
  private client: ReturnType<typeof createClient> | null = null;

  private constructor() {}

  public static getInstance(): StatsManagerRedis {
    if (!StatsManagerRedis.instance) {
      StatsManagerRedis.instance = new StatsManagerRedis();
    }
    return StatsManagerRedis.instance;
  }

  // יצירת חיבור ל-Redis
  private async getClient() {
    if (!this.client) {
      if (!process.env.REDIS_URL) {
        throw new Error("REDIS_URL environment variable is not set");
      }

      this.client = createClient({
        url: process.env.REDIS_URL,
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      await this.client.connect();
      console.log("Connected to Redis successfully");
    }

    return this.client;
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

  // קריאת סטטיסטיקות מ-Redis
  public async readStats(): Promise<StatsData> {
    try {
      const client = await this.getClient();
      const statsJson = await client.get(STATS_KEY);

      if (!statsJson) {
        console.log("No stats found in Redis, creating default stats");
        const defaultStats: StatsData = {};
        await this.writeStats(defaultStats);
        return defaultStats;
      }

      const stats = JSON.parse(statsJson);

      if (!stats || typeof stats !== "object") {
        throw new Error("Invalid stats format in Redis");
      }

      return stats;
    } catch (error) {
      console.error("Error reading stats from Redis:", error);
      throw new Error("Failed to read stats from Redis");
    }
  }

  // כתיבת סטטיסטיקות ל-Redis
  public async writeStats(stats: StatsData): Promise<void> {
    try {
      const client = await this.getClient();
      const statsJson = JSON.stringify(stats);
      await client.set(STATS_KEY, statsJson);
      console.log("Stats successfully written to Redis");
    } catch (error) {
      console.error("Error writing stats to Redis:", error);
      throw new Error("Failed to write stats to Redis");
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
      console.log(`Stats updated for ${botName}: ${type}`);
      return stats[botId];
    } catch (error) {
      console.error("Error updating stats:", error);
      throw new Error("Failed to update stats");
    }
  }

  // איפוס סטטיסטיקות (לצורכי פיתוח)
  public async resetStats(): Promise<void> {
    try {
      const defaultStats: StatsData = {
        "chozeh-lev": this.createNewBotStats("חוזה-לב"),
        "filter-mind": this.createNewBotStats("Filter Mind"),
        "master-mind": this.createNewBotStats("Master Mind"),
        "asserti-voice": this.createNewBotStats("AssertiVoice"),
        detoxa: this.createNewBotStats("Detoxa"),
        "love-craft": this.createNewBotStats("LoveCraft"),
      };

      await this.writeStats(defaultStats);
      console.log("Stats reset successfully");
    } catch (error) {
      console.error("Error resetting stats:", error);
      throw new Error("Failed to reset stats");
    }
  }

  // סגירת החיבור (לצורכי cleanup)
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      console.log("Disconnected from Redis");
    }
  }
}
