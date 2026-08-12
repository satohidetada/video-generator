import type { MetadataRoute } from 'next'

const BASE = 'https://video-generator-crg.pages.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
