import { NextResponse } from 'next/server';

type MetaMatch = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

const getMeta = (html: string, names: string[]): string | undefined => {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const metaRegex = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i');
    const match = html.match(metaRegex);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
};

const getTitle = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const input = requestUrl.searchParams.get('url');

  if (!input) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(input);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http and https URLs are supported' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Fokus Link Preview/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          title: targetUrl.hostname,
          description: 'The page responded with an error while loading preview metadata.',
          url: targetUrl.toString(),
          host: targetUrl.host,
        },
        { status: 200 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();

    const metadata: MetaMatch = {
      title: getMeta(html, ['og:title', 'twitter:title']) || getTitle(html),
      description: getMeta(html, ['og:description', 'twitter:description', 'description']),
      image: getMeta(html, ['og:image', 'twitter:image']),
      siteName: getMeta(html, ['og:site_name']),
    };

    if (!contentType.includes('html') && !metadata.title) {
      metadata.title = targetUrl.hostname;
    }

    return NextResponse.json({
      title: metadata.title || targetUrl.hostname,
      description: metadata.description || 'No description available.',
      image: metadata.image,
      siteName: metadata.siteName,
      url: targetUrl.toString(),
      host: targetUrl.host,
    });
  } catch {
    return NextResponse.json(
      {
        title: targetUrl.hostname,
        description: 'Unable to load preview metadata for this link.',
        url: targetUrl.toString(),
        host: targetUrl.host,
      },
      { status: 200 }
    );
  } finally {
    clearTimeout(timeout);
  }
}