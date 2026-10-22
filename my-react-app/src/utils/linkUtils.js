// Enhanced Link and Metadata Utilities

export const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch {
    return null;
  }
};

export const getDomainName = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return 'link';
  }
};

export const getPageTitle = (url) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment || lastSegment === 'index.html') {
      const brand = domain.split('.')[0];
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }

    const cleanSegment = lastSegment.replace(/\.[^/.]+$/, '').split(/[?#]/)[0];
    const formatted = cleanSegment
      .replace(/[-_+=]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!formatted) {
      const brand = domain.split('.')[0];
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }

    return formatted.replace(/\b\w/g, char => char.toUpperCase());
  } catch {
    return 'Saved Link';
  }
};

// Estimate reading time in minutes based on title / type
export const getEstimatedReadingTime = (url) => {
  const domain = getDomainName(url).toLowerCase();
  if (domain.includes('youtube') || domain.includes('vimeo')) {
    return 'Video';
  }
  if (domain.includes('github') || domain.includes('gitlab')) {
    return 'Repository';
  }
  if (domain.includes('medium') || domain.includes('substack') || domain.includes('blog') || domain.includes('dev.to')) {
    return '5 min read';
  }
  return '3 min read';
};

// Generate live screenshot thumbnail or rich visual fallback
export const getLinkPreviewData = (url) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // 1. YouTube video thumbnail
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      let videoId = null;
      if (domain.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      } else {
        videoId = urlObj.searchParams.get('v');
      }
      if (videoId) {
        return {
          type: 'image',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          badge: 'YouTube',
          accent: '#ff0000',
          gradient: 'linear-gradient(135deg, #18181b 0%, #dc2626 100%)'
        };
      }
    }

    // 2. High-speed Live Webpage Screenshot Thumbnail (WordPress mshots API)
    const cleanUrl = urlObj.origin + urlObj.pathname;
    const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=600&h=340`;

    // Curated brand presets for fallback or enhancement
    const presets = {
      'github.com': {
        gradient: 'linear-gradient(135deg, #181717 0%, #2b3137 100%)',
        badge: 'GitHub',
        accent: '#2b3137'
      },
      'figma.com': {
        gradient: 'linear-gradient(135deg, #0acf83 0%, #a259ff 50%, #f24e1e 100%)',
        badge: 'Figma',
        accent: '#a259ff'
      },
      'twitter.com': {
        gradient: 'linear-gradient(135deg, #1da1f2 0%, #0d8ddb 100%)',
        badge: 'X / Twitter',
        accent: '#1da1f2'
      },
      'x.com': {
        gradient: 'linear-gradient(135deg, #000000 0%, #202020 100%)',
        badge: 'X',
        accent: '#000000'
      },
      'dribbble.com': {
        gradient: 'linear-gradient(135deg, #ea4c89 0%, #ff76ac 100%)',
        badge: 'Dribbble',
        accent: '#ea4c89'
      },
      'notion.so': {
        gradient: 'linear-gradient(135deg, #2f3437 0%, #3f4448 100%)',
        badge: 'Notion',
        accent: '#2f3437'
      },
      'linear.app': {
        gradient: 'linear-gradient(135deg, #5e6ad2 0%, #26293b 100%)',
        badge: 'Linear',
        accent: '#5e6ad2'
      },
      'stripe.com': {
        gradient: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
        badge: 'Stripe',
        accent: '#635bff'
      },
      'react.dev': {
        gradient: 'linear-gradient(135deg, #087ea4 0%, #149eca 100%)',
        badge: 'React',
        accent: '#149eca'
      },
      'tailwindcss.com': {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)',
        badge: 'Tailwind',
        accent: '#06b6d4'
      }
    };

    for (const [key, preset] of Object.entries(presets)) {
      if (domain.includes(key)) {
        return {
          type: 'screenshot',
          thumbnailUrl: screenshotUrl,
          gradient: preset.gradient,
          badge: preset.badge,
          accent: preset.accent
        };
      }
    }

    // Default elegant gradient fallback based on domain hash
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 45) % 360;

    return {
      type: 'screenshot',
      thumbnailUrl: screenshotUrl,
      gradient: `linear-gradient(135deg, hsl(${hue1}, 70%, 45%) 0%, hsl(${hue2}, 80%, 25%) 100%)`,
      badge: domain.split('.')[0].toUpperCase(),
      accent: `hsl(${hue1}, 70%, 45%)`
    };
  } catch {
    return {
      type: 'screenshot',
      thumbnailUrl: null,
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
      badge: 'LINK',
      accent: '#4f46e5'
    };
  }
};

// Generate smart tag recommendations based on domain
export const getSuggestedTags = (url) => {
  const domain = getDomainName(url).toLowerCase();
  const tags = [];

  if (domain.includes('github') || domain.includes('gitlab') || domain.includes('stackoverflow')) {
    tags.push('Code', 'Developer');
  } else if (domain.includes('figma') || domain.includes('dribbble') || domain.includes('behance')) {
    tags.push('Design', 'Inspiration');
  } else if (domain.includes('youtube') || domain.includes('vimeo') || domain.includes('netflix')) {
    tags.push('Video', 'Media');
  } else if (domain.includes('medium') || domain.includes('substack') || domain.includes('dev.to')) {
    tags.push('Article', 'Reading');
  } else if (domain.includes('notion') || domain.includes('linear') || domain.includes('trello') || domain.includes('slack')) {
    tags.push('Productivity', 'Tools');
  } else {
    tags.push('Resource');
  }

  return tags;
};