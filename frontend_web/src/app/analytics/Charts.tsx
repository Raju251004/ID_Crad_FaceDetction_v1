"use client";

import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// --- Components ---

export const ViolationsTrendChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4848" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ff4848" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c49f" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00c49f" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #444', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="verified" stroke="#00c49f" fillOpacity={1} fill="url(#colorVerified)" name="Verified Personnel" />
                <Area type="monotone" dataKey="violations" stroke="#ff4848" fillOpacity={1} fill="url(#colorViolations)" name="Violations Detected" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export const CompliancePieChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #444', borderRadius: '8px' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export const HourlyActivityChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #444', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="events" fill="#8884d8" radius={[10, 10, 0, 0]} name="Activity Level">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 10}, 80%, 60%)`} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
