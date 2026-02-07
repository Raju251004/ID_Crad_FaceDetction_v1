"use client";
import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
    type?: 'card' | 'list' | 'stats';
    count?: number;
}

export default function LoadingSkeleton({ type = 'card', count = 6 }: LoadingSkeletonProps) {
    if (type === 'card') {
        return (
            <div className={styles.grid}>
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className={`${styles.card} glass`}>
                        <div className={styles.imageBox}></div>
                        <div className={styles.content}>
                            <div className={styles.title}></div>
                            <div className={styles.text}></div>
                            <div className={styles.textSmall}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'stats') {
        return (
            <div className={styles.statsGrid}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={`${styles.statCard} glass`}>
                        <div className={styles.statIcon}></div>
                        <div className={styles.statContent}>
                            <div className={styles.textSmall}></div>
                            <div className={styles.statValue}></div>
                            <div className={styles.textTiny}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={`${styles.listItem} glass`}>
                    <div className={styles.avatar}></div>
                    <div className={styles.listContent}>
                        <div className={styles.title}></div>
                        <div className={styles.text}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
