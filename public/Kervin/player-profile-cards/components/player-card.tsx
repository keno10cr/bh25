import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface PlayerCardProps {
  name: string
  position: string
  number: number
  nationality: string
  age: number
  height: string
  currentClub: {
    name: string
    logo: string
    since: string
  }
  previousClub: {
    name: string
    logo: string
    years: string
  }
  stats: {
    appearances: number
    goals: number
    assists: number
    rating: number
  }
  image: string
}

export function PlayerCard({
  name,
  position,
  number,
  nationality,
  age,
  height,
  currentClub,
  previousClub,
  stats,
  image,
}: PlayerCardProps) {
  return (
    <Card className="overflow-hidden w-full max-w-md border-2">
      {/* Player Header Section */}
      <div className="relative bg-primary text-primary-foreground p-6 pb-20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm font-mono uppercase tracking-wider opacity-90 mb-1">{position}</div>
            <h2 className="text-3xl font-bold tracking-tight text-balance">{name}</h2>
          </div>
          <div className="text-6xl font-bold opacity-20">{number}</div>
        </div>

        <div className="flex gap-4 text-sm">
          <div>
            <div className="opacity-75 text-xs uppercase tracking-wide mb-0.5">Age</div>
            <div className="font-bold">{age}</div>
          </div>
          <div>
            <div className="opacity-75 text-xs uppercase tracking-wide mb-0.5">Height</div>
            <div className="font-bold">{height}</div>
          </div>
          <div>
            <div className="opacity-75 text-xs uppercase tracking-wide mb-0.5">Nationality</div>
            <div className="font-bold">{nationality}</div>
          </div>
        </div>
      </div>

      {/* Player Image */}
      <div className="relative -mt-16 flex justify-center px-6">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-card shadow-xl">
            <AvatarImage src={image || "/placeholder.svg"} alt={name} className="object-cover" />
            <AvatarFallback className="text-3xl font-bold bg-muted text-foreground">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-mono text-xs">
            #{number}
          </Badge>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 pt-8">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.appearances}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Apps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.goals}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.assists}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Assists</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.rating}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Rating</div>
          </div>
        </div>

        {/* Clubs Section */}
        <div className="space-y-4">
          {/* Current Club */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Current Club</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-md bg-card">
                  <AvatarImage src={currentClub.logo || "/placeholder.svg"} alt={currentClub.name} />
                  <AvatarFallback className="rounded-md text-xs font-bold">
                    {currentClub.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-sm">{currentClub.name}</div>
                  <div className="text-xs text-muted-foreground">Since {currentClub.since}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Club */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Previous Club</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-md bg-card">
                  <AvatarImage src={previousClub.logo || "/placeholder.svg"} alt={previousClub.name} />
                  <AvatarFallback className="rounded-md text-xs font-bold">
                    {previousClub.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-sm">{previousClub.name}</div>
                  <div className="text-xs text-muted-foreground">{previousClub.years}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
