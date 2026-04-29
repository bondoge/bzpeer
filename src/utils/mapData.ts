import type { AppData, VisibleInstitution } from '../types';

export function computeVisibleInstitutions(
  data: AppData,
  selectedPaperIds: Set<string>
): VisibleInstitution[] {
  if (selectedPaperIds.size === 0) return [];

  const instMap = new Map<string, VisibleInstitution>();

  for (const authorship of data.authorships) {
    if (!selectedPaperIds.has(authorship.paperId)) continue;

    const institution = data.institutions.find(i => i.id === authorship.institutionId);
    const paper = data.papers.find(p => p.id === authorship.paperId);
    const author = data.authors.find(a => a.id === authorship.authorId);

    if (!institution || !paper || !author) continue;

    if (!instMap.has(institution.id)) {
      instMap.set(institution.id, {
        id: institution.id,
        name: institution.name,
        city: institution.city,
        country: institution.country,
        lat: institution.lat,
        lon: institution.lon,
        paperIds: [],
        paperColors: [],
        authorCount: 0,
        authorsByPaper: {},
      });
    }

    const vis = instMap.get(institution.id)!;

    if (!vis.paperIds.includes(paper.id)) {
      vis.paperIds.push(paper.id);
      vis.paperColors.push(paper.color);
    }

    if (!vis.authorsByPaper[paper.id]) {
      vis.authorsByPaper[paper.id] = [];
    }

    if (!vis.authorsByPaper[paper.id].includes(author.name)) {
      vis.authorsByPaper[paper.id].push(author.name);
      vis.authorCount++;
    }
  }

  return Array.from(instMap.values());
}
