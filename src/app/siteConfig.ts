// Temporary launch gate: the client's final payment hasn't cleared yet, so the
// customer-facing store shows a "coming soon" page instead of the live site.
// Flip this to true once payment is settled to restore normal browsing —
// no other changes needed (see routes.tsx and Root.tsx).
export const SITE_LIVE = false;
