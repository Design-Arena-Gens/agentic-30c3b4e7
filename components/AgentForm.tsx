'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_DIRECTORIES, type BacklinkDirectory } from '@/data/directories';
import type { BacklinkResult, CampaignAssets, CampaignTone } from '@/lib/types';

type AgentFormProps = {
  onComplete: (payload: { assets: CampaignAssets; results: BacklinkResult[] }) => void;
  onStart: () => void;
  onError: (message: string) => void;
};

const tones: { label: string; value: CampaignTone; helper: string }[] = [
  { label: 'Authoritative', value: 'authoritative', helper: 'Enterprise tone, confident and direct.' },
  { label: 'Conversational', value: 'conversational', helper: 'Warm, human, community-forward copy.' },
  { label: 'Technical', value: 'technical', helper: 'Data-heavy, strong for devtool or SaaS brands.' },
  { label: 'Playful', value: 'playful', helper: 'Friendly and energetic messaging.' }
];

export function AgentForm({ onComplete, onStart, onError }: AgentFormProps) {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [companyName, setCompanyName] = useState('Example Inc.');
  const [keywordInput, setKeywordInput] = useState('seo automation, backlink growth');
  const [tone, setTone] = useState<CampaignTone>('authoritative');
  const [contactEmail, setContactEmail] = useState('growth@example.com');
  const [logoUrl, setLogoUrl] = useState('');
  const [customPitch, setCustomPitch] = useState('');
  const [dryRun, setDryRun] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set(DEFAULT_DIRECTORIES.map((d) => d.id)));
  const [submitting, setSubmitting] = useState(false);

  const directories = useMemo(() => DEFAULT_DIRECTORIES, []);

  const toggleDirectory = (dir: BacklinkDirectory) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(dir.id)) {
        next.delete(dir.id);
      } else {
        next.add(dir.id);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetUrl) {
      onError('Target URL is required');
      return;
    }

    const selectedDirectories = directories.filter((dir) => selectedIds.has(dir.id));
    if (selectedDirectories.length === 0) {
      onError('Select at least one directory target');
      return;
    }

    try {
      setSubmitting(true);
      onStart();
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUrl,
          companyName,
          keywords: keywordInput.split(',').map((value) => value.trim()).filter(Boolean),
          tone,
          contactEmail: contactEmail || undefined,
          logoUrl: logoUrl || undefined,
          customPitch: customPitch || undefined,
          dryRun,
          directories: selectedDirectories
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Request failed');
      }

      const payload = (await response.json()) as {
        assets: CampaignAssets;
        results: BacklinkResult[];
      };

      onComplete(payload);
    } catch (error) {
      console.error(error);
      onError(error instanceof Error ? error.message : 'Unknown error running automation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>Backlink Automation</h2>
      <p style={{ opacity: 0.75 }}>Generate assets, launch submissions, and capture live responses.</p>

      <div className="grid" style={{ marginTop: '1.5rem', gap: '1.5rem' }}>
        <div className="grid two-col">
          <label>
            <span>Target URL</span>
            <input
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://yourdomain.com"
              required
            />
          </label>
          <label>
            <span>Brand Name</span>
            <input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Brand or product name"
            />
          </label>
        </div>

        <label>
          <span>Target Keywords</span>
          <textarea
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            rows={2}
            placeholder="comma separated keywords"
          />
        </label>

        <div className="grid two-col">
          <label>
            <span>Contact Email</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="team@yourdomain.com"
            />
          </label>
          <label>
            <span>Logo URL</span>
            <input
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://yourdomain.com/logo.png"
            />
          </label>
        </div>

        <label>
          <span>Tone</span>
          <select value={tone} onChange={(event) => setTone(event.target.value as CampaignTone)}>
            {tones.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '0.35rem', opacity: 0.7 }}>
            {tones.find((option) => option.value === tone)?.helper}
          </small>
        </label>

        <label>
          <span>Custom Pitch (optional)</span>
          <textarea
            value={customPitch}
            onChange={(event) => setCustomPitch(event.target.value)}
            rows={3}
            placeholder="Override generated messaging"
          />
        </label>

        <fieldset>
          <legend>Directory Targets</legend>
          <div className="grid" style={{ marginTop: '0.75rem' }}>
            {directories.map((directory) => (
              <label
                key={directory.id}
                style={{
                  display: 'grid',
                  gap: '0.35rem',
                  padding: '1rem',
                  background: selectedIds.has(directory.id)
                    ? 'rgba(14, 165, 233, 0.1)'
                    : 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.2)'
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(directory.id)}
                    onChange={() => toggleDirectory(directory)}
                  />
                  <div>
                    <strong>{directory.name}</strong>
                    <small style={{ display: 'block', opacity: 0.7 }}>{directory.description}</small>
                  </div>
                  <span className="badge">{directory.tier}</span>
                </div>
                <small style={{ opacity: 0.6 }}>Endpoint: {directory.submissionUrl}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />
          Run as dry-run (payload only)
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Running automation…' : 'Launch automation'}
        </button>
        <small style={{ opacity: 0.6 }}>Submissions are executed sequentially with live logging.</small>
      </div>
    </form>
  );
}
