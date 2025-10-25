import React, { useState } from 'react';
import './Contact.css';
import { sendEmail, EMAIL_CONFIG } from '../../services/emailService';

const Contact = () => {
    const myEmail = EMAIL_CONFIG.toEmail;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [emailServiceError, setEmailServiceError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            const result = await sendEmail(formData);

            if (result.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });

                setTimeout(() => setSubmitStatus(''), 5000);
            } else {
                throw new Error(result.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setSubmitStatus('error');
            setEmailServiceError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFallbackEmail = () => {
        const subject = `Message from ${formData.name}`;
        const body = formData.message;
        const mailtoUrl = `mailto:${myEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank');
    };

    return (
        <section id="contact" className="contact-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Get In Touch</h2>
                    <p className="section-subtitle">
                        I'd love to hear from you. Send me a message and I'll respond as soon as possible.
                    </p>
                </div>

                <div className="contact-content">
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                            <div>
                                <h3>Email</h3>
                                <p id='email'>
                                    <a href={`mailto:${myEmail}`} className="contact-link">
                                        {myEmail}
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon"><i className="fas fa-phone"></i></div>
                            <div>
                                <h3>Phone</h3>
                                <p>
                                    <a href="tel:+201551130045" className="contact-link">
                                        +201551130045
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                            <div>
                                <h3>Location</h3>
                                <p>
                                    <a
                                        href="https://www.google.com/maps/search/Alexandria, Egypt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-link"
                                    >
                                        Alexandria, Egypt
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                                placeholder="Your full name"
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className={errors.message ? 'error' : ''}
                                placeholder="Your message here..."
                                rows="5"
                            ></textarea>
                            {errors.message && <span className="error-message">{errors.message}</span>}
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>

                        {submitStatus === 'success' && (
                            <div className="status-message success">
                                Message sent successfully! I’ll send an email back to you soon, please wait for my reply.
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="status-message error">
                                {emailServiceError ? (
                                    <div>
                                        <p>Email service is currently unavailable.</p>
                                        <p>
                                            <button
                                                type="button"
                                                className="fallback-email-btn"
                                                onClick={handleFallbackEmail}
                                            >
                                                Open Email App
                                            </button>
                                        </p>
                                        <small>This will open your default email app with the message pre-filled.</small>
                                    </div>
                                ) : (
                                    'Something went wrong. Please try again.'
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
