"use client";
import { useEffect, useState } from 'react';
import styles from './StatsCard.module.css';

interface Stats {
    person_count: number;
    violation_count: number;
}

export default function StatsCard() {
    const [stats, setStats] = useState<Stats>({ person_count: 0, violation_count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial stats
        fetchStats();

        // Set up polling every 5 seconds
        const interval = setInterval(fetchStats, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8081/stats');
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    return (
        <div className={styles.statsGrid}>
            <div className={`${styles.statCard} glass`}>
                <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                    👥
                </div>
                <div className={styles.statContent}>
                    <h3>Total Verified</h3>
                    {loading ? (
                        <div className={styles.skeleton}></div>
                    ) : (
                        <p className={styles.statValue} style={{ color: '#10b981' }}>
                            {stats.person_count}
                        </p>
                    )}
                    <span className={styles.statLabel}>Personnel Detected</span>
                </div>
            </div>

            <div className={`${styles.statCard} glass`}>
                <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                    ⚠️
                </div>
                <div className={styles.statContent}>
                    <h3>Total Violations</h3>
                    {loading ? (
                        <div className={styles.skeleton}></div>
                    ) : (
                        <p className={styles.statValue} style={{ color: '#ef4444' }}>
                            {stats.violation_count}
                        </p>
                    )}
                    <span className={styles.statLabel}>Compliance Breaches</span>
                </div>
            </div>

            <div className={`${styles.statCard} glass`}>
                <div className={styles.statIcon} style={{ background: 'rgba(56, 189, 248, 0.2)' }}>
                    📊
                </div>
                <div className={styles.statContent}>
                    <h3>Compliance Rate</h3>
                    {loading ? (
                        <div className={styles.skeleton}></div>
                    ) : (
                        <p className={styles.statValue} style={{ color: '#38bdf8' }}>
                            {stats.person_count > 0
                                ? Math.round((stats.person_count / (stats.person_count + stats.violation_count)) * 100)
                                : 0}%
                        </p>
                    )}
                    <span className={styles.statLabel}>Success Ratio</span>
                </div>
            </div>
        </div>
    );
}
