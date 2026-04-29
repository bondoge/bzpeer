import type { CSSProperties } from 'react';
import type { Paper, AppData } from '../types';

interface LibraryCardProps {
  paper: Paper;
  data: AppData;
  isOnMap: boolean;
  onToggleMap: (id: string) => void;
  onRead: (id: string) => void;
}

function formatAuthors(data: AppData, paperId: string): string {
  const sorted = data.authorships
    .filter(a => a.paperId === paperId)
    .sort((a, b) => a.authorPosition - b.authorPosition);

  const names = sorted.map(a => {
    const author = data.authors.find(au => au.id === a.authorId);
    if (!author) return '';
    const parts = author.name.split(' ');
    const last = parts[parts.length - 1];
    const initials = parts
      .slice(0, -1)
      .map(p => p[0])
      .join('');
    return `${last} ${initials}`;
  }).filter(Boolean);

  if (names.length <= 4) return names.join(', ');
  return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
}

export function LibraryCard({ paper, data, isOnMap, onToggleMap, onRead }: LibraryCardProps) {
  const authorLine = formatAuthors(data, paper.id);

  const authorCount = new Set(
    data.authorships.filter(a => a.paperId === paper.id).map(a => a.authorId)
  ).size;

  const institutionCount = new Set(
    data.authorships.filter(a => a.paperId === paper.id).map(a => a.institutionId)
  ).size;

  const shortDoi = paper.doi.replace('10.', '').slice(0, 20) + (paper.doi.length > 23 ? '…' : '');

  return (
    <article
      className={`lib-card ${isOnMap ? 'lib-card--on-map' : ''}`}
      style={{ '--card-color': paper.color } as CSSProperties}
    >
      <div className="lib-card-spine" />

      <div className="lib-card-body">
        {/* Top row: venue + checkbox */}
        <div className="lib-card-top-row">
          <span className="lib-card-venue">{paper.venue} · {paper.year}</span>
          <label
            className="lib-card-checkbox-label"
            title={isOnMap ? 'Remove from map' : 'Add to map'}
            onClick={e => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="lib-card-checkbox-input"
              checked={isOnMap}
              onChange={() => onToggleMap(paper.id)}
            />
            <span className="lib-card-checkbox-custom" />
          </label>
        </div>

        {/* Title — clickable for reader */}
        <h3
          className="lib-card-title"
          onClick={() => onRead(paper.id)}
          title="Open reader"
        >
          {paper.title}
        </h3>

        {/* Authors */}
        <div className="lib-card-authors">{authorLine}</div>

        {/* Abstract */}
        <p className="lib-card-abstract">{paper.abstract}</p>

        {/* Footer */}
        <div className="lib-card-footer">
          <span className="lib-card-badge">{authorCount} authors</span>
          <span className="lib-card-badge">{institutionCount} inst.</span>
          <span className="lib-card-doi" title={paper.doi}>{shortDoi}</span>
          <button
            className="lib-card-read-btn"
            onClick={() => onRead(paper.id)}
          >
            Read →
          </button>
        </div>
      </div>
    </article>
  );
}
