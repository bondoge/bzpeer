import type { Institution, VisibleInstitution, Paper } from '../types';

interface DetailsCardProps {
  institution: Institution;
  visibleInstitution: VisibleInstitution;
  papers: Paper[];
  onClose: () => void;
}

export function DetailsCard({
  institution,
  visibleInstitution,
  papers,
  onClose,
}: DetailsCardProps) {
  const paperMap = new Map(papers.map(p => [p.id, p]));

  return (
    <div className="details-card">
      <div className="details-card-header">
        <div className="details-inst-info">
          <div className="details-inst-name">{institution.name}</div>
          <div className="details-inst-location">
            {institution.city}, {institution.country}
          </div>
        </div>
        <button className="details-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="details-body">
        <div className="details-coords">
          {institution.lat.toFixed(4)}°, {institution.lon.toFixed(4)}°
        </div>

        <div className="details-papers-label">
          {visibleInstitution.paperIds.length} selected paper{visibleInstitution.paperIds.length !== 1 ? 's' : ''}
          {' · '}
          {visibleInstitution.authorCount} author{visibleInstitution.authorCount !== 1 ? 's' : ''}
        </div>

        {visibleInstitution.paperIds.map(paperId => {
          const paper = paperMap.get(paperId);
          if (!paper) return null;
          const authors = visibleInstitution.authorsByPaper[paperId] ?? [];
          return (
            <div key={paperId} className="details-paper-section">
              <div className="details-paper-label">
                <div
                  className="details-paper-dot"
                  style={{ background: paper.color }}
                />
                <div className="details-paper-title">{paper.title}</div>
              </div>
              <div className="details-authors">
                {authors.map(name => (
                  <div key={name} className="details-author">{name}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
