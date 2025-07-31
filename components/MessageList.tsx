import type { Message } from "@/types/chat"
import BotAvatar from "./BotAvatar"
import type { BotConfig } from "@/config/bots.config"
import { User } from "lucide-react"
import type { RefObject } from "react"

interface MessageListProps {
  messages: Message[]
  botConfig: BotConfig
  messagesContainerRef: RefObject<HTMLDivElement>
  messagesEndRef: RefObject<HTMLDivElement>
}

export default function MessageList({ messages, botConfig, messagesContainerRef, messagesEndRef }: MessageListProps) {
  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white/50 backdrop-blur-sm"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <BotAvatar avatarUrl={botConfig.avatarUrl} name={botConfig.name} color={botConfig.color} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">{botConfig.name}</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{botConfig.description}</p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              מוכן לשיחה
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 mt-1">
                  <BotAvatar avatarUrl={botConfig.avatarUrl} name={botConfig.name} color={botConfig.color} />
                </div>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-3xl px-4 sm:px-5 py-3 sm:py-4 shadow-sm transition-all duration-200 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-lg"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-lg"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-end mt-2">
                  <span className={`text-xs ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                    {message.timestamp.toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  )
}
