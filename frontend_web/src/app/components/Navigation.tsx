import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.css';

export default function Navigation() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        setRole(storedRole);
    }, []);

    const isStaff = role === 'staff';

    return (
        <nav className={`${styles.nav} glass`}>
            <div className={styles.navContent}>
                <div className={`${styles.logo} outfit`}>
                    🛡️ ID-Intel V3
                </div>
                <div className={styles.navLinks}>
                    {!isStaff && (
                        <Link
                            href="/dashboard"
                            className={`${styles.navButton} ${pathname === '/dashboard' ? styles.active : ''}`}
                        >
                            Headquarters
                        </Link>
                    )}
                    <Link
                        href="/violations"
                        className={`${styles.navButton} ${pathname === '/violations' ? styles.active : ''}`}
                    >
                        Violations
                    </Link>
                    <Link
                        href="/verified"
                        className={`${styles.navButton} ${pathname === '/verified' ? styles.active : ''}`}
                    >
                        Personnel
                    </Link>
                    {!isStaff && (
                        <Link
                            href="/analytics"
                            className={`${styles.navButton} ${pathname === '/analytics' ? styles.active : ''}`}
                        >
                            Analytics
                        </Link>
                    )}
                    <Link
                        href="/settings"
                        className={`${styles.navButton} ${pathname === '/settings' ? styles.active : ''}`}
                    >
                        Settings
                    </Link>
                    <Link
                        href="/"
                        onClick={() => localStorage.removeItem('userRole')}
                        className={`${styles.navButton} ${styles.logout}`}
                    >
                        Logout
                    </Link>
                </div>
            </div>
        </nav>
    );
}


