"use client";

import { useState, useRef, useEffect } from "react";
import type { BotConfig, ConversationStarter } from "@/config/bots.config";
import type { Message } from "@/types/chat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import BotHeader from "./BotHeader";
import ConversationStarters from "./ConversationStarters";
import { ChatStorageManager, type ChatSession } from "@/utils/chatStorage";
import {
  SummaryGenerator,
  type ConversationSummary,
} from "@/utils/summaryGenerator";
import SummaryDisplay from "./SummaryDisplay";

interface ChatBotProps {
  config: BotConfig;
}

// מילות מפתח לזיהוי שאלות שמחכות לתגובה (לא סוגרות שיחה מיד)
const PENDING_RESPONSE_KEYWORDS = [
  "רוצה שאשלח לך את כל מה שכתבת",
  "רוצה לשמוע עוד",
  "רוצה שאשלח לך סיכום",
];

// פונקציה לבדיקה אם הבוט מחכה לתגובה
function isPendingResponse(botResponse: string): boolean {
  return PENDING_RESPONSE_KEYWORDS.some((keyword) =>
    botResponse.includes(keyword)
  );
}

// פונקציה לעדכון סטטיסטיקות עם טיפול בשגיאות
async function updateStats(
  botId: string,
  botName: string,
  type: "conversation_start" | "user_message" | "conversation_completed",
  inputText?: string,
  outputText?: string
) {
  try {
    const response = await fetch("/api/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        botId,
        botName,
        type,
        inputText,
        outputText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Stats API error:", errorData);
      return;
    }

    const result = await response.json();
    console.log("Stats updated successfully:", result.message);
  } catch (error) {
    console.error("Error updating stats:", error);
    // לא נזרוק שגיאה כדי לא לשבור את הצ'אט
  }
}

export default function ChatBot({ config }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationLocked, setConversationLocked] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [waitingForFinalResponse, setWaitingForFinalResponse] = useState(false);
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [conversationSummary, setConversationSummary] =
    useState<ConversationSummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // פונקציה לגלילה אוטומטית למטה - תמיד כמו WhatsApp
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // גלילה אוטומטית למטה כשיש הודעה חדשה - כמו WhatsApp
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages]);

  // טעינת סשן קיים בעת טעינת הקומפוננטה
  useEffect(() => {
    try {
      const existingSession = ChatStorageManager.getSession(config.id);
      if (existingSession && !existingSession.isCompleted) {
        setCurrentSession(existingSession);
        setMessages(existingSession.messages);
        setConversationStarted(true);
        setConversationLocked(existingSession.isLocked || false);
        setSelectedGender(existingSession.gender || null);

        // בדיקה אם ההודעה האחרונה של הבוט מחכה לתגובה
        const lastMessage =
          existingSession.messages[existingSession.messages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          setPendingResponse(isPendingResponse(lastMessage.content));
        }

        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error("Error loading existing session:", error);
    }
  }, [config.id]);

  const saveCurrentSession = (updatedMessages: Message[], locked = false) => {
    try {
      const session: ChatSession = {
        botId: config.id,
        messages: updatedMessages,
        startTime: currentSession?.startTime || new Date(),
        gender: selectedGender || undefined,
        isCompleted: false,
        isLocked: locked,
      };

      setCurrentSession(session);
      ChatStorageManager.saveSession(config.id, session);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleStarterClick = async (starter: ConversationStarter) => {
    setConversationStarted(true);
    setConversationLocked(false);
    setPendingResponse(false);
    setWaitingForFinalResponse(false);
    setError(null);

    if (starter.gender) {
      setSelectedGender(starter.gender);
    }

    const newSession: ChatSession = {
      botId: config.id,
      messages: [],
      startTime: new Date(),
      gender: starter.gender,
      isCompleted: false,
      isLocked: false,
    };
    setCurrentSession(newSession);

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [],
          systemPrompt: config.systemPrompt,
          starterMessage: starter.text,
          gender: starter.gender,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      const updatedMessages = [assistantMessage];
      setMessages(updatedMessages);
      saveCurrentSession(updatedMessages);

      // בדיקה אם הבוט מחכה לתגובה
      setPendingResponse(isPendingResponse(data.reply));

      // עדכון סטטיסטיקות - התחלת שיחה עם טקסטים לחישוב טוקנים
      const inputText = config.systemPrompt + " " + starter.text;
      await updateStats(
        config.id,
        config.name,
        "conversation_start",
        inputText,
        data.reply
      );
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("מצטער, אירעה שגיאה בהתחלת השיחה. אנא נסה שוב.");
      setConversationStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveCurrentSession(updatedMessages);
    setIsLoading(true);

    // אם המשתמש ענה "כן" או "לא" לשאלה - מסמן שמחכים לתגובה סופית
    if (
      pendingResponse &&
      (content.trim() === "כן" || content.trim() === "לא")
    ) {
      setWaitingForFinalResponse(true);
      setPendingResponse(false);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          systemPrompt: config.systemPrompt,
          gender: selectedGender,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // אם חיכינו לתגובה סופית - נועל את השיחה אוטומטית
      if (waitingForFinalResponse) {
        setConversationLocked(true);
        setWaitingForFinalResponse(false);
        saveCurrentSession(finalMessages, true);
        ChatStorageManager.markSessionCompleted(config.id);

        // יצירת סיכום שיחה
        if (content.trim() === "כן") {
          const summary = SummaryGenerator.generateSummary(
            finalMessages,
            config,
            currentSession?.startTime || new Date(),
            new Date()
          );
          setConversationSummary(summary);
          setShowSummary(true);
        }

        // עדכון סטטיסטיקות - שיחה הושלמה
        await updateStats(config.id, config.name, "conversation_completed");
      }
      // אם הבוט מחכה לתגובה (שאלה ביניים)
      else if (isPendingResponse(data.reply)) {
        setPendingResponse(true);
        saveCurrentSession(finalMessages);
      }
      // אחרת - המשך שיחה רגילה
      else {
        setPendingResponse(false);
        saveCurrentSession(finalMessages);
      }

      // עדכון סטטיסטיקות - הודעת משתמש עם טקסטים לחישוב טוקנים
      const inputText =
        config.systemPrompt +
        " " +
        updatedMessages.map((m) => m.content).join(" ");
      await updateStats(
        config.id,
        config.name,
        "user_message",
        inputText,
        data.reply
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError("מצטער, אירעה שגיאה בשליחת ההודעה. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setShowSummary(false);
    setConversationSummary(null);
    ChatStorageManager.clearSession(config.id);
    setMessages([]);
    setConversationStarted(false);
    setConversationLocked(false);
    setPendingResponse(false);
    setWaitingForFinalResponse(false);
    setSelectedGender(null);
    setCurrentSession(null);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setConversationStarted(false);
  };

  // מחיקת השיחה כשסוגרים את הטאב/דפדפן
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!conversationLocked) {
        ChatStorageManager.clearSession(config.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [config.id, conversationLocked]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <BotHeader botConfig={config} />

      <div className="w-full max-w-5xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] md:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
          {!conversationStarted ? (
            <ConversationStarters
              starters={config.conversationStarters}
              onStarterClick={handleStarterClick}
            />
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 border border-red-100">
                {error}
              </div>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                נסה שוב
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <MessageList
                messages={messages}
                botConfig={config}
                messagesContainerRef={messagesContainerRef}
                messagesEndRef={messagesEndRef}
              />
              <MessageInput
                onSendMessage={sendMessage}
                isLoading={isLoading}
                disabled={false}
                isLocked={conversationLocked}
                isPendingResponse={pendingResponse}
                onStartNewConversation={handleStartNewConversation}
                botName={config.name}
              />
            </div>
          )}
        </div>
      </div>
      {showSummary && conversationSummary && (
        <SummaryDisplay
          summary={conversationSummary}
          onClose={() => setShowSummary(false)}
          onStartNewConversation={() => {
            setShowSummary(false);
            handleStartNewConversation();
          }}
        />
      )}
    </div>
  );
}
