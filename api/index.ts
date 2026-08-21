import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Route-specific Open Graph configurations.
 * Each route gets its own og:image, title, and description.
 */
const OG_CONFIG: Record<string, { image: string; title: string; description: string }> = {
  '/': {
    image: 'https://vieraamber.com/og-home.svg',
    title: 'Viera Amber — For her, by her.',
    description: 'A creative ecosystem built for feminine empowerment.',
  },
  '/illustrations': {
    image: 'https://vieraamber.com/og-illustrations.svg',
    title: 'Illustrations — Viera Amber',
    description: 'Gallery of contemporary illustration celebrating feminine narratives.',
  },
  '/vagin': {
    image: 'https://vieraamber.com/og-vagin.svg',
    title: 'VAGIN — Viera Amber\'s Girls\' Initiative',
    description: 'Girls\' health education & leadership program for young women.',
  },
  '/viva': {
    image: 'https://vieraamber.com/og-viva.svg',
    title: 'VIVA — She claims. She creates.',
    description: 'Batya: Daughters of Adonai. Ajogún · The Inheritance. Nkà · The Craftsmanship.',
  },
  '/vam': {
    image: 'https://vieraamber.com/og-home.svg',
    title: 'VAM — Viera Amber Masterclass',
    description: 'Professional masterclass in illustration, fashion, and creative direction.',
  },
  '/vash': {
    image: 'https://vieraamber.com/og-home.svg',
    title: 'VASH — Viera Amber Shop',
    description: 'Curated marketplace for creative tools, resources, and collections.',
  },
};

/**
 * Get the correct OG config for a given pathname.
 * Matches exact routes first, then checks prefixes for nested routes.
 */
function getOGConfig(pathname: string): (typeof OG_CONFIG)[keyof typeof OG_CONFIG] {
  // Exact match first
  if (OG_CONFIG[pathname]) {
    return OG_CONFIG[pathname];
  }

  // Prefix match for nested routes (e.g., /viva/story -> /viva config)
  for (const [route, config] of Object.entries(OG_CONFIG)) {
    if (route !== '/' && pathname.startsWith(route + '/')) {
      return config;
    }
  }

  // Default to home
  return OG_CONFIG['/'];
}

/**
 * Injects route-specific og: meta tags into the HTML.
 * Called by Vercel for all requests; serves the SPA with dynamic og: tags.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract the pathname from the request
    const pathname = req.url ? new URL(req.url, `http://${req.headers.host}`).pathname : '/';

    // Get the correct og: config for this route
    const config = getOGConfig(pathname);

    // Read the built index.html from the Vite output
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Inject og: tags into the HTML
    // Replace existing og: meta tags with route-specific ones
    html = html.replace(
      /<meta property="og:image" content="[^"]*">/,
      `<meta property="og:image" content="${config.image}">`
    );
    html = html.replace(
      /<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="${config.title}">`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${config.description}">`
    );
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*">/,
      `<meta name="twitter:title" content="${config.title}">`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${config.description}">`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*">/,
      `<meta name="twitter:image" content="${config.image}">`
    );

    // Serve the HTML with proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error serving SPA:', error);
    res.status(500).json({ error: 'Failed to render page' });
  }
}
