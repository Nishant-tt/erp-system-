import React from 'react';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Settings,
    BarChart3,
    Menu,
    ChevronLeft
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
        { icon: <Users size={20} />, label: 'Customers' },
        { icon: <Package size={20} />, label: 'Products' },
        { icon: <ShoppingCart size={20} />, label: 'Orders' },
        { icon: <BarChart3 size={20} />, label: 'Reports' },
        { icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div style={{
            width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
            height: '100vh',
            backgroundColor: 'var(--card)',
            borderRight: '1px solid var(--border)',
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50
        }}>
            <div style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'space-between' : 'center',
                padding: '0 1.25rem',
                borderBottom: '1px solid var(--border)'
            }}>
                {isOpen && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'var(--primary)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Package size={18} />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--foreground)' }}>ERP Pro</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            color: item.active ? 'var(--primary)' : 'var(--secondary)',
                            backgroundColor: item.active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            transition: 'all 0.2s',
                            justifyContent: isOpen ? 'flex-start' : 'center'
                        }}
                        onMouseOver={(e) => {
                            if (!item.active) {
                                e.currentTarget.style.backgroundColor = 'var(--background)';
                                e.currentTarget.style.color = 'var(--foreground)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!item.active) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--secondary)';
                            }
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: '20px' }}>
                            {item.icon}
                        </div>
                        {isOpen && <span style={{ fontWeight: item.active ? '600' : '500', whiteSpace: 'nowrap' }}>{item.label}</span>}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: isOpen ? 'flex-start' : 'center'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--secondary)'
                    }}>
                        <Users size={20} />
                    </div>
                    {isOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)' }}>John Doe</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>Administrator</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
