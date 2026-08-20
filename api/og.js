// Serves static, crawler-friendly OG/Twitter meta tags for social link previews
// (WhatsApp, Facebook, Twitter/X, Telegram, Slack, Discord, LinkedIn, iMessage…).
//
// WHY THIS EXISTS:
// The storefront is a pure client-side React SPA — no SSR. Those crawlers fetch
// a URL and read <meta> tags straight out of the raw HTML; they never run our
// JavaScript, so the per-page tags the app sets at runtime (see src/app/lib/seo.ts)
// are invisible to them. Real customers share product/treatment links over
// WhatsApp constantly (that's the checkout flow), so unbranded previews are a
// real loss. vercel.json only routes known crawler user-agents here (see the
// `has` header match on the /shop/:id and /services|/treatments/:slug rewrites) —
// everyone else still gets the normal SPA via the catch-all rewrite.

const SITE_URL = 'https://premierbeautyclinic.com';
const SITE_NAME = 'Premier Beauty Clinic';
const DEFAULT_DESCRIPTION =
  'Premium, dermatologist-approved skincare and beauty treatments in Kilimani, Nairobi.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const API_BASE =
  process.env.API_BASE_URL || process.env.VITE_API_URL || 'https://premierbeautyclinic-production.up.railway.app';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderPage({ title, description, url, image, jsonLd }) {
  const fullTitle = escapeHtml(title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);
  const desc = escapeHtml((description || DEFAULT_DESCRIPTION).slice(0, 300));
  const safeUrl = escapeHtml(url);
  const safeImage = escapeHtml(image || DEFAULT_IMAGE);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${fullTitle}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${safeUrl}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${fullTitle}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${safeUrl}" />
<meta property="og:image" content="${safeImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${fullTitle}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${safeImage}" />
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<p><a href="${safeUrl}">${fullTitle}</a></p>
</body>
</html>`;
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function handler(req, res) {
  const { type, id, slug } = req.query;
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');

  try {
    if (type === 'product' && id) {
      const product = await fetchJson(`/products/${id}`);
      if (!product) return res.status(404).send(renderPage({
        title: 'Product Not Found', url: `${SITE_URL}/shop/${id}`,
      }));

      res.status(200).send(renderPage({
        title: product.brand ? `${product.name} by ${product.brand}` : product.name,
        description: product.description || `Shop ${product.name} at ${SITE_NAME} — KES ${product.price}.`,
        url: `${SITE_URL}/shop/${product.id}`,
        image: product.images?.[0],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.images?.length ? product.images : [DEFAULT_IMAGE],
          offers: { '@type': 'Offer', priceCurrency: 'KES', price: String(product.price) },
        },
      }));
      return;
    }

    if (type === 'service' && slug) {
      const service = await fetchJson(`/services/${slug}`);
      if (!service) return res.status(404).send(renderPage({
        title: 'Service Not Found', url: `${SITE_URL}/services/${slug}`,
      }));

      res.status(200).send(renderPage({
        title: service.name,
        description: service.description || `Book ${service.name} at ${SITE_NAME} — Kilimani, Nairobi.`,
        url: `${SITE_URL}/services/${service.slug}`,
        image: service.images?.[0],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: service.name,
          name: service.name,
          provider: { '@type': 'BeautySalon', name: SITE_NAME },
        },
      }));
      return;
    }

    // Unknown/missing params — fall back to the site default so a crawler
    // still gets something branded instead of an error page.
    res.status(200).send(renderPage({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
    }));
  } catch (err) {
    res.status(200).send(renderPage({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
    }));
  }
}
