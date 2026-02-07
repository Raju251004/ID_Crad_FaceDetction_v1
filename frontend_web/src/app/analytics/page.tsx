"use client";

import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { ViolationsTrendChart, CompliancePieChart, HourlyActivityChart } from './Charts';
import styles from './analytics.module.css';

interface AnalyticsData {
    trend: any[];
    hourly: any[];
    pie: any[];
}

interface StatsData {
    total_detections: number;
    compliance_rate: string;
    violations: number;
    active_cameras: number;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, statsRes] = await Promise.all([
                    fetch('http://localhost:8081/analytics/data'),
                    fetch('http://localhost:8081/stats')
                ]);

                if (analyticsRes.ok) {
                    const aData = await analyticsRes.json();
                    setAnalytics(aData);
                }
                if (statsRes.ok) {
                    const sData = await statsRes.json();
                    setStats(sData);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Derived Stats
    const totalViolations7d = analytics?.trend.reduce((acc, curr) => acc + curr.violations, 0) || 0;
    const activePersonnel = 315; // Mock for now, or use total_detections maybe?

    if (loading && !analytics) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Analytics...</div>;
    }

    return (
        <div className={styles.container}>
            <Navigation />

            {/* Header */}
            <header className={`${styles.header} animate-fade`}>
                <div>
                    <h1 className={`${styles.title} outfit`}>Analytics Dashboard</h1>
                    <p className={styles.subtitle}>Real-time insights and compliance trends</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn glass text-sm" onClick={() => window.location.reload()}>Refresh Data</button>
                    <button className="btn btn-primary text-sm">Download Report</button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className={`${styles.statsGrid} animate-fade-up`}>
                <div className={styles.statCard}>
                    <p className={styles.statTitle}>Total Violations (7d)</p>
                    <p className={styles.statValue}>{totalViolations7d}</p>
                    <div className={styles.trend}>
                        <span className="text-gray-400">Recorded across all cameras</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <p className={styles.statTitle}>Compliance Rate</p>
                    <p className={styles.statValue}>{stats?.compliance_rate || "0%"}</p>
                    <div className={styles.trend}>
                        <span className={styles.trendUp}>Based on {stats?.total_detections || 0} checks</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <p className={styles.statTitle}>Total Logged Violations</p>
                    <p className={styles.statValue}>{stats?.violations || 0}</p>
                    <div className={styles.trend}>
                        <span className="text-red-400">All time</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <p className={styles.statTitle}>Active Cameras</p>
                    <p className={styles.statValue}>{stats?.active_cameras || 1}</p>
                    <div className={styles.trend}>
                        <span className={styles.trendUp}>● Online</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className={`${styles.chartsGrid} animate-fade-up`} style={{ animationDelay: '0.1s' }}>

                {/* Main Trend Chart */}
                <div className={`${styles.chartCard} ${styles.colSpan12}`}>
                    <div className={styles.chartHeader}>
                        <h2 className={styles.chartTitle}>Violations vs Verification Trend (Last 7 Days)</h2>
                    </div>
                    {/* Render Chart */}
                    {analytics && <ViolationsTrendChart data={analytics.trend} />}
                </div>

                {/* Pie Chart */}
                <div className={`${styles.chartCard} ${styles.colSpan4}`}>
                    <div className={styles.chartHeader}>
                        <h2 className={styles.chartTitle}>Identified vs Unknown</h2>
                    </div>
                    {analytics && <CompliancePieChart data={analytics.pie} />}
                </div>

                {/* Bar Chart */}
                <div className={`${styles.chartCard} ${styles.colSpan8}`}>
                    <div className={styles.chartHeader}>
                        <h2 className={styles.chartTitle}>Hourly Violation Activity</h2>
                    </div>
                    {analytics && <HourlyActivityChart data={analytics.hourly} />}
                </div>

            </div>
        </div>
    );
}
