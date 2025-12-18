import crypto from 'crypto';
import { fetchRepository, fetchReadme, transformRepository } from '../lib/github.js';
import { upsertRepository, deleteRepository, logSync } from '../lib/db.js';
import { extractReadmePatterns } from '../lib/patterns.js';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * Verify GitHub webhook signature
 * @param {string} payload - Request body as string
 * @param {string} signature - X-Hub-Signature-256 header
 * @returns {boolean} True if signature is valid
 */
function verifySignature(payload, signature) {
    if (!WEBHOOK_SECRET) {
        console.warn('⚠️ GITHUB_WEBHOOK_SECRET not set - skipping signature verification');
        return true; // Allow in development
    }

    if (!signature) {
        return false;
    }

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Process a repository webhook event
 * @param {Object} repository - Repository data from webhook
 * @param {string} action - Webhook action
 */
async function processRepositoryWebhook(repository, action) {
    const startTime = Date.now();

    try {
        console.log(`🔔 Processing webhook: ${action} - ${repository.full_name}`);

        // Handle deletion
        if (action === 'deleted') {
            await deleteRepository(repository.id);
            console.log(`🗑️ Deleted repository: ${repository.full_name}`);

            await logSync({
                sync_type: 'webhook',
                repository_name: repository.full_name,
                repos_processed: 1,
                status: 'success',
                started_at: new Date(startTime),
                execution_time_ms: Date.now() - startTime,
            });

            return { success: true, action: 'deleted' };
        }

        // For all other actions, fetch fresh data from GitHub
        const [owner, repoName] = repository.full_name.split('/');

        // Fetch latest repository data
        const freshRepo = await fetchRepository(owner, repoName);
        const transformedRepo = transformRepository(freshRepo);

        // Fetch README and extract patterns
        const readmeContent = await fetchReadme(owner, repoName);
        const patterns = extractReadmePatterns(readmeContent, owner, repoName);

        // Merge data
        const repoData = {
            ...transformedRepo,
            demo_link: patterns.demo_link,
            project_image: patterns.project_image,
        };

        // Upsert to database
        const savedRepo = await upsertRepository(repoData);

        console.log(`✅ Processed repository: ${savedRepo.full_name}`);

        // Log sync
        await logSync({
            sync_type: 'webhook',
            repository_name: savedRepo.full_name,
            repos_processed: 1,
            status: 'success',
            started_at: new Date(startTime),
            execution_time_ms: Date.now() - startTime,
        });

        return { success: true, repository: savedRepo };
    } catch (error) {
        console.error(`❌ Error processing webhook for ${repository.full_name}:`, error);

        // Log failure
        await logSync({
            sync_type: 'webhook',
            repository_name: repository.full_name,
            repos_processed: 0,
            status: 'failed',
            error_message: error.message,
            started_at: new Date(startTime),
            execution_time_ms: Date.now() - startTime,
        });

        throw error;
    }
}

/**
 * POST /api/webhook
 * GitHub webhook handler
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get raw body for signature verification
        const signature = req.headers['x-hub-signature-256'];
        const payload = JSON.stringify(req.body);

        // Verify signature
        if (!verifySignature(payload, signature)) {
            console.error('❌ Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const event = req.headers['x-github-event'];
        const body = req.body;

        console.log(`📨 Received webhook: ${event}`);

        // Handle different webhook events
        if (event === 'ping') {
            console.log('🏓 Webhook ping received');
            return res.status(200).json({ message: 'Pong! Webhook is configured correctly.' });
        }

        if (event === 'repository') {
            // Repository created, deleted, archived, unarchived, etc.
            const action = body.action;
            const repository = body.repository;

            const result = await processRepositoryWebhook(repository, action);

            return res.status(200).json({
                success: true,
                message: `Repository ${action} processed successfully`,
                result,
            });
        }

        if (event === 'push') {
            // Repository updated via push
            const repository = body.repository;

            const result = await processRepositoryWebhook(repository, 'updated');

            return res.status(200).json({
                success: true,
                message: 'Push event processed successfully',
                result,
            });
        }

        if (event === 'release') {
            // New release created
            const repository = body.repository;

            const result = await processRepositoryWebhook(repository, 'released');

            return res.status(200).json({
                success: true,
                message: 'Release event processed successfully',
                result,
            });
        }

        // Ignore other events
        console.log(`ℹ️ Ignoring event: ${event}`);
        return res.status(200).json({
            success: true,
            message: `Event ${event} acknowledged but not processed`,
        });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);

        return res.status(500).json({
            success: false,
            error: 'Webhook processing failed',
            message: error.message,
        });
    }
}
