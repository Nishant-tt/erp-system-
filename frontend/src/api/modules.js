const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getModulesAPI = async () => {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/modules`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch modules');
        }

        return data;
    } catch (error) {
        console.error('Modules API error:', error);
        throw error;
    }
};
