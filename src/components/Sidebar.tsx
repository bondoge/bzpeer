import type { Paper } from '../types';

interface SidebarProps {
  visualizedPapers: Paper[];
  visualizedPaperIds: Set<string>;
  onRemovePaper: (id: string) => void;
  onClearAll: () => void;
  onFitSelected: () => void;
}

export function Sidebar({
  visualizedPapers,
  visualizedPaperIds,
  onRemovePaper,
  onClearAll,
  onFitSelected,
}: SidebarProps) {
  const hasAny = visualizedPaperIds.size > 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="app-title">
          <span className="app-title-accent">bz</span> peer
        </div>
        <div className="app-subtitle">Map the geography of scientific collaboration</div>
      </div>

      <div className="sidebar-controls">
        <div className="action-buttons">
          <button className="btn" onClick={onClearAll} disabled={!hasAny}>
            Clear map
          </button>
          <button className="btn btn-fit" onClick={onFitSelected} disabled={!hasAny}>
            Fit bounds
          </button>
        </div>
      </div>

      <div className="sidebar-section-label">
        On map
        {hasAny && (
          <span style={{
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: 0,
            marginLeft: 6,
            color: 'var(--color-accent)',
          }}>
            {visualizedPaperIds.size}
          </span>
        )}
      </div>

      <div className="paper-list">
        {hasAny ? (
          visualizedPapers.map(paper => (
            <div
              key={paper.id}
              className="paper-list-item active"
            >
              <div
                className="paper-list-swatch"
                style={{ background: paper.color }}
              />
              <div className="paper-list-info">
                <div className="paper-list-title">{paper.title}</div>
                <div className="paper-list-meta">{paper.venue} · {paper.year}</div>
              </div>
              <button
                className="paper-list-remove"
                onClick={() => onRemovePaper(paper.id)}
                title="Remove from map"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="sidebar-empty-state">
            <div className="sidebar-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <p className="sidebar-empty-title">No papers on the map</p>
            <p className="sidebar-empty-hint">
              Check ✓ papers in the Library below to visualize their author locations.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
