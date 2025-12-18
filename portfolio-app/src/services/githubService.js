/**
 * GitHub Repository Service
 * Fetches repository data from the backend API
 */

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

/**
 * Fetch all repositories from backend
 * @returns {Promise<Array>} Array of repository objects
 */
export async function fetchRepositories() {
    try {
        const response = await fetch(`${API_URL}/repositories`);

        if (!response.ok) {
            throw new Error(`Failed to fetch repositories: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            return data.repositories;
        } else {
            throw new Error(data.error || 'Failed to fetch repositories');
        }
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

/**
 * Trigger manual repository sync (optional - for admin use)
 * @param {number} batchSize - Number of repos to process
 * @param {number} offset - Starting offset for batch
 * @returns {Promise<Object>} Sync result
 */
export async function triggerSync(batchSize = 5, offset = 0) {
    try {
        const url = `${API_URL}/sync-repos?batch_size=${batchSize}&offset=${offset}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error triggering sync:', error);
        throw error;
    }
}

/**
 * Check backend API health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/repositories`);
        return { online: response.ok };
    } catch (error) {
        return { online: false, error: error.message };
    }
}

export default {
    fetchRepositories,
    triggerSync,
    checkHealth,
};
