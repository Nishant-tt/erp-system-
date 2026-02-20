import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const StatCard = ({ icon, label, value, trend, color }) => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '0.75rem',
            backgroundColor: `rgba(${color}, 0.1)`,
            color: `rgb(${color})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--foreground)' }}>{value}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: trend.startsWith('+') ? '#10b981' : '#f43f5e' }}>
                    {trend}
                </span>
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
    const stats = [
        { icon: <Users size={24} />, label: 'Total Customers', value: '1,284', trend: '+12%', color: '99, 102, 241' },
        { icon: <ShoppingBag size={24} />, label: 'New Orders', value: '156', trend: '+5.4%', color: '244, 63, 94' },
        { icon: <TrendingUp size={24} />, label: 'Growth Rate', value: '24.8%', trend: '+2.1%', color: '16, 185, 129' },
        { icon: <DollarSign size={24} />, label: 'Total Revenue', value: '$45,280', trend: '-1.5%', color: '245, 158, 11' },
    ];

    return (
        <DashboardLayout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                    Dashboard Overview
                </h1>
                <p style={{ color: 'var(--secondary)' }}>Welcome back, here's what's happening with your business today.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem'
            }}>
                <div className="card" style={{ padding: '1.5rem', height: '300px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Sales Analytics</h3>
                    <div style={{
                        height: '200px',
                        backgroundColor: 'var(--background)',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--secondary)',
                        border: '2px dashed var(--border)'
                    }}>
                        Chart Placeholder
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', height: '300px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Activities</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>New order #34{i} received</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{i * 10} minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
