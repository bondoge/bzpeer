import type { Paper, AppData } from '../types';
import { PaperCard } from './PaperCard';

interface PaperTrayProps {
  papers: Paper[];
  data: AppData;
  selectedPaperIds: Set<string>;
  onTogglePaper: (id: string) => void;
}

export function PaperTray({ papers, data, selectedPaperIds, onTogglePaper }: PaperTrayProps) {
  return (
    <div className="paper-tray">
      <div className="tray-label">Papers</div>
      {papers.map(paper => (
        <PaperCard
          key={paper.id}
          paper={paper}
          isActive={selectedPaperIds.has(paper.id)}
          data={data}
          onToggle={onTogglePaper}
        />
      ))}
    </div>
  );
}
