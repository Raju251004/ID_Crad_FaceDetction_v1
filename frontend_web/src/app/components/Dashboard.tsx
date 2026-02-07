"use client";
import { useState } from "react";
import Navigation from "./Navigation";
import StatsCard from "./StatsCard";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [isStreaming, setIsStreaming] = useState(false);

  const toggleFeed = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <div className={styles.dashboard}>
      <Navigation />

      <main className={styles.content}>
        <div className={styles.mainSection}>
          <StatsCard />

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Live Intelligence Feed</h2>
              <button
                onClick={toggleFeed}
                className={`${styles.feedButton} ${isStreaming ? styles.active : ""}`}
              >
                {isStreaming ? (
                  <>
                    <span className={styles.pulse}></span>
                    Terminate Feed
                  </>
                ) : (
                  "Initialize Monitoring"
                )}
              </button>
            </div>

            <div className={styles.videoContainer}>
              {isStreaming ? (
                <img
                  src="http://localhost:8081/video_feed"
                  alt="Live Stream"
                  className={styles.streamImage}
                />
              ) : (
                <div className={styles.placeholder}>
                  <div className={styles.placeholderIcon}>🔒</div>
                  <p>System Standby</p>
                  <span>Click "Initialize Monitoring" to begin the live detection stream</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.statCard}>
            <h3>Active Protocols</h3>
            <p className={styles.statValue}>V3.0.4</p>
          </div>
          <div className={styles.statCard}>
            <h3>Server Status</h3>
            <p className={styles.statValue} style={{ color: '#10b981' }}>Online</p>
          </div>
          <div className={`${styles.statCard} ${styles.compliance}`}>
            <h3>Deployment Mode</h3>
            <p className={styles.statValue}>Automated Tracking</p>
          </div>
        </div>
      </main>
    </div>
  );
}
