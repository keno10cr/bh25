"use client";

import { useState } from "react";
import styles from "./player-card.module.css";

export default function PlayerCard({ player }) {
  const [imageError, setImageError] = useState(false);
  const [currentClubLogoError, setCurrentClubLogoError] = useState(false);
  const [previousClubLogoError, setPreviousClubLogoError] = useState(false);

  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className={styles.card}>
      {/* Player Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.position}>{player.position}</div>
            <h2 className={styles.name}>{player.name}</h2>
          </div>
          <div className={styles.number}>{player.number}</div>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Age</div>
            <div className={styles.infoValue}>{player.age}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Height</div>
            <div className={styles.infoValue}>{player.height}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Nationality</div>
            <div className={styles.infoValue}>{player.nationality}</div>
          </div>
        </div>
      </div>

      {/* Player Image */}
      <div className={styles.imageSection}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {!imageError ? (
              <img
                src={player.image || "/placeholder-user.jpg"}
                alt={player.name}
                className={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            ) : null}
            {imageError && (
              <div className={styles.avatarFallback}>
                {initials}
              </div>
            )}
          </div>
          <div className={styles.badge}>#{player.number}</div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{player.stats.appearances}</div>
            <div className={styles.statLabel}>Apps</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{player.stats.goals}</div>
            <div className={styles.statLabel}>Goals</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{player.stats.assists}</div>
            <div className={styles.statLabel}>Assists</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{player.stats.rating}</div>
            <div className={styles.statLabel}>Rating</div>
          </div>
        </div>

        {/* Clubs Section */}
        <div className={styles.clubsSection}>
          {/* Current Club */}
          <div className={styles.clubCard}>
            <div className={styles.clubLabel}>Current Club</div>
            <div className={styles.clubInfo}>
              <div className={styles.clubLogo}>
                {!currentClubLogoError ? (
                  <img
                    src={player.currentClub.logo || "/placeholder-logo.png"}
                    alt={player.currentClub.name}
                    className={styles.clubLogoImage}
                    onError={() => setCurrentClubLogoError(true)}
                  />
                ) : null}
                {currentClubLogoError && (
                  <div className={styles.clubLogoFallback}>
                    {player.currentClub.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.clubDetails}>
                <div className={styles.clubName}>{player.currentClub.name}</div>
                <div className={styles.clubSince}>Since {player.currentClub.since}</div>
              </div>
            </div>
          </div>

          {/* Previous Club */}
          <div className={styles.clubCardPrevious}>
            <div className={styles.clubLabel}>Previous Club</div>
            <div className={styles.clubInfo}>
              <div className={styles.clubLogo}>
                {!previousClubLogoError ? (
                  <img
                    src={player.previousClub.logo || "/placeholder-logo.png"}
                    alt={player.previousClub.name}
                    className={styles.clubLogoImage}
                    onError={() => setPreviousClubLogoError(true)}
                  />
                ) : null}
                {previousClubLogoError && (
                  <div className={styles.clubLogoFallback}>
                    {player.previousClub.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.clubDetails}>
                <div className={styles.clubName}>{player.previousClub.name}</div>
                <div className={styles.clubSince}>{player.previousClub.years}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

