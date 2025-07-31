import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BotConfig } from "@/config/bots.config";

interface BotHeaderProps {
  botConfig: BotConfig;
}

export default function BotHeader({ botConfig }: BotHeaderProps) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* לוגו העסק למעלה */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="/images/logo-fibi.webp"
            alt="פיבי דקל - חיבורים של אהבה"
            width={120}
            height={120}
            className="object-contain w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
          />
        </div>

        {/* תמונת הבוט + שם הבוט */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* תמונת הבוט בקטן */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full ${botConfig.color} p-1 shadow-lg flex-shrink-0`}
          >
            <div className="w-full h-full bg-white rounded-full p-1">
              <Image
                src={botConfig.avatarUrl || "/placeholder.svg"}
                alt={botConfig.name}
                width={56}
                height={56}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* שם הבוט ליד התמונה */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {botConfig.title}
            </h1>
          </div>
        </div>
        {/* תיאור הבוט + כפתור PDF */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
          {/* תיאור הבוט */}
          <div className="flex-1 text-right">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {botConfig.description}
            </p>
          </div>

          {/* כפתור הורדת PDF */}
          {botConfig.pdfDownloadUrl && (
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 px-3 py-2 sm:px-4 sm:py-2 text-sm whitespace-nowrap flex-shrink-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <a href={botConfig.pdfDownloadUrl} download>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">הורד מדריך PDF</span>
                <span className="sm:hidden">PDF</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
