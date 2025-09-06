import React from 'react';
import './ProjectCard.css';

// ProjectCard component for displaying individual repository cards
const ProjectCard = ({ repo, demoLink, projectImage, getLanguageColor }) => {
    return (
        <div className="repo-card">
            <div className="repo-header">
                <h3 className="repo-title">
                    <span className="repo-icon"><i className="fas fa-folder"></i></span>
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

            {projectImage && (
                <div className="repo-image">
                    <img src={projectImage} alt={`${repo.name} preview`} />
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
                        {repo.size > 0 && (
                            <div className="stat">
                                <span className="stat-icon"><i className="fas fa-archive"></i></span>
                                <span className="stat-value">{(repo.size / 1024).toFixed(1)} MB</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="repo-footer">
                    {demoLink && (
                        <a
                            href={demoLink}
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
                        View Code
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
