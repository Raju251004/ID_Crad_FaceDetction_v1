"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Quick mock login for prototype
        if (username && password) {
            // Authenticate with backend in real app
            // const res = await fetch('http://localhost:8081/token', ...);
            router.push('/dashboard');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Access Control</h1>
                <p className={styles.subtitle}>Restricted Area. Authorized Personnel Only.</p>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Agent ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter ID..."
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Passcode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className={styles.button}>Authenticate</button>
                </form>
            </div>
        </div>
    );
}
