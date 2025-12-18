-- Portfolio GitHub Repositories Database Schema
-- PostgreSQL schema for Supabase

-- Enable UUID extension (optional, using SERIAL for simplicity)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  homepage TEXT,
  language VARCHAR(100),
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  
  -- Timestamps from GitHub
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  pushed_at TIMESTAMP,
  
  -- Extracted data from README
  demo_link TEXT,
  project_image TEXT,
  
  -- Metadata
  is_fork BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  last_fetched_at TIMESTAMP DEFAULT NOW(),
  
  -- Internal timestamps
  db_created_at TIMESTAMP DEFAULT NOW(),
  db_updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repositories_github_id ON repositories(github_id);
CREATE INDEX IF NOT EXISTS idx_repositories_updated_at ON repositories(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);

-- Sync logs table for monitoring webhook/sync operations
CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'webhook', 'manual', 'batch'
  repository_name VARCHAR(255),
  repos_processed INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  execution_time_ms INTEGER
);

-- Index for querying recent logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);

-- Function to automatically update db_updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.db_updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update db_updated_at on repositories table
CREATE TRIGGER update_repositories_updated_at 
  BEFORE UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for recent repository activity
CREATE OR REPLACE VIEW recent_repositories AS
SELECT 
  id,
  name,
  full_name,
  description,
  html_url,
  homepage,
  language,
  stargazers_count,
  forks_count,
  demo_link,
  project_image,
  updated_at,
  pushed_at
FROM repositories
WHERE is_fork = false AND is_private = false
ORDER BY updated_at DESC;

-- Comments for documentation
COMMENT ON TABLE repositories IS 'Stores GitHub repository information with extracted README data';
COMMENT ON TABLE sync_logs IS 'Tracks webhook and manual sync operations for monitoring';
COMMENT ON COLUMN repositories.demo_link IS 'Extracted demo URL from README';
COMMENT ON COLUMN repositories.project_image IS 'Extracted project image URL from README';
COMMENT ON COLUMN repositories.last_fetched_at IS 'Last time this repository data was fetched from GitHub';
