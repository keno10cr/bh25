"use client";

import { useState, useEffect, useRef } from "react";
import PlayerCard from "@/components/player-card";
import styles from "./kbh.module.css";

// Player data - 9 variations using the same images
const players = [
  {
    id: 1,
    name: "Marcus Silva",
    position: "Forward",
    number: 9,
    nationality: "Brazil",
    age: 27,
    height: "6'1\"",
    currentClub: {
      name: "Manchester City",
      logo: "/Kervin/images/generic-football-club-badge.png",
      since: "2022",
    },
    previousClub: {
      name: "FC Barcelona",
      logo: "/Kervin/images/barcelona-crest.png",
      years: "2018-2022",
    },
    stats: {
      appearances: 89,
      goals: 54,
      assists: 23,
      rating: 8.4,
    },
    image: "/Kervin/images/professional-soccer-player.png",
  },
  {
    id: 2,
    name: "Emma Hansen",
    position: "Midfielder",
    number: 10,
    nationality: "Norway",
    age: 25,
    height: "5'7\"",
    currentClub: {
      name: "Bayern Munich",
      logo: "/Kervin/images/football-club-badge.png",
      since: "2023",
    },
    previousClub: {
      name: "Lyon Féminin",
      logo: "/Kervin/images/lyon-football-logo.jpg",
      years: "2019-2023",
    },
    stats: {
      appearances: 42,
      goals: 18,
      assists: 31,
      rating: 8.7,
    },
    image: "/Kervin/images/female-soccer-player-portrait.png",
  },
  {
    id: 3,
    name: "Jamal Thompson",
    position: "Defender",
    number: 4,
    nationality: "England",
    age: 29,
    height: "6'3\"",
    currentClub: {
      name: "Liverpool FC",
      logo: "/Kervin/images/liverpool-fc-logo.png",
      since: "2021",
    },
    previousClub: {
      name: "Chelsea FC",
      logo: "/Kervin/images/chelsea-fc-logo.png",
      years: "2017-2021",
    },
    stats: {
      appearances: 112,
      goals: 7,
      assists: 12,
      rating: 7.9,
    },
    image: "/Kervin/images/soccer-defender-portrait.jpg",
  },
  {
    id: 4,
    name: "Carlos Rodriguez",
    position: "Forward",
    number: 11,
    nationality: "Spain",
    age: 24,
    height: "5'10\"",
    currentClub: {
      name: "Real Madrid",
      logo: "/Kervin/images/generic-football-club-badge.png",
      since: "2023",
    },
    previousClub: {
      name: "Atletico Madrid",
      logo: "/Kervin/images/football-club-badge.png",
      years: "2020-2023",
    },
    stats: {
      appearances: 67,
      goals: 38,
      assists: 19,
      rating: 8.2,
    },
    image: "/Kervin/images/professional-soccer-player.png",
  },
  {
    id: 5,
    name: "Sophie Laurent",
    position: "Midfielder",
    number: 8,
    nationality: "France",
    age: 26,
    height: "5'8\"",
    currentClub: {
      name: "PSG",
      logo: "/Kervin/images/football-club-badge.png",
      since: "2022",
    },
    previousClub: {
      name: "Lyon Féminin",
      logo: "/Kervin/images/lyon-football-logo.jpg",
      years: "2018-2022",
    },
    stats: {
      appearances: 95,
      goals: 22,
      assists: 45,
      rating: 8.5,
    },
    image: "/Kervin/images/female-soccer-player-portrait.png",
  },
  {
    id: 6,
    name: "David Anderson",
    position: "Defender",
    number: 5,
    nationality: "Scotland",
    age: 28,
    height: "6'2\"",
    currentClub: {
      name: "Celtic FC",
      logo: "/Kervin/images/generic-football-club-badge.png",
      since: "2021",
    },
    previousClub: {
      name: "Rangers FC",
      logo: "/Kervin/images/football-club-badge.png",
      years: "2016-2021",
    },
    stats: {
      appearances: 134,
      goals: 12,
      assists: 18,
      rating: 8.0,
    },
    image: "/Kervin/images/soccer-defender-portrait.jpg",
  },
  {
    id: 7,
    name: "Luis Fernandez",
    position: "Forward",
    number: 7,
    nationality: "Argentina",
    age: 23,
    height: "5'11\"",
    currentClub: {
      name: "Boca Juniors",
      logo: "/Kervin/images/generic-football-club-badge.png",
      since: "2024",
    },
    previousClub: {
      name: "River Plate",
      logo: "/Kervin/images/football-club-badge.png",
      years: "2021-2024",
    },
    stats: {
      appearances: 78,
      goals: 42,
      assists: 15,
      rating: 8.3,
    },
    image: "/Kervin/images/professional-soccer-player.png",
  },
  {
    id: 8,
    name: "Anna Berg",
    position: "Midfielder",
    number: 6,
    nationality: "Sweden",
    age: 27,
    height: "5'9\"",
    currentClub: {
      name: "Arsenal WFC",
      logo: "/Kervin/images/football-club-badge.png",
      since: "2022",
    },
    previousClub: {
      name: "FC Barcelona",
      logo: "/Kervin/images/barcelona-crest.png",
      years: "2019-2022",
    },
    stats: {
      appearances: 88,
      goals: 19,
      assists: 38,
      rating: 8.6,
    },
    image: "/Kervin/images/female-soccer-player-portrait.png",
  },
  {
    id: 9,
    name: "Michael O'Brien",
    position: "Defender",
    number: 3,
    nationality: "Ireland",
    age: 30,
    height: "6'0\"",
    currentClub: {
      name: "Leicester City",
      logo: "/Kervin/images/generic-football-club-badge.png",
      since: "2020",
    },
    previousClub: {
      name: "Burnley FC",
      logo: "/Kervin/images/football-club-badge.png",
      years: "2015-2020",
    },
    stats: {
      appearances: 156,
      goals: 9,
      assists: 21,
      rating: 7.8,
    },
    image: "/Kervin/images/soccer-defender-portrait.jpg",
  },
];

export default function KBHPage() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const playersRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const items = playersRef.current?.querySelectorAll("[data-player-item]");
    items?.forEach((item) => observer.observe(item));

    return () => {
      items?.forEach((item) => observer.unobserve(item));
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Kervin Kenton</h1>
        <p>This is the list of our international players</p>
      </div>

      <div className={styles.grid} ref={playersRef}>
        {players.map((player, index) => (
          <div
            key={player.id}
            data-player-item
            data-id={player.id}
            className={`${styles.playerWrapper} ${
              visibleItems.has(String(player.id)) ? styles.visible : ""
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PlayerCard player={player} />
          </div>
        ))}
      </div>
    </div>
  );
}


