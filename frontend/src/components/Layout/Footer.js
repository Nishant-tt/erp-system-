import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            height: 'var(--footer-height)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            borderTop: '1px solid var(--border)',
            color: 'var(--secondary)',
            fontSize: '0.875rem'
        }}>
            <p>&copy; {new Date().getFullYear()} ERP Pro. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            </div>
        </footer>
    );
};

export default Footer;
