"use client";

import type React from "react";
import { useState } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  isLocked?: boolean;
  isPendingResponse?: boolean;
  onStartNewConversation?: () => void;
  botName?: string;
}

export default function MessageInput({
  onSendMessage,
  isLoading,
  disabled = false,
  isLocked = false,
  isPendingResponse = false,
  onStartNewConversation,
  botName,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled && !isLocked) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // כפתורי תגובה מהירה כשהבוט מחכה לתגובה
  const handleQuickResponse = (response: string) => {
    onSendMessage(response);
  };

  if (disabled) {
    return (
      <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
        <div className="text-center text-gray-500 text-sm py-3 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="inline-flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            בחר/י Conversation Starter כדי להתחיל את השיחה
          </div>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-200 mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">
                  השיחה עם {botName} הושלמה בהצלחה! 🌟
                </span>
              </div>
              <p className="text-sm text-green-600">
                כדאי לקחת רגע לעכל את הדברים שעלו בשיחה. אם תרצה/י לחזור ולדבר
                שוב - תמיד אפשר להתחיל מחדש.
              </p>
            </div>
          </div>

          <Button
            onClick={onStartNewConversation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3 px-6 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            התחל שיחה חדשה עם {botName}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* כפתורי תגובה מהירה אם הבוט מחכה לתגובה */}
        {isPendingResponse ? (
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              onClick={() => handleQuickResponse("כן")}
              className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-8 py-3 font-medium transition-colors duration-200 text-lg"
            >
              כן
            </Button>
            <Button
              type="button"
              onClick={() => handleQuickResponse("לא")}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 rounded-2xl px-8 py-3 font-medium transition-colors duration-200 text-lg"
            >
              לא
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="כתוב הודעה..."
                  className="min-h-[50px] max-h-32 resize-none text-sm sm:text-base rounded-3xl border-gray-200 focus:border-blue-400 focus:ring-blue-200 shadow-sm transition-all duration-200 pr-4 pl-4 py-3 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute left-4 bottom-4">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="h-[50px] w-[50px] rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
