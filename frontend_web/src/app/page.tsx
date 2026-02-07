"use client";
import React from 'react';
import Link from 'next/link';
import styles from './Landing.module.css';

export default function LandingPage() {
    return (
        <div className={`bg-radial min-h-screen ${styles.landing}`}>
            {/* Navigation */}
            <nav className={`${styles.nav} glass`}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🛡️</span>
                        <span className="outfit font-bold text-xl">ID-Intel V3</span>
                    </div>
                    <div className={styles.navLinks}>
                        <Link href="#features" className={styles.navLink}>Features</Link>
                        <Link href="#about" className={styles.navLink}>About</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className="animate-fade">
                        <span className={styles.badge}>Next-Gen Compliance Monitoring</span>
                        <h1 className={`${styles.title} outfit`}>
                            Intelligent ID Card <br />
                            <span className={styles.gradientText}>Compliance System</span>
                        </h1>
                        <p className={styles.description}>
                            Enhance workplace security with real-time AI-powered ID card detection,
                            facial recognition, and automated protocol tracking.
                        </p>

                        <div className={styles.ctaGroup}>
                            <Link href="#login-portal" className="btn btn-primary">
                                Access Portals
                            </Link>
                            <Link href="#about" className="btn btn-outline">
                                Watch Demo
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={`${styles.visualPlate} glass pulse-border animate-fade`}>
                        <div className={styles.scanningLine}></div>
                        <div className={styles.mockInterface}>
                            <div className={styles.mockHeader}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                            <div className={styles.mockContent}>
                                <div className={styles.mockRow}></div>
                                <div className={styles.mockRow}></div>
                                <div className={styles.mockRow}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Login Portal Section */}
            <section id="login-portal" className={styles.portalSection}>
                <div className={styles.sectionHeader}>
                    <h2 className="outfit">Select Your Portal</h2>
                    <p>Choose the specialized access point for your department</p>
                </div>

                <div className={styles.portalGrid}>
                    {/* Admin Card */}
                    <div className={`${styles.portalCard} glass`}>
                        <div className={styles.portalIcon}>⚙️</div>
                        <h3 className="outfit">Admin Panel</h3>
                        <p>System configuration, user management, and deep analytics.</p>
                        <Link href="/login/admin" className={`${styles.portalBtn} btn btn-primary`}>
                            Admin Login
                        </Link>
                    </div>

                    {/* Security Card */}
                    <div className={`${styles.portalCard} glass`}>
                        <div className={styles.portalIcon}>👮</div>
                        <h3 className="outfit">Security Ops</h3>
                        <p>Live monitoring, violation triage, and real-time alerts.</p>
                        <Link href="/login/security" className={`${styles.portalBtn} btn btn-primary`}>
                            Security Login
                        </Link>
                    </div>

                    {/* Staff Card */}
                    <div className={`${styles.portalCard} glass`}>
                        <div className={styles.portalIcon}>👥</div>
                        <h3 className="outfit">Staff Portal</h3>
                        <p>Personal profile verification, history, and status check.</p>
                        <Link href="/login/staff" className={`${styles.portalBtn} btn btn-primary`}>
                            Staff Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <p>&copy; 2026 ID-Intel Intelligence. Secure. Compliant. Automatic.</p>
                </div>
            </footer>
        </div>
    );
}
