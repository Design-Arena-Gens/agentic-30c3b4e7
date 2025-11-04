'use client';

import type { BacklinkResult, CampaignAssets } from '@/lib/types';

type Props = {
  assets?: CampaignAssets;
  results: BacklinkResult[];
  isRunning: boolean;
};

export function RunLog({ assets, results, isRunning }: Props) {
  if (!results.length) {
    return (
      <div className="card">
        <h3>Automation Log</h3>
        <p style={{ opacity: 0.7 }}>Launch a run to see live submission telemetry.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Automation Log</h3>
        {isRunning ? <span className="badge">Running…</span> : <span className="badge">Complete</span>}
      </div>

      {assets && (
        <details style={{ marginBottom: '1.25rem' }} open>
          <summary>Campaign Assets</summary>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
            <div>
              <strong>Headline</strong>
              <div className="code-block">{assets.headline}</div>
            </div>
            <div>
              <strong>Pitch</strong>
              <div className="code-block">{assets.pitch}</div>
            </div>
            <div>
              <strong>Article Blueprint</strong>
              <div className="code-block">{assets.article}</div>
            </div>
          </div>
        </details>
      )}

      <ul className="log-list">
        {results.map((result) => (
          <li
            key={result.directoryId + result.timestamp}
            className={`log-item ${result.status === 'success' ? 'success' : 'error'}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div>
                <strong>{result.directoryName}</strong>
                <p style={{ margin: '0.35rem 0 0', opacity: 0.85 }}>{result.message}</p>
                {result.payloadPreview && (
                  <details style={{ marginTop: '0.75rem' }}>
                    <summary>Payload</summary>
                    <div className="code-block" style={{ marginTop: '0.5rem' }}>
                      {JSON.stringify(result.payloadPreview, null, 2)}
                    </div>
                  </details>
                )}
                {result.responseSample !== undefined && result.responseSample !== null && (
                  (() => {
                    const preview =
                      typeof result.responseSample === 'string'
                        ? result.responseSample
                        : JSON.stringify(result.responseSample, null, 2);

                    return (
                      <details style={{ marginTop: '0.75rem' }}>
                        <summary>Response</summary>
                        <div className="code-block" style={{ marginTop: '0.5rem' }}>
                          {preview}
                        </div>
                      </details>
                    );
                  })()
                )}
              </div>
              <small>{new Date(result.timestamp).toLocaleTimeString()}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
