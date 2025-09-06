import React from 'react';
import './Navbar.css';

const Navbar = () => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <h2>Hamza Hussain</h2>
                </div>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <button
                            className="nav-link"
                            onClick={() => scrollToSection('about')}
                        >
                            About
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className="nav-link"
                            onClick={() => scrollToSection('skills')}
                        >
                            Skills
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className="nav-link"
                            onClick={() => scrollToSection('projects')}
                        >
                            Projects
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className="nav-link"
                            onClick={() => scrollToSection('contact')}
                        >
                            Contact
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
