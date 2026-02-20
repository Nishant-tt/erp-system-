import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

const Header = () => {
    return (
        <header style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 40
        }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}>
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="input-field"
                        style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '40px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    position: 'relative'
                }}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--accent)',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }}></span>
                </button>
                <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderRadius: '0.5rem'
                }}>
                    <HelpCircle size={20} />
                </button>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 0.5rem' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)' }}>Nishant</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Super Admin</p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.75rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '1rem'
                    }}>
                        N
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
