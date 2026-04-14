// Utility function to get favicon from URL
export const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch {
    return null;
  }
};
 
// Extract domain name from URL for display
export const getDomainName = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Link';
  }
};

// Extract page/product title from URL path
export const getPageTitle = (url) => {
  try {
    const pathname = new URL(url).pathname;
    // Get the last part of the path
    const segments = pathname.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1];
    
    if (!lastSegment) return 'Link';
    
    // Remove file extensions
    const withoutExtension = lastSegment.replace(/\.[^/.]+$/, '');
    
    // Replace hyphens/underscores with spaces and capitalize
    const title = withoutExtension
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
    
    return title || 'Link';
  } catch {
    return 'Link';
  }
};