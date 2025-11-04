'use client';

import { useState } from 'react';
import { AgentForm } from '@/components/AgentForm';
import { RunLog } from '@/components/RunLog';
import type { BacklinkResult, CampaignAssets } from '@/lib/types';

export function AgentDashboard() {
  const [assets, setAssets] = useState<CampaignAssets | undefined>();
  const [results, setResults] = useState<BacklinkResult[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  return (
    <main className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <span className="badge" style={{ marginBottom: '1rem' }}>
          Autonomous SEO Agent
        </span>
        <h1 style={{ fontSize: '2.8rem', margin: 0 }}>Backlink Automation Playbook</h1>
        <p style={{ opacity: 0.7, marginTop: '0.75rem', maxWidth: '620px', marginInline: 'auto' }}>
          Deploy a self-driving backlink workflow that generates campaign assets, targets curated directories,
          and records submission telemetry for your brand. Bring your own endpoints or extend from presets.
        </p>
      </header>

      {flash && (
        <div
          className="card"
          style={{
            borderColor: 'rgba(248, 113, 113, 0.45)',
            color: 'rgb(248, 250, 252)',
            marginBottom: '1.5rem'
          }}
        >
          <strong>Automation status:</strong> {flash}
        </div>
      )}

      <div className="grid" style={{ gap: '2rem' }}>
        <AgentForm
          onStart={() => {
            setIsRunning(true);
            setFlash(null);
            setResults([]);
          }}
          onComplete={({ assets: campaignAssets, results: campaignResults }) => {
            setAssets(campaignAssets);
            setResults(campaignResults);
            setIsRunning(false);
          }}
          onError={(message) => {
            setFlash(message);
            setIsRunning(false);
          }}
        />
        <RunLog assets={assets} results={results} isRunning={isRunning} />
      </div>
    </main>
  );
}
