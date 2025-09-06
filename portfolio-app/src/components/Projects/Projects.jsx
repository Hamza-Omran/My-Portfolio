import React, { useState, useEffect, useCallback } from 'react';
import './Projects.css';

const Projects = () => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getGitHubHeaders = useCallback(() => {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-Website'
        };

        const token = import.meta.env.VITE_GITHUB_TOKEN;
        if (token && token !== 'your_github_token_here' && token !== '') {
            headers['Authorization'] = `token ${token}`;
            console.log('GitHub API: Using authenticated requests (5000/hour limit)');
        } else {
            console.error('GitHub API: No token provided! Add VITE_GITHUB_TOKEN to environment variables.');
        }

        return headers;
    }, []);

    const fetchReadmeData = useCallback(async (owner, repoName) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
                headers: getGitHubHeaders()
            });

            if (!readmeResponse.ok) {
                if (readmeResponse.status === 403) {
                    console.warn(`Rate limited for ${repoName}, skipping README fetch`);
                } else if (readmeResponse.status === 404) {
                    console.log(`No README found for ${repoName}`);
                }
                return { demoLink: null, projectImage: null };
            }

            const readmeData = await readmeResponse.json();
            const content = atob(readmeData.content); 
            const lines = content.split('\n').slice(0, 100);
            const first100Lines = lines.join('\n');

            let demoLink = null;

            const demoMatch = first100Lines.match(/demo/i);

            if (demoMatch) {
                const textAfterDemo = first100Lines.substring(demoMatch.index + demoMatch[0].length);

                const linkMatch = textAfterDemo.match(/https?:\/\/[^\s\n)]+/i);

                if (linkMatch) {
                    const potentialLink = linkMatch[0];

                    const imageExtensions = /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?|$)/i;
                    if (!imageExtensions.test(potentialLink)) {
                        demoLink = potentialLink;
                        console.log(`Found demo link after "demo": ${demoLink}`);
                    } else {
                        console.log(`Filtered out image URL: ${potentialLink}`);
                    }
                } else {
                    console.log(`Found "demo" but no link after it in ${repoName}`);
                }
            } else {
                console.log(`No "demo" word found in ${repoName}`);
            }

            const imagePatterns = [
                /!\[.*?\]\(([^)]+\.(png|jpg|jpeg|gif|webp|svg))\)/i,
                /!\[.*?\]\(([^)]+)\)/i, 
                /<img[^>]+src=["']([^"']+)["'][^>]*>/i 
            ];

            let projectImage = null;
            for (const pattern of imagePatterns) {
                const match = first100Lines.match(pattern);
                if (match) {
                    projectImage = match[1];

                    if (projectImage && !projectImage.startsWith('http')) {
                        projectImage = projectImage.replace(/^\.?\//, '');

                        const branches = ['main', 'master'];
                        projectImage = `https://raw.githubusercontent.com/${owner}/${repoName}/${branches[0]}/${projectImage}`;

                        console.log(`Converting relative path to: ${projectImage}`);
                    }
                    break;
                }
            }

            return { demoLink, projectImage };

        } catch (error) {
            console.error(`Error fetching README for ${repoName}:`, error);
            return { demoLink: null, projectImage: null };
        }
    }, [getGitHubHeaders]);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api.github.com/users/Hamza-Omran/repos', {
                    headers: getGitHubHeaders()
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error('GitHub API rate limit exceeded (60 requests/hour without token). Please try again later or contact me for the latest projects.');
                    } else {
                        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
                    }
                } const data = await response.json();

                const sortedRepos = data
                    .filter(repo => !repo.fork) 
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

                console.log(`Fetching README data for ${sortedRepos.length} repositories...`);

                const reposWithReadmeData = [];
                const batchSize = 3;

                for (let i = 0; i < sortedRepos.length; i += batchSize) {
                    const batch = sortedRepos.slice(i, i + batchSize);

                    const batchResults = await Promise.all(
                        batch.map(async (repo) => {
                            const readmeData = await fetchReadmeData(repo.owner.login, repo.name);
                            return {
                                ...repo,
                                demoLink: readmeData.demoLink,
                                projectImage: readmeData.projectImage
                            };
                        })
                    );

                    reposWithReadmeData.push(...batchResults);

                    if (i + batchSize < sortedRepos.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                setRepos(reposWithReadmeData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching GitHub repos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, [fetchReadmeData, getGitHubHeaders]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getLanguageColor = (language) => {
        const colors = {
            JavaScript: '#f1e05a',
            Python: '#3572A5',
            Java: '#b07219',
            'C++': '#f34b7d',
            C: '#555555',
            HTML: '#e34c26',
            CSS: '#1572B6',
            TypeScript: '#2b7489',
            React: '#61dafb',
            'C#': '#239120',
            PHP: '#4F5D95',
            Ruby: '#701516',
            Go: '#00ADD8',
            Rust: '#dea584',
            Swift: '#fa7343',
            Kotlin: '#7F52FF'
        };
        return colors[language] || '#6c757d';
    };

    if (loading) {
        return (
            <section id="projects" className="projects-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">My Projects</h2>
                        <p className="section-subtitle">Loading my GitHub repositories...</p>
                    </div>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="projects" className="projects-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">My Projects</h2>
                        <p className="section-subtitle">Error loading repositories: {error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="projects" className="projects-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">My Projects</h2>
                    <p className="section-subtitle">
                        All of my GitHub repositories ({repos.length} total) sorted by recent activity
                    </p>
                </div>

                <div className="projects-grid">
                    {repos.map((repo) => (
                        <div key={repo.id} className="repo-card">
                            <div className="repo-header">
                                <h3 className="repo-title">
                                    {repo.name}
                                </h3>
                                {repo.language && (
                                    <span
                                        className="language-badge"
                                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                                    >
                                        {repo.language}
                                    </span>
                                )}
                            </div>

                            {repo.projectImage && (
                                <div className="repo-image">
                                    <img
                                        src={repo.projectImage}
                                        alt={`${repo.name} preview`}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="repo-bottom-section">
                                <div className="repo-content">
                                    <p className="repo-description">
                                        {repo.description || 'No description available.'}
                                    </p>

                                    <div className="repo-stats">
                                        <div className="stat">
                                            <span className="stat-icon"><i className="fas fa-star"></i></span>
                                            <span className="stat-value">{repo.stargazers_count}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-icon"><i className="fas fa-code-branch"></i></span>
                                            <span className="stat-value">{repo.forks_count}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-icon"><i className="fas fa-calendar-alt"></i></span>
                                            <span className="stat-value">{formatDate(repo.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="repo-footer">
                                    {repo.demoLink && (
                                        <a
                                            href={repo.demoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="demo-link"
                                        >
                                            <span className="link-icon"><i className="fas fa-rocket"></i></span>
                                            Live Demo
                                        </a>
                                    )}

                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="github-link"
                                    >
                                        <span className="link-icon"><i className="fab fa-github"></i></span>
                                        View on GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="projects-footer">
                    <a
                        href="https://github.com/Hamza-Omran"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-all-link"
                    >
                        View Repositories on GitHub →
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Projects;
