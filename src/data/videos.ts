export type Video = {
  id: string;
  title: string;
  category: string;
  year: number;
  tags: string[];
  description: string;
  image: string; // poster url
  shortLink: string; // external link to redirect
  trending?: boolean;
  createdAt: string; // ISO
};

export const categories = [
  "Kdrama",
  "Cdrama",
  "Action",
  "Comedy",
  "Romance",
  "Thriller",
  "Sci-Fi",
];

export const videos: Video[] = [
  {
    id: "1",
    title: "Neon Streets",
    category: "Action",
    year: 2024,
    tags: ["action", "city", "thriller"],
    description: "A rogue agent returns to a cyber-lit metropolis to stop a syndicate.",
    image: "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/neon-streets",
    trending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    title: "Autumn Sonata",
    category: "Romance",
    year: 2023,
    tags: ["romance", "drama"],
    description: "Two strangers meet among falling leaves and rewrite their tomorrows.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/autumn-sonata",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "3",
    title: "Moon Harbor",
    category: "Thriller",
    year: 2022,
    tags: ["mystery", "noir"],
    description: "Disappearance at a foggy harbor reveals a web of secrets.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/moon-harbor",
    trending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "4",
    title: "Zero Gravity",
    category: "Sci-Fi",
    year: 2021,
    tags: ["space", "sci-fi"],
    description: "A lone pilot is stranded near a silent black hole.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/zero-gravity",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
