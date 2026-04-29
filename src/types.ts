export interface Paper {
  id: string;
  title: string;
  year: number;
  doi: string;
  color: string;
  venue: string;
  abstract: string;
  referencedPaperIds: string[];
}

export interface Institution {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Author {
  id: string;
  name: string;
}

export interface Authorship {
  paperId: string;
  authorId: string;
  institutionId: string;
  authorPosition: number;
}

export interface AppData {
  papers: Paper[];
  institutions: Institution[];
  authors: Author[];
  authorships: Authorship[];
}

export interface VisibleInstitution {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  paperIds: string[];
  paperColors: string[];
  authorCount: number;
  authorsByPaper: Record<string, string[]>;
}
