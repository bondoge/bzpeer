import { useState, useEffect, useCallback } from 'react';
import type { AppData, VisibleInstitution } from './types';
import { loadData } from './data';
import { computeVisibleInstitutions } from './utils/mapData';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { DetailsCard } from './components/DetailsCard';
import { LibraryPanel } from './components/LibraryPanel';
import { ReaderModal } from './components/ReaderModal';

export function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [visualizedPaperIds, setVisualizedPaperIds] = useState<Set<string>>(new Set());
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [visibleInstitutions, setVisibleInstitutions] = useState<VisibleInstitution[]>([]);
  const [readerPaperId, setReaderPaperId] = useState<string | null>(null);

  useEffect(() => {
    loadData().then(d => setData(d));
  }, []);

  useEffect(() => {
    if (!data) return;
    setVisibleInstitutions(computeVisibleInstitutions(data, visualizedPaperIds));
  }, [data, visualizedPaperIds]);

  const toggleVisualize = useCallback((paperId: string) => {
    setVisualizedPaperIds(prev => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
      } else {
        next.add(paperId);
        setShouldFitBounds(true);
      }
      return next;
    });
  }, []);

  const removePaper = useCallback((paperId: string) => {
    setVisualizedPaperIds(prev => {
      const next = new Set(prev);
      next.delete(paperId);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setVisualizedPaperIds(new Set());
    setSelectedInstitutionId(null);
  }, []);

  const fitSelected = useCallback(() => {
    setShouldFitBounds(true);
  }, []);

  const handleInstitutionClick = useCallback((id: string) => {
    setSelectedInstitutionId(prev => (prev === id ? null : id));
  }, []);

  const openReader = useCallback((paperId: string) => {
    setReaderPaperId(paperId);
  }, []);

  if (!data) {
    return (
      <div className="loading-screen">
        <div className="loading-title">
          <span style={{ color: 'var(--color-accent)' }}>bz</span> peer
        </div>
        <div className="loading-spinner" />
        <div style={{ fontSize: 12 }}>Loading atlas…</div>
      </div>
    );
  }

  const visualizedPapers = data.papers.filter(p => visualizedPaperIds.has(p.id));
  const selectedInstitution = data.institutions.find(i => i.id === selectedInstitutionId) ?? null;
  const selectedVisibleInst = visibleInstitutions.find(i => i.id === selectedInstitutionId) ?? null;
  const readerPaper = readerPaperId ? data.papers.find(p => p.id === readerPaperId) ?? null : null;

  const scrollToLibrary = () => {
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <Sidebar
        visualizedPapers={visualizedPapers}
        visualizedPaperIds={visualizedPaperIds}
        onRemovePaper={removePaper}
        onClearAll={clearAll}
        onFitSelected={fitSelected}
      />

      <div className="right-col">
        <div className="map-area">
          <MapView
            visibleInstitutions={visibleInstitutions}
            onInstitutionClick={handleInstitutionClick}
            selectedInstitutionId={selectedInstitutionId}
            shouldFitBounds={shouldFitBounds}
            onFitBoundsDone={() => setShouldFitBounds(false)}
          />
          {selectedVisibleInst && selectedInstitution && (
            <DetailsCard
              institution={selectedInstitution}
              visibleInstitution={selectedVisibleInst}
              papers={data.papers}
              onClose={() => setSelectedInstitutionId(null)}
            />
          )}
          <button className="map-library-hint" onClick={scrollToLibrary}>
            <span className="map-library-hint-arrow">↓</span>
            Library
          </button>
        </div>

        <div id="library">
          <LibraryPanel
            data={data}
            visualizedPaperIds={visualizedPaperIds}
            onToggleVisualize={toggleVisualize}
            onRead={openReader}
          />
        </div>
      </div>

      {readerPaper && (
        <ReaderModal
          paper={readerPaper}
          data={data}
          onClose={() => setReaderPaperId(null)}
        />
      )}
    </Layout>
  );
}
