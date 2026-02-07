"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Login.module.css';

export default function RoleLoginPage() {
    const params = useParams();
    const router = useRouter();
    const role = params.role as string;

    const [formData, setFormData] = useState({ username: '', password: '', gateNumber: '' });
    const [loading, setLoading] = useState(false);

    const roleConfig: Record<string, any> = {
        admin: {
            title: 'Administrator Access',
            description: 'System-wide control and configuration',
            color: 'var(--primary)',
            icon: '⚙️',
            target: '/dashboard'
        },
        security: {
            title: 'Security Command',
            description: 'Live surveillance and protocol monitoring',
            color: '#f43f5e',
            icon: '👮',
            target: '/dashboard'
        },
        staff: {
            title: 'Staff Verification',
            description: 'Identity status and compliance history',
            color: '#10b981',
            icon: '👥',
            target: '/staff-home'
        }
    };

    const config = roleConfig[role] || roleConfig.admin;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate auth for demo
        setTimeout(() => {
            setLoading(false);
            // In a real app, we'd store the role/gate in local storage or cookie
            if (role === 'security') {
                localStorage.setItem('gateNumber', formData.gateNumber);
            }
            localStorage.setItem('userRole', role);
            router.push(config.target);
        }, 1500);
    };

    return (
        <div className={`bg-radial min-h-screen flex items-center justify-center p-6 ${styles.loginPage}`}>
            <div className={styles.backLink}>
                <Link href="/" className="btn btn-outline">
                    ← Back to Home
                </Link>
            </div>

            <div className={`${styles.loginCard} glass animate-fade`}>
                <div className={styles.loginHeader}>
                    <div className={styles.roleIcon} style={{ background: `${config.color}20`, color: config.color }}>
                        {config.icon}
                    </div>
                    <h1 className="outfit">{config.title}</h1>
                    <p>{config.description}</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Identification ID / Username</label>
                        <input
                            type="text"
                            placeholder="Enter your ID"
                            className={styles.input}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    {role === 'security' && (
                        <div className={styles.inputGroup}>
                            <label>Assigned Gate Number</label>
                            <input
                                type="text"
                                placeholder="e.g. Gate 04"
                                className={styles.input}
                                value={formData.gateNumber}
                                onChange={(e) => setFormData({ ...formData, gateNumber: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Security Override Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={styles.input}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        style={{
                            background: `linear-gradient(135deg, ${config.color}, var(--secondary))`
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : `Enter ${role.toUpperCase()} Portal`}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    <p>Locked by RSA-4096 Encryption</p>
                    <span>Authorized Personnel Only</span>
                </div>
            </div>
        </div>
    );
}
