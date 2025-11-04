import { NextResponse } from 'next/server';
import { runBacklinkAutomation } from '@/lib/agent';
import { DEFAULT_DIRECTORIES, type BacklinkDirectory } from '@/data/directories';
import type { BacklinkInput } from '@/lib/types';

function coerceDirectories(value: unknown): BacklinkDirectory[] {
  if (!Array.isArray(value)) {
    return DEFAULT_DIRECTORIES;
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Partial<BacklinkDirectory>;
      if (!raw.id || !raw.submissionUrl) return null;
      return {
        id: raw.id,
        name: raw.name ?? raw.id,
        description: raw.description ?? 'Custom directory',
        submissionUrl: raw.submissionUrl,
        method: raw.method === 'GET' ? 'GET' : 'POST',
        payloadTemplate: raw.payloadTemplate ?? {},
        headers: raw.headers,
        tier: raw.tier === 'niche' || raw.tier === 'advanced' ? raw.tier : 'foundational'
      } satisfies BacklinkDirectory;
    })
    .filter(Boolean) as BacklinkDirectory[];
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<BacklinkInput> & {
      dryRun?: boolean;
      directories?: BacklinkDirectory[];
      keywords?: string[] | string;
    };

    if (!payload.targetUrl) {
      return NextResponse.json({ error: 'targetUrl is required' }, { status: 400 });
    }

    const keywordValue = payload.keywords;

    const input: BacklinkInput = {
      targetUrl: payload.targetUrl,
      keywords: Array.isArray(keywordValue)
        ? (keywordValue.filter((value): value is string => typeof value === 'string' && value.trim().length > 0) as string[])
        : [],
      tone: payload.tone ?? 'authoritative',
      companyName: payload.companyName,
      contactEmail: payload.contactEmail,
      logoUrl: payload.logoUrl,
      customPitch: payload.customPitch,
      directories: coerceDirectories(payload.directories)
    };

    if (!input.keywords.length && typeof keywordValue === 'string') {
      input.keywords = keywordValue
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (!input.keywords.length) {
      input.keywords = ['backlink automation'];
    }

    const { assets, results } = await runBacklinkAutomation(input, {
      dryRun: Boolean(payload.dryRun)
    });

    return NextResponse.json({ assets, results }, { status: 200 });
  } catch (error) {
    console.error('[api/run]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 }
    );
  }
}
