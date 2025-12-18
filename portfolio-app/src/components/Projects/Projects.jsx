import React, { useState, useEffect } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import { fetchRepositories } from '../../services/githubService';
import './Projects.css';

const Projects = () => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRepositories = async () => {
            try {
                setLoading(true);
                console.log('📡 Fetching repositories from backend...');

                const repositories = await fetchRepositories();

                console.log(`✅ Loaded ${repositories.length} repositories`);
                setRepos(repositories);
            } catch (err) {
                setError(err.message);
                console.error('Error loading repositories:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRepositories();
    }, []);



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
                    {repos
                        .slice()
                        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                        .map((repo) => (
                            <ProjectCard
                                key={repo.id}
                                repo={repo}
                                demoLink={repo.demo_link}
                                projectImage={repo.project_image}
                                getLanguageColor={getLanguageColor}
                            />
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
