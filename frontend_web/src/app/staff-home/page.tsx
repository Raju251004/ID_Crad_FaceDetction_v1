"use client";
import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import styles from './StaffHome.module.css';

export default function StaffHomePage() {
    return (
        <div className="bg-radial min-h-screen">
            <Navigation />

            <main className={styles.container}>
                <div className={`${styles.header} animate-fade`}>
                    <h1 className="outfit">Staff Portal</h1>
                    <p>Personnel Management & Compliance Records</p>
                </div>

                <div className={styles.buttonGrid}>
                    {/* Violations Button */}
                    <Link href="/violations" className={`${styles.actionCard} glass`}>
                        <div className={styles.icon}>⚠️</div>
                        <h2 className="outfit">Compliance Violations</h2>
                        <p>View instances of non-compliance and security breaches.</p>
                        <div className={`${styles.btn} btn btn-primary`}>View Violations</div>
                    </Link>

                    {/* Personnel/Verified Button */}
                    <Link href="/verified" className={`${styles.actionCard} glass`}>
                        <div className={styles.icon}>✅</div>
                        <h2 className="outfit">Verified Personnel</h2>
                        <p>Access records of successfully identified staff and visitors.</p>
                        <div className={`${styles.btn} btn btn-primary`} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            View Personnel
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
