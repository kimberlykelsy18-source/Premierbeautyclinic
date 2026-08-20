#!/usr/bin/env node
// Generates public/sitemap.xml from static routes + live product/service data.
// Runs as a build step (see package.json "build" script) so the sitemap Vite
// then copies into dist/ is never stale.

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_URL = 'https://premierbeautyclinic.com';

// ── Load root .env when running locally (Vercel injects env vars directly) ──
function loadDotEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Skin-concern slugs are a static map in SkinConcernPage.tsx, not DB-driven.
const SKIN_CONCERN_SLUGS = [
  'acne', 'hyperpigmentation', 'ageing-wrinkles', 'dryness', 'dark-circles',
  'sensitivity', 'melasma', 'oily-skin', 'scarring', 'dullness',
];

const STATIC_PAGES = [
  { path: '/',          priority: '1.0', changefreq: 'daily' },
  { path: '/shop',      priority: '0.9', changefreq: 'daily' },
  { path: '/services',  priority: '0.9', changefreq: 'weekly' },
  { path: '/routines',  priority: '0.6', changefreq: 'weekly' },
  { path: '/book',      priority: '0.8', changefreq: 'monthly' },
  { path: '/faq',       priority: '0.5', changefreq: 'monthly' },
];

async function fetchSupabase(table, select) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(`[sitemap] Missing Supabase env vars — skipping ${table}`);
    return [];
  }
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&is_active=eq.true`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] Failed to fetch ${table}: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] Failed to fetch ${table}: ${err.message}`);
    return [];
  }
}

function urlEntry(path, { priority = '0.5', changefreq = 'weekly', lastmod } = {}) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  const [products, services] = await Promise.all([
    fetchSupabase('products', 'id,updated_at'),
    fetchSupabase('services', 'slug,updated_at'),
  ]);

  const entries = [
    ...STATIC_PAGES.map(p => urlEntry(p.path, p)),
    ...products.map(p => urlEntry(`/shop/${p.id}`, { priority: '0.7', changefreq: 'weekly', lastmod: p.updated_at?.slice(0, 10) })),
    ...services.map(s => urlEntry(`/services/${s.slug}`, { priority: '0.8', changefreq: 'weekly', lastmod: s.updated_at?.slice(0, 10) })),
    ...SKIN_CONCERN_SLUGS.map(slug => urlEntry(`/skin-concern/${slug}`, { priority: '0.6', changefreq: 'monthly' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml);
  console.log(`[sitemap] Wrote ${entries.length} URLs to public/sitemap.xml (${products.length} products, ${services.length} services)`);
}

main().catch(err => {
  console.error('[sitemap] Generation failed:', err);
  // Non-fatal — don't block the build on a sitemap failure.
  process.exit(0);
});
