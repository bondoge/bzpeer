import type { Paper, AppData } from '../types';

interface ReaderModalProps {
  paper: Paper;
  data: AppData;
  onClose: () => void;
}

function getAuthors(data: AppData, paperId: string): string {
  return data.authorships
    .filter(a => a.paperId === paperId)
    .sort((a, b) => a.authorPosition - b.authorPosition)
    .map(a => data.authors.find(au => au.id === a.authorId)?.name ?? '')
    .filter(Boolean)
    .join(', ');
}

export function ReaderModal({ paper, data, onClose }: ReaderModalProps) {
  const authors = getAuthors(data, paper.id);

  return (
    <div className="reader-overlay" onClick={onClose}>
      <div className="reader-modal" onClick={e => e.stopPropagation()}>
        <div className="reader-modal-header" style={{ borderColor: paper.color }}>
          <div className="reader-modal-meta">{paper.venue} · {paper.year}</div>
          <h2 className="reader-modal-title">{paper.title}</h2>
          <div className="reader-modal-authors">{authors}</div>
          <button className="reader-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="reader-modal-body">
          <section className="reader-section">
            <h4 className="reader-section-label">Abstract</h4>
            <p className="reader-abstract-text">{paper.abstract}</p>
          </section>

          <section className="reader-section">
            <h4 className="reader-section-label">Identifier</h4>
            <a
              className="reader-doi-link"
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              doi:{paper.doi} ↗
            </a>
          </section>

          <div className="reader-placeholder">
            <div className="reader-placeholder-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3 className="reader-placeholder-title">Full text reader</h3>
            <p className="reader-placeholder-desc">
              PDF rendering, annotation, and highlighting tools are coming in the next release.
              For now, open the paper at the publisher.
            </p>
            <a
              className="reader-placeholder-link"
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on publisher website →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
