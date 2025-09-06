import React from 'react';
import './About.css';

const About = () => {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <h1 className="about-title">
                            <span className="greeting">Hi, I'm </span>
                            <span className="name-animation">Hamza Hussain</span>
                        </h1>
                        <h2 className="about-role">Full Stack Web Developer</h2>
                        <p className="about-bio">
                            I'm a passionate full stack web developer with expertise in modern web technologies.
                            I love creating beautiful, functional, and user-friendly applications that solve real-world problems.
                            With a strong foundation in both frontend and backend development, I enjoy working on projects
                            that challenge me to learn and grow as a developer.
                        </p>
                        <p className="about-bio">
                            Currently pursuing my studies while building exciting web applications using React, Node.js,
                            and various other technologies. I'm always eager to take on new challenges and collaborate
                            with others to create amazing digital experiences.
                        </p>
                        <div className="about-buttons">
                            <button
                                className="btn-primary"
                                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Get In Touch
                            </button>
                            <a
                                href="/Hamza_Hussain_CV.pdf"
                                className="btn-secondary"
                                download
                            >
                                Download CV
                            </a>
                        </div>
                    </div>
                    <div className="about-image">
                        <div className="image-placeholder">
                            <img
                                src="/favicon.png"
                                alt="Hamza Hussain"
                                className="profile-image"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
