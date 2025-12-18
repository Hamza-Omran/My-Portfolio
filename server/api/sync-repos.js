import { fetchUserRepositories, fetchReadme, transformRepository } from '../lib/github.js';
import { upsertRepository, logSync, getRepositoryCount } from '../lib/db.js';
import { extractReadmePatterns } from '../lib/patterns.js';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Hamza-Omran';
const SYNC_SECRET = process.env.SYNC_SECRET; // Optional secret for manual trigger

/**
 * Process a single repository
 * @param {Object} repo - GitHub repository object
 * @param {string} owner - Repository owner
 * @returns {Promise<Object>} Processed repository
 */
async function processRepository(repo, owner) {
    try {
        const transformedRepo = transformRepository(repo);

        // Fetch README and extract patterns
        const readmeContent = await fetchReadme(owner, repo.name);
        const patterns = extractReadmePatterns(readmeContent, owner, repo.name);

        // Merge data
        const repoData = {
            ...transformedRepo,
            demo_link: patterns.demo_link,
            project_image: patterns.project_image,
        };

        // Upsert to database
        const savedRepo = await upsertRepository(repoData);

        return savedRepo;
    } catch (error) {
        console.error(`❌ Error processing ${repo.full_name}:`, error);
        throw error;
    }
}

/**
 * POST /api/sync-repos
 * Manual trigger to sync all repositories
 * Query params:
 *   - batch_size: Number of repos to process in this call (default: 5)
 *   - offset: Starting index for batch processing (default: 0)
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const startTime = Date.now();

    try {
        // Optional authentication
        if (SYNC_SECRET) {
            const authHeader = req.headers.authorization;
            if (authHeader !== `Bearer ${SYNC_SECRET}`) {
                console.error('❌ Invalid sync secret');
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        // Get batch parameters
        const batchSize = parseInt(req.query.batch_size) || 5;
        const offset = parseInt(req.query.offset) || 0;

        console.log(`🔄 Starting repository sync (batch: ${batchSize}, offset: ${offset})...`);

        // Fetch all repositories from GitHub
        const allRepos = await fetchUserRepositories(GITHUB_USERNAME);

        // Filter out forks unless specified
        const repos = allRepos.filter(repo => !repo.fork);

        console.log(`📊 Total repositories: ${repos.length}, Processing batch: ${offset}-${offset + batchSize}`);

        // Get batch to process
        const batch = repos.slice(offset, offset + batchSize);

        if (batch.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No more repositories to process',
                total: repos.length,
                processed: 0,
                offset,
            });
        }

        // Process batch
        const results = [];
        const errors = [];

        for (const repo of batch) {
            try {
                const processed = await processRepository(repo, GITHUB_USERNAME);
                results.push(processed);
                console.log(`✅ Processed: ${processed.full_name}`);
            } catch (error) {
                errors.push({ repo: repo.full_name, error: error.message });
                console.error(`❌ Failed: ${repo.full_name}`);
            }
        }

        const executionTime = Date.now() - startTime;

        // Log sync
        await logSync({
            sync_type: 'manual',
            repository_name: null,
            repos_processed: results.length,
            status: errors.length === 0 ? 'success' : 'partial',
            error_message: errors.length > 0 ? JSON.stringify(errors) : null,
            started_at: new Date(startTime),
            execution_time_ms: executionTime,
        });

        // Check if more repos to process
        const hasMore = offset + batchSize < repos.length;
        const nextOffset = offset + batchSize;

        return res.status(200).json({
            success: true,
            message: `Processed ${results.length} repositories`,
            total: repos.length,
            processed: results.length,
            failed: errors.length,
            offset,
            hasMore,
            nextOffset: hasMore ? nextOffset : null,
            executionTime: `${executionTime}ms`,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('❌ Sync error:', error);

        const executionTime = Date.now() - startTime;

        // Log failure
        await logSync({
            sync_type: 'manual',
            repository_name: null,
            repos_processed: 0,
            status: 'failed',
            error_message: error.message,
            started_at: new Date(startTime),
            execution_time_ms: executionTime,
        });

        return res.status(500).json({
            success: false,
            error: 'Sync failed',
            message: error.message,
        });
    }
}
