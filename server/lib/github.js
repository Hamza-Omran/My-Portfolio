import fetch from 'node-fetch';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Hamza-Omran';

/**
 * Get GitHub API headers with authentication
 * @returns {Object} Headers for GitHub API requests
 */
function getHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Backend',
    };

    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    } else {
        console.warn('⚠️ No GITHUB_TOKEN provided. API rate limit: 60/hour');
    }

    return headers;
}

/**
 * Fetch all repositories for a GitHub user
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Array of repository objects
 */
export async function fetchUserRepositories(username = GITHUB_USERNAME) {
    try {
        const url = `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`;

        console.log(`📡 Fetching repositories for user: ${username}`);

        const response = await fetch(url, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('GitHub API rate limit exceeded');
            }
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const repos = await response.json();
        console.log(`✅ Fetched ${repos.length} repositories`);

        return repos;
    } catch (error) {
        console.error('❌ Error fetching repositories:', error);
        throw error;
    }
}

/**
 * Fetch a single repository by name
 * @param {string} owner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Promise<Object>} Repository object
 */
export async function fetchRepository(owner, repoName) {
    try {
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repoName}`;

        console.log(`📡 Fetching repository: ${owner}/${repoName}`);

        const response = await fetch(url, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const repo = await response.json();
        console.log(`✅ Fetched repository: ${repo.full_name}`);

        return repo;
    } catch (error) {
        console.error(`❌ Error fetching repository ${owner}/${repoName}:`, error);
        throw error;
    }
}

/**
 * Fetch README content for a repository
 * @param {string} owner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Promise<string|null>} README content or null if not found
 */
export async function fetchReadme(owner, repoName) {
    try {
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repoName}/readme`;

        console.log(`📄 Fetching README for: ${owner}/${repoName}`);

        const response = await fetch(url, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`ℹ️ No README found for ${owner}/${repoName}`);
                return null;
            }
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        console.log(`✅ Fetched README for ${owner}/${repoName} (${content.length} characters)`);

        return content;
    } catch (error) {
        console.error(`❌ Error fetching README for ${owner}/${repoName}:`, error);
        return null;
    }
}

/**
 * Transform GitHub API repository data to our database schema
 * @param {Object} githubRepo - Repository data from GitHub API
 * @returns {Object} Transformed repository object
 */
export function transformRepository(githubRepo) {
    return {
        github_id: githubRepo.id,
        name: githubRepo.name,
        full_name: githubRepo.full_name,
        description: githubRepo.description || null,
        html_url: githubRepo.html_url,
        homepage: githubRepo.homepage || null,
        language: githubRepo.language || null,
        stargazers_count: githubRepo.stargazers_count || 0,
        forks_count: githubRepo.forks_count || 0,
        open_issues_count: githubRepo.open_issues_count || 0,
        created_at: githubRepo.created_at,
        updated_at: githubRepo.updated_at,
        pushed_at: githubRepo.pushed_at || null,
        is_fork: githubRepo.fork || false,
        is_private: githubRepo.private || false,
    };
}

/**
 * Check GitHub API rate limit status
 * @returns {Promise<Object>} Rate limit information
 */
export async function checkRateLimit() {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
            headers: getHeaders(),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                limit: data.rate.limit,
                remaining: data.rate.remaining,
                reset: new Date(data.rate.reset * 1000),
            };
        }

        return null;
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return null;
    }
}

export default {
    fetchUserRepositories,
    fetchRepository,
    fetchReadme,
    transformRepository,
    checkRateLimit,
};
