const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const loginAPI = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
};

export const logoutAPI = async () => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
        }

        return data;
    } catch (error) {
        console.error('Logout API error:', error);
        throw error;
    }
};
