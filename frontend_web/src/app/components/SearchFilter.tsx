"use client";
import { useState } from 'react';
import styles from './SearchFilter.module.css';

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onDateFilter: (startDate: string, endDate: string) => void;
    placeholder?: string;
}

export default function SearchFilter({ onSearch, onDateFilter, placeholder = "Search..." }: SearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleDateFilter = () => {
        onDateFilter(startDate, endDate);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        onSearch('');
        onDateFilter('', '');
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={styles.filterToggle}
                >
                    🔍 Filters
                </button>
            </div>

            {showFilters && (
                <div className={`${styles.filterPanel} glass`}>
                    <div className={styles.dateFilters}>
                        <div className={styles.inputGroup}>
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.dateInput}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.dateInput}
                            />
                        </div>
                    </div>
                    <div className={styles.filterActions}>
                        <button onClick={handleDateFilter} className="btn btn-primary">
                            Apply Filters
                        </button>
                        <button onClick={clearFilters} className="btn btn-outline">
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
