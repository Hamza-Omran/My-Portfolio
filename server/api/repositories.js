import { fetchUserRepositories, fetchReadme, transformRepository } from '../lib/github.js';
import { getAllRepositories, upsertRepository, logSync } from '../lib/db.js';
import { extractReadmePatterns } from '../lib/patterns.js';

/**
 * GET /api/repositories
 * Returns all repositories from the database
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('📦 Fetching repositories from database...');

        const repositories = await getAllRepositories(100);

        console.log(`✅ Retrieved ${repositories.length} repositories`);

        return res.status(200).json({
            success: true,
            count: repositories.length,
            repositories: repositories,
        });
    } catch (error) {
        console.error('❌ Error fetching repositories:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to fetch repositories',
            message: error.message,
        });
    }
}
