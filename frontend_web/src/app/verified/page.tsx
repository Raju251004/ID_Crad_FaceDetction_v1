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

interface VerifiedLog {
    id: number;
    person_name: string;
    timestamp: string;
    image_path: string;
    track_id: number;
    status: string;
}

export default function VerifiedPage() {
    const [allLogs, setAllLogs] = useState<VerifiedLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<VerifiedLog[]>([]);
    const [displayedLogs, setDisplayedLogs] = useState<VerifiedLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const { showToast, ToastComponent } = useToast();
    const itemsPerPage = 12;

    useEffect(() => {
        fetch('http://localhost:8081/verified_list')
            .then(res => res.json())
            .then(data => {
                setAllLogs(data);
                setFilteredLogs(data);
                setLoading(false);
                showToast(`Loaded ${data.length} verified personnel records`, 'success');
            })
            .catch(err => {
                console.error("Failed to fetch verified logs", err);
                setLoading(false);
                showToast('Failed to load verified data', 'error');
            });
    }, []);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedLogs(filteredLogs.slice(startIndex, endIndex));
    }, [filteredLogs, currentPage]);

    const handleSearch = (query: string) => {
        const filtered = allLogs.filter(log =>
            log.person_name.toLowerCase().includes(query.toLowerCase()) ||
            log.status.toLowerCase().includes(query.toLowerCase()) ||
            log.track_id.toString().includes(query)
        );
        setFilteredLogs(filtered);
        setCurrentPage(1);
        if (query) {
            showToast(`Found ${filtered.length} matching personnel`, 'info');
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
        showToast(`Filtered to ${filtered.length} personnel`, 'success');
    };

    const handleImageClick = (imagePath: string, personName: string) => {
        setSelectedImage({
            src: `http://localhost:8081/${imagePath.replace('database/', '').replace(/\\/g, '/')}`,
            alt: personName
        });
    };

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const exportData = filteredLogs.map(log => ({
        ID: log.id,
        Name: log.person_name,
        'Track ID': log.track_id,
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
                <h1 className={styles.title} style={{ backgroundImage: 'linear-gradient(to right, #10b981, #059669)' }}>
                    Verified Logs
                </h1>
                <p className={styles.subtitle}>Personnel with verified ID cards.</p>
            </header>

            {!loading && (
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <SearchFilter
                            onSearch={handleSearch}
                            onDateFilter={handleDateFilter}
                            placeholder="Search by name, ID, or status..."
                        />
                        <ExportButton
                            data={exportData}
                            filename="verified_personnel_report"
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <LoadingSkeleton type="card" count={12} />
            ) : filteredLogs.length === 0 ? (
                <div className={styles.noLogs}>No verified logs found matching your criteria.</div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {displayedLogs.map((log) => (
                            <div key={log.id} className={`${styles.card} ${styles.cardHover}`}>
                                <div
                                    className={styles.imageContainer}
                                    onClick={() => handleImageClick(log.image_path, log.person_name)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={`http://localhost:8081/${log.image_path.replace('database/', '').replace(/\\/g, '/')}`}
                                        alt={log.person_name}
                                        className={styles.image}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Not+Found' }}
                                    />
                                    <div className={styles.badge} style={{ background: 'rgba(16, 185, 129, 0.8)' }}>
                                        {log.status}
                                    </div>
                                    <div className={styles.imageOverlay}>
                                        <span>🔍 Click to enlarge</span>
                                    </div>
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.name}>{log.person_name}</h3>
                                    <div className={styles.info}>
                                        <span>ID: {log.track_id}</span>
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
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
