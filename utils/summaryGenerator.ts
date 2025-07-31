import type { Message } from "@/types/chat";
import type { BotConfig } from "@/config/bots.config";

export interface ConversationSummary {
  botName: string;
  purpose: string;
  startTime: Date;
  endTime: Date;
  totalMessages: number;
  userMessages: number;
  keyInsights: string[];
  mainTopics: string[];
  summary: string;
}

export class SummaryGenerator {
  static generateSummary(
    messages: Message[],
    botConfig: BotConfig,
    startTime: Date,
    endTime: Date = new Date()
  ): ConversationSummary {
    const userMessages = messages.filter((msg) => msg.role === "user");
    const botMessages = messages.filter((msg) => msg.role === "assistant");

    // חילוץ תובנות מרכזיות מהודעות המשתמש
    const keyInsights = this.extractKeyInsights(userMessages, botConfig);

    // חילוץ נושאים מרכזיים
    const mainTopics = this.extractMainTopics(messages, botConfig);

    // יצירת סיכום כללי
    const summary = this.createSummary(userMessages, botMessages, botConfig);

    return {
      botName: botConfig.name,
      purpose: botConfig.purpose,
      startTime,
      endTime,
      totalMessages: messages.length,
      userMessages: userMessages.length,
      keyInsights,
      mainTopics,
      summary,
    };
  }

  private static extractKeyInsights(
    userMessages: Message[],
    botConfig: BotConfig
  ): string[] {
    const insights: string[] = [];

    // תובנות בסיסיות לפי סוג הבוט
    switch (botConfig.id) {
      case "chozeh-lev":
        insights.push("בניית חזון זוגי אישי ומפורט");
        if (
          userMessages.some(
            (msg) =>
              msg.content.includes("רוצה") || msg.content.includes("חלום")
          )
        ) {
          insights.push("זיהוי רצונות עמוקים בזוגיות");
        }
        break;

      case "filter-mind":
        insights.push("זיהוי אמונות מגבילות בזוגיות");
        if (
          userMessages.some(
            (msg) => msg.content.includes("לא") || msg.content.includes("קשה")
          )
        ) {
          insights.push("עבודה על שחרור מחסמים מנטליים");
        }
        break;

      case "master-mind":
        insights.push("חיזוק יושרה עצמית בקשרים");
        if (
          userMessages.some(
            (msg) =>
              msg.content.includes("פשרה") || msg.content.includes("ויתרתי")
          )
        ) {
          insights.push("זיהוי דפוסי פשרה עצמית");
        }
        break;

      case "asserti-voice":
        insights.push("פיתוח אסרטיביות רגשית");
        if (
          userMessages.some(
            (msg) =>
              msg.content.includes("קשה לי") || msg.content.includes("לא אמרתי")
          )
        ) {
          insights.push("עבודה על ביטוי עצמי אמיץ");
        }
        break;

      case "detoxa":
        insights.push("ניקוי מחשבות ודפוסים מזיקים");
        if (
          userMessages.some(
            (msg) =>
              msg.content.includes("תמיד") || msg.content.includes("אף פעם")
          )
        ) {
          insights.push("זיהוי דפוסי חשיבה קיצוניים");
        }
        break;

      case "love-craft":
        insights.push("איזון בין עצמאות לקירבה");
        if (
          userMessages.some(
            (msg) =>
              msg.content.includes("חופש") || msg.content.includes("קירבה")
          )
        ) {
          insights.push("עבודה על הרמוניה זוגית");
        }
        break;
    }

    return insights;
  }

  private static extractMainTopics(
    messages: Message[],
    botConfig: BotConfig
  ): string[] {
    const topics: string[] = [];
    const allText = messages
      .map((msg) => msg.content)
      .join(" ")
      .toLowerCase();

    // נושאים כלליים
    if (
      allText.includes("זוגיות") ||
      allText.includes("קשר") ||
      allText.includes("אהבה")
    ) {
      topics.push("זוגיות ואהבה");
    }
    if (
      allText.includes("ביטחון") ||
      allText.includes("פחד") ||
      allText.includes("חרדה")
    ) {
      topics.push("ביטחון עצמי");
    }
    if (
      allText.includes("עבר") ||
      allText.includes("אקס") ||
      allText.includes("פציעה")
    ) {
      topics.push("עיבוד עבר רגשי");
    }
    if (
      allText.includes("עתיד") ||
      allText.includes("חלום") ||
      allText.includes("רוצה")
    ) {
      topics.push("חזון עתידי");
    }

    return topics.length > 0 ? topics : ["פיתוח אישי", "צמיחה רגשית"];
  }

  private static createSummary(
    userMessages: Message[],
    botMessages: Message[],
    botConfig: BotConfig
  ): string {
    const userResponsesCount = userMessages.length;
    const avgResponseLength =
      userMessages.reduce((sum, msg) => sum + msg.content.length, 0) /
      userMessages.length;

    let summary = `בשיחה עם ${
      botConfig.name
    } עברת תהליך של ${botConfig.purpose.toLowerCase()}. `;

    if (userResponsesCount >= 5) {
      summary += "השתתפת בפעילות רבה ונתת תשובות מפורטות. ";
    } else if (userResponsesCount >= 3) {
      summary += "השתתפת בתהליך באופן פעיל. ";
    } else {
      summary += "התחלת את התהליך. ";
    }

    if (avgResponseLength > 50) {
      summary +=
        "התשובות שלך היו מעמיקות ומפורטות, מה שמעיד על מעורבות אמיתית בתהליך. ";
    }

    summary += `המטרה של השיחה הזו הייתה ${botConfig.purpose.toLowerCase()}, וזה צעד חשוב במסע האישי שלך לקראת זוגיות בריאה ומספקת.`;

    return summary;
  }

  static formatSummaryForDisplay(summary: ConversationSummary): string {
    const duration = Math.round(
      (summary.endTime.getTime() - summary.startTime.getTime()) / (1000 * 60)
    );

    return `
🌟 **סיכום השיחה עם ${summary.botName}**

📅 **תאריך:** ${summary.startTime.toLocaleDateString("he-IL")}
⏱️ **משך השיחה:** ${duration} דקות
💬 **סה"כ הודעות:** ${summary.totalMessages} (${summary.userMessages} שלך)

🎯 **מטרת השיחה:**
${summary.purpose}

💡 **תובנות מרכזיות:**
${summary.keyInsights.map((insight) => `• ${insight}`).join("\n")}

📋 **נושאים שעלו:**
${summary.mainTopics.map((topic) => `• ${topic}`).join("\n")}

📝 **סיכום:**
${summary.summary}

---
💖 **זכור/י:** כל צעד שלקחת היום מקרב אותך לאהבה שמגיעה לך באמת.
    `.trim();
  }
}
