"use client";
import React from 'react';
import Navigation from '../components/Navigation';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navigation />
            <div className="p-8 mt-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Settings</h1>
                <p className="text-gray-400">Settings configuration coming soon...</p>
            </div>
        </div>
    );
}
