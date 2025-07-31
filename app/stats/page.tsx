"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  BarChart3,
  Users,
  MessageSquare,
  DollarSign,
  Zap,
  CheckCircle,
} from "lucide-react";

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

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError("שגיאה בטעינת הסטטיסטיקות");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalConversations = Object.values(stats).reduce(
    (sum, bot) => sum + bot.conversationStarts,
    0
  );
  const totalMessages = Object.values(stats).reduce(
    (sum, bot) => sum + bot.userMessages,
    0
  );
  const totalCompleted = Object.values(stats).reduce(
    (sum, bot) => sum + bot.completedConversations,
    0
  );
  const totalTokens = Object.values(stats).reduce(
    (sum, bot) => sum + bot.estimatedInputTokens + bot.estimatedOutputTokens,
    0
  );
  const totalCost = Object.values(stats).reduce(
    (sum, bot) => sum + bot.totalCost,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">טוען סטטיסטיקות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* כותרת */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            סטטיסטיקות בוטים
          </h1>
          <p className="text-gray-600">
            מעקב אחרי שימוש ועלויות טוקנים - GPT-4o-mini
          </p>
        </div>

        {/* כפתור רענון */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={fetchStats}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className="w-4 h-4" />
            רענן נתונים
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* סיכום כללי */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ בוטים</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ שיחות</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                שיחות הושלמו
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalCompleted}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ הודעות</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ טוקנים</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTokens.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ עלות</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
            </CardContent>
          </Card>
        </div>

        {/* מידע על מחירי GPT-4o-mini */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              מחירי GPT-4o-mini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">
                  טוקני קלט (Input)
                </div>
                <div className="text-green-600">$0.15 לכל מיליון טוקנים</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-800">
                  טוקני יציאה (Output)
                </div>
                <div className="text-blue-600">$0.60 לכל מיליון טוקנים</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* טבלת בוטים */}
        <Card>
          <CardHeader>
            <CardTitle>פירוט לפי בוט</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium">
                      שם הבוט
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      התחלות שיחה
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      שיחות הושלמו
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      הודעות משתמש
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      טוקני קלט
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      טוקני יציאה
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      עלות כוללת
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      % השלמה
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats).map(([botId, botStats]) => {
                    const completionRate =
                      botStats.conversationStarts > 0
                        ? (
                            (botStats.completedConversations /
                              botStats.conversationStarts) *
                            100
                          ).toFixed(1)
                        : "0";

                    return (
                      <tr key={botId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {botStats.name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {botStats.conversationStarts}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-green-600 font-medium">
                            {botStats.completedConversations}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {botStats.userMessages}
                        </td>
                        <td className="py-3 px-4 text-center text-green-600">
                          {botStats.estimatedInputTokens.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-blue-600">
                          {botStats.estimatedOutputTokens.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          ${botStats.totalCost.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-medium ${
                              Number.parseFloat(completionRate) >= 70
                                ? "text-green-600"
                                : Number.parseFloat(completionRate) >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {completionRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {Object.keys(stats).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                אין נתונים זמינים עדיין
              </div>
            )}
          </CardContent>
        </Card>

        {/* הערות */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">הערות חשובות:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>שיחות הושלמו:</strong> שיחות שהגיעו לסיום טבעי לפי
              הוראות הבוט
            </li>
            <li>
              • <strong>% השלמה:</strong> אחוז השיחות שהושלמו מתוך כלל השיחות
              שהתחילו
            </li>
            <li>
              • <strong>הערכת טוקנים:</strong> החישוב מבוסס על הערכה של 4 תווים
              = 1 טוקן
            </li>
            <li>
              • <strong>מודל:</strong> GPT-4o-mini ($0.15 קלט + $0.60 יציאה לכל
              מיליון טוקנים)
            </li>
            <li>
              • <strong>צבעים:</strong> ירוק = טוקני קלט, כחול = טוקני יציאה,
              ירוק = שיחות הושלמו
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
