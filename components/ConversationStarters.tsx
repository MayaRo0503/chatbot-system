"use client";

import { Button } from "@/components/ui/button";
import type { ConversationStarter } from "@/config/bots.config";

interface ConversationStartersProps {
  starters: ConversationStarter[];
  onStarterClick: (starter: ConversationStarter) => void;
}

export default function ConversationStarters({
  starters,
  onStarterClick,
}: ConversationStartersProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 h-full bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">
          Conversation Starters
        </h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
          בחר/י אופציה כדי להתחיל את השיחה
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md md:max-w-lg">
        {starters.map((starter) => (
          <Button
            key={starter.id}
            onClick={() => onStarterClick(starter)}
            variant="outline"
            className="p-4 sm:p-5 md:p-6 h-auto text-right whitespace-normal text-wrap border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm sm:text-base md:text-lg leading-relaxed shadow-sm hover:shadow-md rounded-xl"
          >
            {starter.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
