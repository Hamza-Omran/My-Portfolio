# Hamza Hussain - Personal Portfolio

A modern, responsive one-page portfolio website built with React.js and Vite, showcasing my skills, projects, and providing a way to get in touch.

## Project Structure

This portfolio is optimized for deployment with only essential files:
- `src/` - React components and main application code
- `public/` - Static assets (CV, images, favicon)
- `node_modules/` - Dependencies (auto-generated)
- `dist/` - Production build output (generated on build)
- Configuration files (package.json, vite.config.js, etc.)

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Navigation**: Navbar with smooth scrolling to different sections
- **Interactive Components**: 
  - About section with personal introduction
  - Skills section with animated progress bars
  - Projects showcase with GitHub API integration
  - Contact form with fallback email integration
- **Modern UI/UX**: Clean design with smooth animations and transitions
- **Form Validation**: JavaScript form validation for the contact form
- **Email Integration**: Contact form with mailto fallback
- **GitHub Integration**: Dynamic projects fetching from GitHub API
- **Fast Loading**: Built with Vite for optimal performance

## 🛠️ Technologies Used

- **React.js** - Frontend library for building user interfaces
- **Vite** - Build tool and development server
- **CSS3** - Styling with modern CSS features
- **JavaScript ES6+** - Modern JavaScript features
- **HTML5** - Semantic markup

## Sections

1. **Navbar** - Navigation with smooth scroll to sections
2. **About** - Personal introduction, role, and bio
3. **Skills** - Technical skills with progress indicators
4. **Projects** - Portfolio of recent projects with descriptions
5. **Contact** - Contact form with validation and contact information

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

```bash
# Clone the repository
git clone https://github.com/Hamza-Omran/My-Portfolio.git
cd My-Portfolio/portfolio-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the portfolio.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables (Optional)

Create a `.env` file in the portfolio-app directory for enhanced features:

```bash
# GitHub API Token (optional - for better rate limits)
VITE_GITHUB_TOKEN=your_github_token_here

# Backend API URL (if using email backend)
VITE_BACKEND_URL=your_backend_url_here
```

## Contact Form

The contact form uses a mailto fallback that opens the user's default email client. For production deployment with a backend, set the `VITE_BACKEND_URL` environment variable.

## Deployment

This project can be deployed to:
- Vercel
- Netlify  
- GitHub Pages
- Any static hosting service

## Contact

- **Email**: hamza.hussain.omran@gmail.com
- **GitHub**: [Hamza-Omran](https://github.com/Hamza-Omran)
- **Portfolio**: [Live Demo](https://my-portfolio-theta-eight-89.vercel.app)
