"use client";
import { useState } from 'react';
import styles from './ImageLightbox.module.css';

interface ImageLightboxProps {
    src: string;
    alt: string;
    onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const [isZoomed, setIsZoomed] = useState(false);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.container}>
                <button className={styles.closeButton} onClick={onClose}>
                    ✕
                </button>

                <div className={styles.imageWrapper}>
                    <img
                        src={src}
                        alt={alt}
                        className={`${styles.image} ${isZoomed ? styles.zoomed : ''}`}
                        onClick={() => setIsZoomed(!isZoomed)}
                    />
                </div>

                <div className={styles.controls}>
                    <button
                        className={styles.controlButton}
                        onClick={() => setIsZoomed(!isZoomed)}
                    >
                        {isZoomed ? '🔍 Zoom Out' : '🔍 Zoom In'}
                    </button>
                    <div className={styles.imageName}>{alt}</div>
                </div>
            </div>
        </div>
    );
}
