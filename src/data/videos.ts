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
];

export const videos: Video[] = [
  {
    id: "1",
    title: "Love Next Door",
    category: "Kdrama",
    year: 2024,
    tags: ["romance", "comedy"],
    description: "A romantic comedy about childhood friends who reunite as adults.",
    image: "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/love-next-door",
    trending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    title: "Eternal Love",
    category: "Cdrama",
    year: 2023,
    tags: ["fantasy", "romance"],
    description: "A timeless love story that spans across three lifetimes.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/eternal-love",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "3",
    title: "Sky Castle",
    category: "Kdrama",
    year: 2022,
    tags: ["drama", "family"],
    description: "A satirical drama about the competitive world of Korea's elite families.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/sky-castle",
    trending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "4",
    title: "The Untamed",
    category: "Cdrama",
    year: 2021,
    tags: ["fantasy", "action"],
    description: "A tale of two soulmates in the world of cultivation and magic.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop",
    shortLink: "https://example.com/download/the-untamed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
