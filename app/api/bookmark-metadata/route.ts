import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const urlSchema = z.string().url();

const extractMeta = (html: string) => {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const ogTitleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i
  );
  const descriptionMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
  );
  const ogDescriptionMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i
  );

  return {
    title: ogTitleMatch?.[1]?.trim() || titleMatch?.[1]?.trim() || null,
    description:
      ogDescriptionMatch?.[1]?.trim() || descriptionMatch?.[1]?.trim() || null,
  };
};

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get('url');

    if (!urlParam) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    const validation = urlSchema.safeParse(urlParam);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }

    const response = await fetch(validation.data, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'ZenaraBookmarkBot/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch metadata' },
        { status: 502 }
      );
    }

    const html = await response.text();
    const { title, description } = extractMeta(html);

    return NextResponse.json({ title, description });
  } catch (error) {
    console.error('Failed to fetch bookmark metadata', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
