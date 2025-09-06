import React from 'react';
import './Skills.css';

const Skills = () => {
    const skills = [
        {
            name: 'React.js',
            level: 90,
            icon: 'fab fa-react',
            iconClass: 'react-icon',
            description: 'Building modern user interfaces'
        },
        {
            name: 'JavaScript',
            level: 85,
            icon: 'fab fa-js-square',
            iconClass: 'javascript-icon',
            description: 'ES6+ and modern JavaScript'
        },
        {
            name: 'Node.js',
            level: 80,
            icon: 'fab fa-node-js',
            iconClass: 'nodejs-icon',
            description: 'Backend development and APIs'
        },
        {
            name: 'HTML/CSS',
            level: 95,
            icon: 'fab fa-html5',
            iconClass: 'html-icon',
            description: 'Semantic markup and styling'
        },
        {
            name: 'MongoDB',
            level: 75,
            icon: 'fas fa-database',
            iconClass: 'mongodb-icon',
            description: 'NoSQL database management'
        },
        {
            name: 'Git',
            level: 85,
            icon: 'fab fa-git-alt',
            iconClass: 'git-icon',
            description: 'Version control and collaboration'
        }
    ];

    return (
        <section id="skills" className="skills-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">My Skills</h2>
                    <p className="section-subtitle">
                        Technologies and tools I work with to bring ideas to life
                    </p>
                </div>

                <div className="skills-grid">
                    {skills.map((skill, index) => (
                        <div key={index} className="skill-card">
                            <div className={`skill-icon ${skill.iconClass}`}><i className={skill.icon}></i></div>
                            <h3 className="skill-name">{skill.name}</h3>
                            <p className="skill-description">{skill.description}</p>
                            <div className="skill-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${skill.level}%` }}
                                    ></div>
                                </div>
                                <span className="skill-level">{skill.level}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
