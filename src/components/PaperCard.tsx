import type { Paper, AppData } from '../types';

interface PaperCardProps {
  paper: Paper;
  isActive: boolean;
  data: AppData;
  onToggle: (id: string) => void;
}

export function PaperCard({ paper, isActive, data, onToggle }: PaperCardProps) {
  const authorCount = new Set(
    data.authorships
      .filter(a => a.paperId === paper.id)
      .map(a => a.authorId)
  ).size;

  const institutionCount = new Set(
    data.authorships
      .filter(a => a.paperId === paper.id)
      .map(a => a.institutionId)
  ).size;

  return (
    <div
      className={`paper-card ${isActive ? 'active' : ''}`}
      style={{ '--paper-color': paper.color } as React.CSSProperties}
      onClick={() => onToggle(paper.id)}
      title={paper.title}
    >
      <div className="paper-card-header">
        <div
          className="paper-card-dot"
          style={{ background: paper.color }}
        />
        <div className="paper-card-title">{paper.title}</div>
      </div>
      <div className="paper-card-meta">
        <span>{paper.year}</span>
        <span>· {authorCount} author{authorCount !== 1 ? 's' : ''}</span>
        <span>· {institutionCount} inst.</span>
      </div>
    </div>
  );
}
