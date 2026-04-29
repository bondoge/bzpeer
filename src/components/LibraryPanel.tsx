import { useState } from 'react';
import type { AppData } from '../types';
import { LibraryCard } from './LibraryCard';

interface LibraryPanelProps {
  data: AppData;
  visualizedPaperIds: Set<string>;
  onToggleVisualize: (id: string) => void;
  onRead: (id: string) => void;
}

export function LibraryPanel({
  data,
  visualizedPaperIds,
  onToggleVisualize,
  onRead,
}: LibraryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = data.papers.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`library-panel ${collapsed ? 'library-panel--collapsed' : ''}`}>
      <div className="library-header">
        <div className="library-header-left">
          <span className="library-title">Library</span>
          <span className="library-count">{data.papers.length} papers</span>
        </div>
        <div className="library-header-right">
          <input
            className="library-search"
            type="text"
            placeholder="Filter by title or venue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="library-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand library' : 'Collapse library'}
          >
            {collapsed ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="library-grid">
          {filtered.map(paper => (
            <LibraryCard
              key={paper.id}
              paper={paper}
              data={data}
              isOnMap={visualizedPaperIds.has(paper.id)}
              onToggleMap={onToggleVisualize}
              onRead={onRead}
            />
          ))}
          {filtered.length === 0 && (
            <div className="library-empty">No papers match your filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
