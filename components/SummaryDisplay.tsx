"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle, X } from "lucide-react";
import type { ConversationSummary } from "@/utils/summaryGenerator";
import { SummaryGenerator } from "@/utils/summaryGenerator";

interface SummaryDisplayProps {
  summary: ConversationSummary;
  onClose: () => void;
  onStartNewConversation: () => void;
}

export default function SummaryDisplay({
  summary,
  onClose,
  onStartNewConversation,
}: SummaryDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formattedSummary = SummaryGenerator.formatSummaryForDisplay(summary);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedSummary], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `סיכום_שיחה_${summary.botName}_${summary.startTime
      .toLocaleDateString("he-IL")
      .replace(/\//g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              סיכום השיחה
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* מידע כללי */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">פרטי השיחה</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">בוט:</span>
                  <span className="mr-2">{summary.botName}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">תאריך:</span>
                  <span className="mr-2">
                    {summary.startTime.toLocaleDateString("he-IL")}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">משך:</span>
                  <span className="mr-2">
                    {Math.round(
                      (summary.endTime.getTime() -
                        summary.startTime.getTime()) /
                        (1000 * 60)
                    )}{" "}
                    דקות
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">הודעות:</span>
                  <span className="mr-2">
                    {summary.totalMessages} (שלך: {summary.userMessages})
                  </span>
                </div>
              </div>
            </div>

            {/* מטרת השיחה */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                🎯 מטרת השיחה
              </h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {summary.purpose}
              </p>
            </div>

            {/* תובנות מרכזיות */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                💡 תובנות מרכזיות
              </h3>
              <ul className="space-y-2">
                {summary.keyInsights.map((insight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-600"
                  >
                    <span className="text-green-500 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* נושאים מרכזיים */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                📋 נושאים שעלו
              </h3>
              <div className="flex flex-wrap gap-2">
                {summary.mainTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* סיכום */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                📝 סיכום
              </h3>
              <p className="text-gray-600 leading-relaxed bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
                {summary.summary}
              </p>
            </div>

            {/* הודעת עידוד */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100 text-center">
              <p className="text-gray-700 font-medium">
                💖 זכור/י: כל צעד שלקחת היום מקרב אותך לאהבה שמגיעה לך באמת.
              </p>
            </div>
          </div>
        </CardContent>

        <div className="border-t bg-gray-50 p-4 flex gap-3 justify-center">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "הועתק!" : "העתק טקסט"}
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            הורד קובץ
          </Button>

          <Button
            onClick={onStartNewConversation}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            התחל שיחה חדשה
          </Button>
        </div>
      </Card>
    </div>
  );
}
