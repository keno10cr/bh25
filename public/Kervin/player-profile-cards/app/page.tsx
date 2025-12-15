import { PlayerCard } from "@/components/player-card"

export default function Home() {
  const players = [
    {
      name: "Marcus Silva",
      position: "Forward",
      number: 9,
      nationality: "Brazil",
      age: 27,
      height: "6'1\"",
      currentClub: {
        name: "Manchester City",
        logo: "/generic-football-club-badge.png",
        since: "2022",
      },
      previousClub: {
        name: "FC Barcelona",
        logo: "/barcelona-crest.png",
        years: "2018-2022",
      },
      stats: {
        appearances: 89,
        goals: 54,
        assists: 23,
        rating: 8.4,
      },
      image: "/professional-soccer-player.png",
    },
    {
      name: "Emma Hansen",
      position: "Midfielder",
      number: 10,
      nationality: "Norway",
      age: 25,
      height: "5'7\"",
      currentClub: {
        name: "Bayern Munich",
        logo: "/football-club-badge.png",
        since: "2023",
      },
      previousClub: {
        name: "Lyon Féminin",
        logo: "/lyon-football-logo.jpg",
        years: "2019-2023",
      },
      stats: {
        appearances: 42,
        goals: 18,
        assists: 31,
        rating: 8.7,
      },
      image: "/female-soccer-player-portrait.png",
    },
    {
      name: "Jamal Thompson",
      position: "Defender",
      number: 4,
      nationality: "England",
      age: 29,
      height: "6'3\"",
      currentClub: {
        name: "Liverpool FC",
        logo: "/liverpool-fc-logo.png",
        since: "2021",
      },
      previousClub: {
        name: "Chelsea FC",
        logo: "/chelsea-fc-logo.png",
        years: "2017-2021",
      },
      stats: {
        appearances: 112,
        goals: 7,
        assists: 12,
        rating: 7.9,
      },
      image: "/soccer-defender-portrait.jpg",
    },
  ]

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3 text-balance">Player Profiles</h1>
          <p className="text-muted-foreground text-lg">{"Comprehensive stats and career information"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {players.map((player) => (
            <PlayerCard key={player.name} {...player} />
          ))}
        </div>
      </div>
    </main>
  )
}
