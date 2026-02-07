"use client";
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import ExportButton from '../components/ExportButton';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ImageLightbox from '../components/ImageLightbox';
import { useToast } from '../components/useToast';
import styles from '../components/Logs.module.css';

interface ViolationLog {
    filename: string;
    image_path: string;
    timestamp: string;
    status: string;
}

export default function ViolationsPage() {
    const [allLogs, setAllLogs] = useState<ViolationLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ViolationLog[]>([]);
    const [displayedLogs, setDisplayedLogs] = useState<ViolationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const { showToast, ToastComponent } = useToast();
    const itemsPerPage = 12;

    useEffect(() => {
        fetch('http://localhost:8081/all_violation_images')
            .then(res => res.json())
            .then(data => {
                setAllLogs(data);
                setFilteredLogs(data);
                setLoading(false);
                showToast(`Loaded ${data.length} violation records`, 'success');
            })
            .catch(err => {
                console.error("Failed to fetch violations", err);
                setLoading(false);
                showToast('Failed to load violation data', 'error');
            });
    }, []);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedLogs(filteredLogs.slice(startIndex, endIndex));
    }, [filteredLogs, currentPage]);

    const handleSearch = (query: string) => {
        const filtered = allLogs.filter(log =>
            formatName(log.filename).toLowerCase().includes(query.toLowerCase()) ||
            log.status.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredLogs(filtered);
        setCurrentPage(1);
        if (query) {
            showToast(`Found ${filtered.length} matching violations`, 'info');
        }
    };

    const handleDateFilter = (startDate: string, endDate: string) => {
        if (!startDate && !endDate) {
            setFilteredLogs(allLogs);
            setCurrentPage(1);
            showToast('Filters cleared', 'info');
            return;
        }

        const filtered = allLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59, 999);
            return logDate >= start && logDate <= end;
        });
        setFilteredLogs(filtered);
        setCurrentPage(1);
        showToast(`Filtered to ${filtered.length} violations`, 'success');
    };

    const formatName = (filename: string) => {
        return filename.split('_')[0].replace(".jpg", "").replace(".png", "");
    };

    const handleImageClick = (imagePath: string, filename: string) => {
        setSelectedImage({
            src: `http://localhost:8081/${imagePath.replace(/\\/g, '/')}`,
            alt: formatName(filename)
        });
    };

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const exportData = filteredLogs.map(log => ({
        Name: formatName(log.filename),
        Status: log.status,
        Date: new Date(log.timestamp).toLocaleDateString(),
        Time: new Date(log.timestamp).toLocaleTimeString(),
        'Image Path': log.image_path
    }));

    return (
        <div className={styles.container}>
            <ToastComponent />
            <Navigation />

            <header className={styles.header}>
                <h1 className={styles.title} style={{ backgroundImage: 'linear-gradient(to right, #ef4444, #f97316)' }}>
                    Violation Evidence
                </h1>
                <p className={styles.subtitle}>Direct directory view of all compliance breach captures.</p>
            </header>

            {!loading && (
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <SearchFilter
                            onSearch={handleSearch}
                            onDateFilter={handleDateFilter}
                            placeholder="Search violations by name or status..."
                        />
                        <ExportButton
                            data={exportData}
                            filename="violations_report"
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <LoadingSkeleton type="card" count={12} />
            ) : filteredLogs.length === 0 ? (
                <div className={styles.noLogs}>No violation images found matching your criteria.</div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {displayedLogs.map((log, index) => (
                            <div key={index} className={`${styles.card} ${styles.cardHover}`}>
                                <div
                                    className={styles.imageContainer}
                                    onClick={() => handleImageClick(log.image_path, log.filename)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={`http://localhost:8081/${log.image_path.replace(/\\/g, '/')}`}
                                        alt={log.filename}
                                        className={styles.image}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Not+Found' }}
                                    />
                                    <div className={styles.badge} style={{ background: 'rgba(239, 68, 68, 0.8)' }}>
                                        {log.status}
                                    </div>
                                    <div className={styles.imageOverlay}>
                                        <span>🔍 Click to enlarge</span>
                                    </div>
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.name}>{formatName(log.filename)}</h3>
                                    <div className={styles.info}>
                                        <span>Captured: {new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className={styles.date}>
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredLogs.length}
                    />
                </>
            )}

            {selectedImage && (
                <ImageLightbox
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
}
