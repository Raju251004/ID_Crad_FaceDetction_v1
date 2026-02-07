"use client";
import { useState } from 'react';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
    data: any[];
    filename: string;
    headers?: string[];
}

export default function ExportButton({ data, filename, headers }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const exportToCSV = () => {
        setExporting(true);

        try {
            // Determine headers from first data item if not provided
            const csvHeaders = headers || (data.length > 0 ? Object.keys(data[0]) : []);

            // Create CSV content
            let csvContent = csvHeaders.join(',') + '\n';

            data.forEach(item => {
                const row = csvHeaders.map(header => {
                    const value = item[header];
                    // Handle values with commas or quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                csvContent += row.join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => setExporting(false), 1000);
        } catch (error) {
            console.error('Export failed:', error);
            setExporting(false);
        }
    };

    return (
        <button
            onClick={exportToCSV}
            disabled={exporting || data.length === 0}
            className={`${styles.exportButton} btn btn-outline`}
        >
            {exporting ? (
                <>
                    <span className={styles.spinner}></span>
                    Exporting...
                </>
            ) : (
                <>
                    📊 Export CSV
                </>
            )}
        </button>
    );
}
