import { notFound } from "next/navigation";
import { bots } from "@/config/bots.config";
import ChatBot from "@/components/ChatBot";

interface BotPageProps {
  params: {
    botId: string;
  };
}

export async function generateStaticParams() {
  return bots.map((bot) => ({
    botId: bot.id,
  }));
}

export default async function BotPage({ params }: BotPageProps) {
  const { botId } = await params;
  const bot = bots.find((b) => b.id === botId);

  if (!bot) {
    notFound();
  }

  return <ChatBot config={bot} />;
}
export async function generateMetadata({ params }: BotPageProps) {
  const { botId } = await params;
  const bot = bots.find((b) => b.id === botId);

  if (!bot) {
    return {
      title: "בוט לא נמצא",
    };
  }

  return {
    title: bot.title,
    description: bot.description,
  };
}
