import Image from "next/image"

interface BotAvatarProps {
  avatarUrl: string
  name: string
  color: string
}

export default function BotAvatar({ avatarUrl, name, color }: BotAvatarProps) {
  return (
    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${color} p-0.5 shadow-lg flex-shrink-0`}>
      <div className="w-full h-full bg-white rounded-full p-1">
        <Image
          src={avatarUrl || "/placeholder.svg"}
          alt={name}
          width={32}
          height={32}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    </div>
  )
}
