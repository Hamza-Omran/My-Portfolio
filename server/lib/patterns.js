/**
 * Extract demo link and project image from README content
 * This logic is migrated from the frontend Projects.jsx component
 */

/**
 * Extract demo link from README content
 * Looks for the word "demo" followed by a URL (excluding image URLs)
 * @param {string} content - README content
 * @returns {string|null} Demo link or null
 */
export function extractDemoLink(content) {
    if (!content) return null;

    // Get first 100 lines for performance
    const lines = content.split('\n').slice(0, 100);
    const first100Lines = lines.join('\n');

    // Look for "demo" word (case insensitive)
    const demoMatch = first100Lines.match(/demo/i);

    if (!demoMatch) {
        return null;
    }

    // Get text after "demo"
    const textAfterDemo = first100Lines.substring(demoMatch.index + demoMatch[0].length);

    // Find URL after "demo"
    const linkMatch = textAfterDemo.match(/https?:\/\/[^\s\n)]+/i);

    if (!linkMatch) {
        return null;
    }

    const potentialLink = linkMatch[0];

    // Filter out image URLs
    const imageExtensions = /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?|$)/i;
    if (imageExtensions.test(potentialLink)) {
        console.log(`🖼️ Filtered out image URL: ${potentialLink}`);
        return null;
    }

    console.log(`🔗 Found demo link: ${potentialLink}`);
    return potentialLink;
}

/**
 * Extract project image from README content
 * Looks for markdown images or HTML img tags
 * @param {string} content - README content
 * @param {string} owner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {string|null} Project image URL or null
 */
export function extractProjectImage(content, owner, repoName) {
    if (!content) return null;

    // Get first 100 lines for performance
    const lines = content.split('\n').slice(0, 100);
    const first100Lines = lines.join('\n');

    // Image patterns to match (in order of preference)
    const imagePatterns = [
        // Markdown images with explicit extensions
        /!\[.*?\]\(([^)]+\.(png|jpg|jpeg|gif|webp|svg))\)/i,
        // Any markdown image
        /!\[.*?\]\(([^)]+)\)/i,
        // HTML img tags
        /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
    ];

    let projectImage = null;

    // Try each pattern
    for (const pattern of imagePatterns) {
        const match = first100Lines.match(pattern);
        if (match) {
            projectImage = match[1];

            // Convert relative paths to absolute GitHub URLs
            if (projectImage && !projectImage.startsWith('http')) {
                // Remove leading ./ or /
                projectImage = projectImage.replace(/^\.?\//, '');

                // Default to 'main' branch (most common)
                const branch = 'main';
                projectImage = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${projectImage}`;

                console.log(`🖼️ Converted relative path to: ${projectImage}`);
            }

            break;
        }
    }

    if (projectImage) {
        console.log(`✅ Found project image: ${projectImage}`);
    } else {
        console.log(`ℹ️ No project image found in README`);
    }

    return projectImage;
}

/**
 * Extract both demo link and project image from README
 * @param {string} content - README content
 * @param {string} owner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Object} { demoLink, projectImage }
 */
export function extractReadmePatterns(content, owner, repoName) {
    return {
        demo_link: extractDemoLink(content),
        project_image: extractProjectImage(content, owner, repoName),
    };
}

export default {
    extractDemoLink,
    extractProjectImage,
    extractReadmePatterns,
};
