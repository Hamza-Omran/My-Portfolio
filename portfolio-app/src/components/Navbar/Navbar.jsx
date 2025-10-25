import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('about');
    const menuRef = useRef(null);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setActiveSection(sectionId);
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && 
                !event.target.closest('.hamburger')) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['about', 'skills', 'projects', 'contact'];
            const scrollPosition = window.scrollY + 150; // Navbar height + some offset

            let currentSection = sections[0];
            let minDistance = Infinity;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetBottom = offsetTop + element.offsetHeight;
                    
                    // Check if scroll position is within this section
                    if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                        currentSection = sectionId;
                        break;
                    }
                    
                    // Find closest section if none are in view
                    const distance = Math.abs(scrollPosition - offsetTop);
                    if (distance < minDistance) {
                        minDistance = distance;
                        currentSection = sectionId;
                    }
                }
            }

            setActiveSection(currentSection);
        };

        handleScroll(); // Call once on mount
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <h2>Hamza Hussain</h2>
                </div>
                
                <button 
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`} ref={menuRef}>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                            onClick={() => scrollToSection('about')}
                        >
                            About
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`}
                            onClick={() => scrollToSection('skills')}
                        >
                            Skills
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                            onClick={() => scrollToSection('projects')}
                        >
                            Projects
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
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
