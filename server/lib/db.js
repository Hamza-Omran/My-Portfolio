import pg from 'pg';
const { Pool } = pg;

// Create a connection pool for PostgreSQL
// Vercel automatically provides DATABASE_URL or POSTGRES_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

/**
 * Execute a query with error handling
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params = []) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Query executed:', { duration: `${duration}ms`, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
}

/**
 * Get all repositories, sorted by updated_at
 * @param {number} limit - Maximum number of repositories to fetch
 * @returns {Promise<Array>} Array of repository objects
 */
export async function getAllRepositories(limit = 100) {
    const result = await query(
        `SELECT * FROM repositories 
     WHERE is_fork = false AND is_private = false 
     ORDER BY updated_at DESC 
     LIMIT $1`,
        [limit]
    );
    return result.rows;
}

/**
 * Get a single repository by GitHub ID
 * @param {number} githubId - GitHub repository ID
 * @returns {Promise<Object|null>} Repository object or null
 */
export async function getRepositoryByGithubId(githubId) {
    const result = await query(
        'SELECT * FROM repositories WHERE github_id = $1',
        [githubId]
    );
    return result.rows[0] || null;
}

/**
 * Upsert a repository (insert or update if exists)
 * @param {Object} repo - Repository data
 * @returns {Promise<Object>} Inserted/updated repository
 */
export async function upsertRepository(repo) {
    const result = await query(
        `INSERT INTO repositories (
      github_id, name, full_name, description, html_url, homepage,
      language, stargazers_count, forks_count, open_issues_count,
      created_at, updated_at, pushed_at, demo_link, project_image,
      is_fork, is_private, last_fetched_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
    ON CONFLICT (github_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      full_name = EXCLUDED.full_name,
      description = EXCLUDED.description,
      html_url = EXCLUDED.html_url,
      homepage = EXCLUDED.homepage,
      language = EXCLUDED.language,
      stargazers_count = EXCLUDED.stargazers_count,
      forks_count = EXCLUDED.forks_count,
      open_issues_count = EXCLUDED.open_issues_count,
      updated_at = EXCLUDED.updated_at,
      pushed_at = EXCLUDED.pushed_at,
      demo_link = EXCLUDED.demo_link,
      project_image = EXCLUDED.project_image,
      is_fork = EXCLUDED.is_fork,
      is_private = EXCLUDED.is_private,
      last_fetched_at = NOW()
    RETURNING *`,
        [
            repo.github_id,
            repo.name,
            repo.full_name,
            repo.description,
            repo.html_url,
            repo.homepage,
            repo.language,
            repo.stargazers_count,
            repo.forks_count,
            repo.open_issues_count,
            repo.created_at,
            repo.updated_at,
            repo.pushed_at,
            repo.demo_link,
            repo.project_image,
            repo.is_fork,
            repo.is_private,
        ]
    );
    return result.rows[0];
}

/**
 * Delete a repository by GitHub ID
 * @param {number} githubId - GitHub repository ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteRepository(githubId) {
    const result = await query(
        'DELETE FROM repositories WHERE github_id = $1',
        [githubId]
    );
    return result.rowCount > 0;
}

/**
 * Log a sync operation
 * @param {Object} logData - Sync log data
 * @returns {Promise<Object>} Inserted log entry
 */
export async function logSync(logData) {
    const result = await query(
        `INSERT INTO sync_logs (
      sync_type, repository_name, repos_processed, status, 
      error_message, started_at, completed_at, execution_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
        [
            logData.sync_type,
            logData.repository_name || null,
            logData.repos_processed || 0,
            logData.status,
            logData.error_message || null,
            logData.started_at,
            logData.completed_at || new Date(),
            logData.execution_time_ms || null,
        ]
    );
    return result.rows[0];
}

/**
 * Get recent sync logs
 * @param {number} limit - Maximum number of logs to fetch
 * @returns {Promise<Array>} Array of sync log objects
 */
export async function getSyncLogs(limit = 50) {
    const result = await query(
        'SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT $1',
        [limit]
    );
    return result.rows;
}

/**
 * Get repository count
 * @returns {Promise<number>} Total number of repositories
 */
export async function getRepositoryCount() {
    const result = await query(
        'SELECT COUNT(*) as count FROM repositories WHERE is_fork = false AND is_private = false'
    );
    return parseInt(result.rows[0].count);
}

export default {
    query,
    getAllRepositories,
    getRepositoryByGithubId,
    upsertRepository,
    deleteRepository,
    logSync,
    getSyncLogs,
    getRepositoryCount,
};
