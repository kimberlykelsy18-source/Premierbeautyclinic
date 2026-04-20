-- ============================================================
-- Premier Beauty Clinic — Database Seed Script
-- Run once in the Supabase SQL Editor
-- ============================================================


-- ─── STEP 1: Product Categories ──────────────────────────────────────────────

INSERT INTO public.categories (name, slug) VALUES
  ('Cleansers',          'cleansers'),
  ('Moisturisers',       'moisturisers'),
  ('Serums',             'serums'),
  ('Sunscreen',          'sunscreen'),
  ('Toners & Mists',     'toners-mists'),
  ('Eye Care',           'eye-care'),
  ('Masks & Treatments', 'masks-treatments'),
  ('Body Care',          'body-care'),
  ('Hair Care',          'hair-care'),
  ('Wellness',           'wellness')
ON CONFLICT (slug) DO NOTHING;


-- ─── STEP 2: Products ────────────────────────────────────────────────────────
-- All prices in KES. Images left as empty array — upload via admin dashboard.

WITH _products(name, description, price, brand, stock, threshold, instructions, cat_slug) AS (
  VALUES

  -- ── CLEANSERS ─────────────────────────────────────────────────────────────

  (
    'CeraVe Hydrating Cleanser 236ml',
    'A gentle, non-foaming cleanser that removes dirt, oil, and makeup without disrupting the skin''s natural barrier. Formulated with three essential ceramides and hyaluronic acid for lasting hydration. Ideal for dry to normal skin types. Dermatologist-developed and fragrance-free.',
    2200, 'CeraVe', 30, 5,
    'Apply to wet face and neck. Massage gently in circular motions. Rinse thoroughly with lukewarm water. Use morning and evening.',
    'cleansers'
  ),
  (
    'La Roche-Posay Effaclar Purifying Foaming Gel 200ml',
    'An oil-free, dermatologist-tested foaming cleanser formulated for oily and acne-prone skin. Zinc pidolate controls excess sebum while LHA gently exfoliates pores. Leaves skin clean, refreshed, and balanced without over-drying.',
    2800, 'La Roche-Posay', 25, 5,
    'Wet face and hands. Apply a coin-sized amount and work into a lather. Massage onto face and neck in circular motions. Rinse well. Use morning and evening.',
    'cleansers'
  ),
  (
    'The Ordinary Squalane Cleanser 50ml',
    'A dual-action makeup remover and cleanser in one. Plant-derived squalane dissolves sunscreen, makeup, and impurities while deeply nourishing the skin. Transforms from balm to milky cleanser on contact with water. Suitable for all skin types including sensitive.',
    1800, 'The Ordinary', 35, 8,
    'Apply to dry face and massage to dissolve makeup and impurities. Add a small amount of water to emulsify. Rinse thoroughly. Can also be used as a second-cleanse step.',
    'cleansers'
  ),
  (
    'Cetaphil Gentle Skin Cleanser 500ml',
    'A dermatologist-recommended, soap-free cleanser that gently removes dirt and excess oil while maintaining optimal skin pH. Non-comedogenic, fragrance-free, and clinically proven for sensitive skin. Suitable for all skin types including rosacea and eczema-prone skin.',
    1500, 'Cetaphil', 40, 10,
    'Apply to wet or dry skin. Lather gently using fingertips. Rinse off or wipe off without rinsing. Can also serve as a gentle makeup remover.',
    'cleansers'
  ),
  (
    'Neutrogena Oil-Free Acne Wash 175ml',
    'A salicylic acid-powered cleanser clinically proven to treat and prevent acne breakouts. Removes excess oil, dead skin cells, and impurities from pores. Oil-free formula leaves skin feeling clean and refreshed without stripping moisture.',
    1900, 'Neutrogena', 30, 5,
    'Wet face. Apply a small amount and work into a gentle lather. Massage onto skin avoiding eye area. Rinse completely. Use twice daily.',
    'cleansers'
  ),
  (
    'Bioderma Sensibio H2O Micellar Water 500ml',
    'The iconic French pharmacy micellar cleansing water formulated for sensitive skin. Gently yet effectively removes makeup, impurities, and excess sebum with no rinsing required. Preserves the skin''s natural ecosystem and strengthens its tolerance threshold.',
    3200, 'Bioderma', 25, 5,
    'Saturate a cotton pad and sweep gently over face, eyes, and lips. No rinsing required. Can be used morning and evening as a first-cleanse step.',
    'cleansers'
  ),

  -- ── MOISTURISERS ──────────────────────────────────────────────────────────

  (
    'CeraVe Moisturising Cream 177g',
    'A rich, non-greasy moisturiser clinically proven to restore and strengthen the skin barrier. Features MVE Delivery Technology for controlled, 24-hour hydration. Contains three essential ceramides, hyaluronic acid, and niacinamide. Ideal for dry to very dry skin. Non-comedogenic and fragrance-free.',
    2800, 'CeraVe', 30, 5,
    'Apply to face and/or body after cleansing. Can be used morning and evening. Suitable for use on severely dry, cracked, and sensitive skin.',
    'moisturisers'
  ),
  (
    'La Roche-Posay Toleriane Double Repair Face Moisturiser 75ml',
    'A prebiotic moisturiser that repairs, soothes, and restores the skin''s microbiome. Clinically proven 48-hour hydration with ceramide-3, niacinamide, and La Roche-Posay thermal spring water. Oil-free, fragrance-free, and suitable for sensitive skin.',
    3800, 'La Roche-Posay', 20, 4,
    'Apply morning and evening to clean face and neck. Can be used alone or under SPF and makeup. Allow to fully absorb before applying sunscreen.',
    'moisturisers'
  ),
  (
    'Neutrogena Hydro Boost Water Gel 50ml',
    'A lightweight, oil-free gel-cream that locks in moisture using hyaluronic acid — the same molecule that naturally exists in skin. Clinically proven to instantly quench dry skin and keep it hydrated all day. Non-comedogenic, suitable for oily and combination skin.',
    3200, 'Neutrogena', 25, 5,
    'Apply to clean face morning and/or evening. Use alone or under SPF and makeup. A small amount goes a long way.',
    'moisturisers'
  ),
  (
    'The Ordinary Natural Moisturising Factors + HA 100ml',
    'A balanced, science-backed moisturiser that addresses multiple aspects of skin dehydration. Contains amino acids, fatty acids, ceramides, and hyaluronic acid — mimicking the skin''s own natural moisturising factors. Lightweight, rapidly absorbed, and fragrance-free.',
    1600, 'The Ordinary', 40, 10,
    'Apply a small amount to clean face and neck morning and/or evening. Can be layered over serums and under SPF.',
    'moisturisers'
  ),
  (
    'Premier Beauty Barrier Repair Cream 50ml',
    'Our clinic-exclusive, dermatologist-formulated cream designed for post-treatment recovery and compromised skin barriers. Features a synergistic blend of ceramide NP, peptides (Matrixyl 3000), niacinamide, and centella asiatica extract. Clinically tested for African and melanin-rich skin tones. Soothes, repairs, and strengthens.',
    4500, 'Premier Beauty', 20, 5,
    'Apply morning and evening to face and neck after serum. Particularly beneficial after in-clinic treatments like chemical peels, laser, or microdermabrasion. Can be applied more generously at night as an overnight repair mask.',
    'moisturisers'
  ),
  (
    'Cetaphil Moisturising Lotion 250ml',
    'A lightweight, fast-absorbing daily moisturiser for normal to combination skin. Non-greasy formula that hydrates and soothes without clogging pores. Contains sweet almond oil, vitamin B5, and vitamin E. Dermatologist-recommended for sensitive skin.',
    1800, 'Cetaphil', 35, 8,
    'Apply to face and body after bathing or as needed throughout the day. Safe for use on skin with eczema and rosacea.',
    'moisturisers'
  ),

  -- ── SERUMS ────────────────────────────────────────────────────────────────

  (
    'The Ordinary Niacinamide 10% + Zinc 1% 30ml',
    'A high-strength vitamin B3 serum that visibly reduces blemishes, controls excess sebum, minimises pore appearance, and evens skin tone. The addition of zinc supports sebum regulation and reduces skin congestion. One of the most versatile serums for oily, combination, and blemish-prone skin.',
    1800, 'The Ordinary', 50, 10,
    'Apply 3-4 drops to face morning and/or evening before moisturiser. Do not mix directly with Vitamin C serums in the same routine — use at different times.',
    'serums'
  ),
  (
    'The Ordinary Hyaluronic Acid 2% + B5 30ml',
    'A multi-depth hydration serum with multiple molecular weights of hyaluronic acid that plumps and hydrates at the surface, mid, and deep layers of skin. Vitamin B5 (panthenol) boosts surface smoothness and aids skin repair. Fragrance-free and suitable for all skin types.',
    1600, 'The Ordinary', 45, 10,
    'Apply 2-3 drops to damp face before moisturiser. For best results, apply to slightly wet skin to lock in surface moisture.',
    'serums'
  ),
  (
    'The Ordinary Retinol 0.5% in Squalane 30ml',
    'A medium-strength pure retinol serum for anti-aging, skin renewal, and texture improvement. Reduces fine lines and wrinkles, evens skin texture, and stimulates collagen production. Suspended in squalane for a less irritating delivery. For retinol-experienced users.',
    2200, 'The Ordinary', 30, 5,
    'Apply PM only to clean face, after water-based serums, before moisturiser. Start 2-3 nights per week, gradually increasing frequency. Always use SPF 50+ the following morning.',
    'serums'
  ),
  (
    'SkinCeuticals C E Ferulic Serum 30ml',
    'The gold standard in antioxidant skincare. A patented vitamin C + E + ferulic acid combination at a pH that maximises absorption and efficacy. Neutralises free radicals, visibly brightens, reduces fine lines, and builds UV protection. Clinically proven to protect and repair UV-damaged skin.',
    12500, 'SkinCeuticals', 15, 3,
    'Apply 4-5 drops to clean dry face, neck, and chest every morning before SPF. Allow 5 minutes to fully absorb. Shelf-stable for 6 months after opening.',
    'serums'
  ),
  (
    'Premier Beauty Brightening Vitamin C Serum 30ml',
    'A clinic-formulated high-potency brightening serum using ethyl ascorbic acid (20% stable vitamin C) combined with kojic acid and licorice root extract. Specifically developed to address hyperpigmentation, post-inflammatory marks, and uneven skin tone in melanin-rich skin. No irritation, no oxidation.',
    5500, 'Premier Beauty', 20, 5,
    'Apply 3-4 drops to clean face every morning. Follow immediately with SPF 50+. Store in a cool, dark place away from direct sunlight. Use within 3 months of opening.',
    'serums'
  ),
  (
    'Garnier Vitamin C Brightening Serum 30ml',
    'An affordable daily brightening serum with 3.5% pure vitamin C combined with niacinamide and salicylic acid. Reduces dark spots, evens skin tone, and provides antioxidant protection. Lightweight texture absorbs quickly. Suitable for all skin types.',
    1400, 'Garnier', 40, 8,
    'Apply morning to clean face before moisturiser. Follow with SPF. Use daily for best results. Avoid contact with eyes.',
    'serums'
  ),
  (
    'Obagi Professional-C Serum 20% 30ml',
    'A clinical-grade 20% L-ascorbic acid serum formulated for maximum brightening and anti-aging results. Penetrates deep into skin to stimulate collagen, correct sun damage, and visibly fade hyperpigmentation. Trusted by dermatologists worldwide. For experienced Vitamin C users.',
    8500, 'Obagi', 12, 3,
    'Apply 3-5 drops to clean dry face each morning. Allow to fully absorb before applying moisturiser and SPF. Start with every other day to assess tolerance.',
    'serums'
  ),

  -- ── SUNSCREEN ─────────────────────────────────────────────────────────────

  (
    'La Roche-Posay Anthelios SPF 50+ Ultra-Light 50ml',
    'A broad-spectrum UVA/UVB sunscreen with an ultra-light, non-greasy texture suitable for sensitive and acne-prone skin. Tested under extreme conditions. Water-resistant for 40 minutes. Contains La Roche-Posay thermal spring water to soothe skin.',
    4200, 'La Roche-Posay', 25, 5,
    'Apply generously to face and exposed skin 15-20 minutes before sun exposure. Reapply every 2 hours and after swimming or sweating. Use as the last step of your morning skincare routine.',
    'sunscreen'
  ),
  (
    'Neutrogena Ultra Sheer Dry-Touch SPF 50 88ml',
    'A lightweight, fast-absorbing sunscreen with HELIOPLEX technology for superior broad-spectrum protection. Dry-touch formula leaves no greasy residue. Non-comedogenic, fragrance-free, and suitable for daily wear under makeup.',
    3600, 'Neutrogena', 30, 5,
    'Apply liberally to face and exposed skin 15 minutes before sun exposure. Reapply at least every 2 hours. Apply more often after swimming, sweating, or towel-drying.',
    'sunscreen'
  ),
  (
    'The Ordinary Mineral UV Filters SPF 30 50ml',
    'A 100% mineral sunscreen using zinc oxide and titanium dioxide for broad-spectrum protection with minimal white cast. Antioxidant-rich base with sea buckthorn berry and resveratrol. Water-resistant, reef-safe, and suitable for sensitive skin.',
    2200, 'The Ordinary', 35, 8,
    'Apply as the final step of morning skincare routine to face and neck. Blend well to minimise white cast. Reapply every 2 hours during sun exposure.',
    'sunscreen'
  ),
  (
    'Skin Aqua UV Moisture Milk SPF 50+ PA++++ 40ml',
    'A Japanese-formulated ultra-lightweight SPF milk that doubles as a moisturiser. Moisture-retaining collagen complex and hyaluronic acid keep skin hydrated all day. Zero white cast. Perfect for everyday wear and as a makeup base.',
    3000, 'Rohto Mentholatum', 25, 5,
    'Apply to face and neck after moisturiser as the last step in morning skincare. Pat in gently for best results. Reapply every 2 hours during prolonged sun exposure.',
    'sunscreen'
  ),
  (
    'Black Girl Sunscreen SPF 30 88ml',
    'A sheer, moisturising sunscreen with absolutely zero white cast, formulated for deep and melanin-rich skin tones. Enriched with avocado, jojoba, sunflower, and cacao to nourish while protecting. Fragrance-free and reef-safe.',
    3500, 'Black Girl Sunscreen', 20, 5,
    'Apply to face and exposed areas as the last step of morning routine. Can be worn alone or over moisturiser. Reapply every 2 hours in direct sunlight.',
    'sunscreen'
  ),

  -- ── TONERS & MISTS ────────────────────────────────────────────────────────

  (
    'Some By Mi AHA BHA PHA 30 Days Miracle Toner 150ml',
    'A triple acid exfoliating toner that resurfaces skin texture, unclogs pores, and brightens dull skin in 30 days of consistent use. AHA (glycolic) works on surface, BHA (salicylic) targets pores, PHA (gluconolactone) exfoliates gently. Also contains teatree oil and allantoin for soothing.',
    2400, 'Some By Mi', 30, 5,
    'Apply to clean face with a cotton pad or pat in directly with hands. Use morning and/or evening after cleansing. If new to acids, start 3 times per week and increase gradually.',
    'toners-mists'
  ),
  (
    'Thayers Alcohol-Free Rose Petal Witch Hazel Toner 355ml',
    'A cult-favourite alcohol-free toner with witch hazel, rose water, and aloe vera that tones, hydrates, and soothes skin without stripping. Minimises the appearance of pores and balances skin pH. Fragrance from natural rose extract only. Suitable for all skin types.',
    2000, 'Thayers', 30, 5,
    'Apply to clean face after cleansing using a cotton pad or fingertips. Can be used morning and evening before serum and moisturiser.',
    'toners-mists'
  ),
  (
    'Heritage Store Rose Water & Glycerin Facial Mist 237ml',
    'A pure rose water and vegetable glycerin mist that instantly refreshes, hydrates, and restores a dewy glow. Lightweight enough to use over makeup throughout the day. Multi-purpose: toner, setting spray, mid-day refresh.',
    1800, 'Heritage Store', 25, 5,
    'Mist lightly over clean or made-up face at any time. Use after moisturiser to lock in hydration or as a mid-day pick-me-up. Hold bottle 20cm from face.',
    'toners-mists'
  ),
  (
    'Paula''s Choice Skin Perfecting 2% BHA Liquid Exfoliant 118ml',
    'A leave-on salicylic acid exfoliant that penetrates deep into pores to clear blackheads, unclog congestion, and visibly smooth rough, bumpy skin. Fragrance-free and gentle enough for daily use. One of the most recommended exfoliating toners by dermatologists worldwide.',
    4500, 'Paula''s Choice', 20, 4,
    'Apply once or twice daily after cleansing. Soak a cotton pad and sweep over face, or apply directly with fingers. Do not rinse. Follow with moisturiser and SPF in the morning.',
    'toners-mists'
  ),

  -- ── EYE CARE ──────────────────────────────────────────────────────────────

  (
    'CeraVe Eye Repair Cream 14g',
    'A gentle, fragrance-free eye cream that visibly reduces the appearance of dark circles, puffiness, and fine lines around the delicate eye area. Contains ceramides, hyaluronic acid, and niacinamide. Formulated with MVE technology for time-released moisture.',
    3200, 'CeraVe', 20, 4,
    'Apply a small amount around the eye area morning and evening using the ring finger. Tap gently (do not rub) in a patting motion until absorbed.',
    'eye-care'
  ),
  (
    'The Ordinary Caffeine Solution 5% + EGCG 30ml',
    'A high-concentration caffeine serum backed by clinical research showing visible reduction in eye puffiness and dark circles. Contains epigallocatechin gallatyl glucoside (EGCG) from green tea for antioxidant protection. Lightweight, water-based formula.',
    1700, 'The Ordinary', 30, 5,
    'Apply a small amount around the eye contour morning and/or evening. Can also be applied to entire face for antioxidant benefits. Gently tap until absorbed.',
    'eye-care'
  ),
  (
    'Murad Retinol Youth Renewal Eye Serum 15ml',
    'A powerful retinol eye serum clinically proven to reduce the appearance of crow''s feet, fine lines, and deep wrinkles around the eye contour. Retinol tri-active technology accelerates skin renewal while retaining hydration. For anti-aging focus.',
    7500, 'Murad', 10, 3,
    'Apply PM only — a small amount around the eye area using ring finger. Tap gently until absorbed. Use SPF 50+ around eyes the next morning. Start every other night.',
    'eye-care'
  ),

  -- ── MASKS & TREATMENTS ────────────────────────────────────────────────────

  (
    'Glamglow Supermud Clearing Treatment 30g',
    'An activated charcoal and multi-acid treatment mask that draws out deep-seated impurities, unclogs pores, and resurfaces rough skin. K17 clay complex and ACNECIDIC-6 acid blend target blemishes, blackheads, and surface congestion. Results visible in one use.',
    5800, 'Glamglow', 15, 3,
    'Apply a thin, even layer to clean dry face avoiding eye area. Leave for 10-20 minutes (skin will tingle). Rinse with warm water. Use 1-2 times per week. Do not use over active breakouts.',
    'masks-treatments'
  ),
  (
    'The Ordinary AHA 30% + BHA 2% Peeling Solution 30ml',
    'A clinical-grade chemical peel at-home treatment for experienced users. AHA resurfacing complex dissolves dead skin cells on the surface while BHA penetrates pores. Dramatically improves skin clarity, brightness, and texture. Not suitable for beginners, sensitive skin, or skin with impaired barrier.',
    2000, 'The Ordinary', 25, 5,
    'Apply evenly to clean dry face using fingertips. Leave for MAXIMUM 10 minutes — do not exceed. Rinse thoroughly with lukewarm water. Use maximum once per week. Always follow with SPF. AVOID eye area, cuts, and broken skin.',
    'masks-treatments'
  ),
  (
    'Innisfree Jeju Volcanic Pore Clay Mask 100ml',
    'Powered by Jeju volcanic clusters that absorb excess sebum and unclog pores for a deep clean. Leaves skin visibly smoother, cleaner, and matte. Suitable for oily, combination, and blemish-prone skin.',
    2200, 'Innisfree', 25, 5,
    'Apply evenly to clean face avoiding the eye and lip area. Leave for 15-20 minutes. Rinse off with lukewarm water. Use 1-2 times per week.',
    'masks-treatments'
  ),
  (
    'Dr. Jart+ Cicapair Tiger Grass Calming Mask 110ml',
    'A centella asiatica-powered soothing mask that instantly calms redness, irritation, and reactive skin. Contains tiger grass extract, madecassoside, and asiaticoside to repair and strengthen the skin barrier. Ideal for post-sun, post-treatment, or sensitised skin.',
    4800, 'Dr. Jart+', 15, 4,
    'Apply generously to clean face as a wash-off mask for 20 minutes, or as a sleeping mask overnight. Rinse or leave as needed. Can be used daily on sensitive skin.',
    'masks-treatments'
  ),
  (
    'Premier Beauty Recovery Sheet Mask (Pack of 5)',
    'Clinic-exclusive bio-cellulose sheet masks formulated for post-treatment recovery. Each mask is saturated in a potent serum of ceramides, hyaluronic acid, centella asiatica, and niacinamide. Immediately calms, repairs, and intensely hydrates compromised skin. Used in-clinic after chemical peels and laser treatments.',
    3500, 'Premier Beauty', 40, 10,
    'Unfold mask and apply to clean face. Leave for 20-25 minutes. Remove mask and pat remaining essence into skin. Do not rinse. Use 2-3 times per week or as directed after treatment.',
    'masks-treatments'
  ),

  -- ── BODY CARE ─────────────────────────────────────────────────────────────

  (
    'Palmer''s Cocoa Butter Formula Body Lotion 400ml',
    'A rich, intensely moisturising body lotion powered by pure cocoa butter and vitamin E. Clinically proven to reduce stretch marks and improve skin tone over time. Absorbs quickly, leaving skin soft, smooth, and glowing. Suitable for all skin types including pregnancy.',
    1500, 'Palmer''s', 40, 10,
    'Apply liberally to body after showering or bathing while skin is still slightly damp. Massage in circular motions focusing on dry areas. Use daily for best results.',
    'body-care'
  ),
  (
    'Aveeno Daily Moisturising Lotion 532ml',
    'A fragrance-free, prebiotic oat lotion clinically proven to provide 24-hour moisture relief. Gently restores the skin''s natural moisture barrier without aggravating sensitive, dry, or eczema-prone skin. Non-comedogenic and allergy-tested.',
    2400, 'Aveeno', 30, 5,
    'Apply to face and body after bathing. Use daily, especially after showering. Gentle enough for use on children and sensitive skin.',
    'body-care'
  ),
  (
    'The Ordinary Glycolic Acid 7% Toning Solution 240ml (Body)',
    'An alpha hydroxy acid toning solution that exfoliates dead skin cells on the body, smooths keratosis pilaris (KP), brightens hyperpigmentation on elbows, knees, and inner thighs, and improves overall body skin texture. The same cult toner, used on body.',
    1900, 'The Ordinary', 25, 5,
    'Apply with a cotton pad to affected body areas (arms, thighs, back, elbows). Leave on. Do not rinse. Use in the evening. Follow with body moisturiser. Start 2-3 nights per week and build up.',
    'body-care'
  ),
  (
    'Bio-Oil Skincare Oil 125ml',
    'The world''s leading specialty skincare oil for scars, stretch marks, and uneven skin tone. PurCellin Oil™ formulation ensures easy absorption and non-greasy finish. Contains vitamins A and E, calendula, lavender, rosemary, and chamomile oils.',
    2800, 'Bio-Oil', 30, 5,
    'Massage into affected area in circular motions twice daily for minimum 3 months. For stretch marks, begin use at the onset of stretching. Do not use on broken skin.',
    'body-care'
  ),

  -- ── HAIR CARE ─────────────────────────────────────────────────────────────

  (
    'SheaMoisture Manuka Honey & Mafura Oil Intensive Hydration Masque 340g',
    'An intensive hydration masque for dry, damaged, and natural African hair. Manuka honey seals in moisture, mafura oil strengthens from root to tip, and baobab protein repairs breakage. Suitable for 3B-4C curl types. Restores elasticity, shine, and softness.',
    2800, 'SheaMoisture', 25, 5,
    'Apply generously to clean, damp hair from roots to ends. Detangle and distribute evenly. Leave for 15-30 minutes (cover with a shower cap for deeper conditioning). Rinse thoroughly with cool water. Use weekly.',
    'hair-care'
  ),
  (
    'OGX Biotin & Collagen Extra Strength Volumising Shampoo 385ml',
    'A volumising shampoo infused with biotin, collagen, and wheat protein that strengthens and thickens hair from root to tip. Adds body, fullness, and shine to fine, flat, or limp hair. Paraben-free and safe for colour-treated hair.',
    2200, 'OGX', 30, 5,
    'Apply to wet hair. Lather and massage into scalp for 1-2 minutes. Rinse thoroughly. Follow with OGX Biotin & Collagen Conditioner. Use regularly.',
    'hair-care'
  ),
  (
    'Jamaican Black Castor Oil 236ml',
    'A cold-pressed, 100% pure Jamaican black castor oil rich in ricinoleic acid for promoting hair growth, strengthening follicles, and deeply moisturising the scalp. Effective for edges, brows, lashes, and scalp treatments. Suitable for all hair types.',
    1800, 'Sunny Isle', 30, 5,
    'Massage directly into scalp 2-3 times per week. Apply to hairline and edges daily for growth support. Can be mixed with lighter carrier oils for easier application on fine hair.',
    'hair-care'
  ),

  -- ── WELLNESS ──────────────────────────────────────────────────────────────

  (
    'Vital Proteins Collagen Peptides Powder 284g (Unflavored)',
    'Hydrolysed bovine collagen peptides that support skin elasticity, hydration, joint health, and hair and nail strength from within. Bioavailable format absorbs quickly into the bloodstream. Sourced from grass-fed, pasture-raised bovine. Dissolves easily in hot or cold liquids with no taste or texture.',
    5500, 'Vital Proteins', 20, 4,
    'Mix 1-2 scoops (10-20g) daily into coffee, smoothie, juice, or water. Can be added to soups and baked goods. Best absorbed on an empty stomach or alongside vitamin C for enhanced collagen synthesis.',
    'wellness'
  ),
  (
    'Evening Primrose Oil Capsules 1000mg (90 Capsules)',
    'Cold-pressed evening primrose oil rich in gamma-linolenic acid (GLA) — an omega-6 essential fatty acid shown to improve skin hydration, reduce inflammatory conditions (eczema, hormonal acne), and support hormonal balance. Particularly beneficial for women.',
    3500, 'Nature''s Way', 25, 5,
    'Take 2-4 capsules daily with food. Best results seen after 2-3 months of consistent use. Consult a healthcare professional if pregnant, breastfeeding, or on blood-thinning medication.',
    'wellness'
  ),
  (
    'Solgar Vitamin C 1000mg with Rose Hips (100 Tablets)',
    'High-potency vitamin C with rose hips for enhanced collagen synthesis, immune support, and skin brightening. Vitamin C is essential for melanin inhibition, UV damage repair, and overall skin health. Rose hips add natural bioflavonoids for superior absorption.',
    2800, 'Solgar', 30, 5,
    'Take 1 tablet daily with food and water. Do not exceed recommended dose. Best taken in the morning alongside your vitamin C serum for maximum skin brightening synergy.',
    'wellness'
  ),
  (
    'Biotin (Vitamin B7) 10000mcg Hair, Skin & Nails Complex (60 Capsules)',
    'A high-strength biotin supplement clinically associated with improved hair thickness, nail strength, and skin clarity. Includes complementary nutrients: zinc, selenium, vitamin E, and silica for comprehensive hair-to-skin-to-nail support.',
    3200, 'Natrol', 25, 5,
    'Take 1 capsule daily with a meal. Consistency over 90+ days produces best visible results. Can be combined with collagen peptides for enhanced effect.',
    'wellness'
  ),
  (
    'Omega-3 Fish Oil 1200mg (90 Softgels)',
    'Pharmaceutical-grade omega-3 fatty acids (EPA & DHA) that reduce skin inflammation, support ceramide production for barrier function, and visibly improve dry, reactive, and eczema-prone skin from the inside out. Also supports cardiovascular and cognitive health.',
    4200, 'Nordic Naturals', 20, 4,
    'Take 2-3 softgels daily with food. Store in a cool, dry place. Enteric-coated to prevent fishy aftertaste. Consult a doctor before use if on blood-thinning medication.',
    'wellness'
  )

)
INSERT INTO public.products
  (name, slug, description, price, brand, images, stock, low_stock_threshold, is_active, usage_instructions, category_id)
SELECT
  r.name,
  LOWER(REGEXP_REPLACE(TRIM(r.name), '[^a-zA-Z0-9]+', '-', 'g')),
  r.description,
  r.price::numeric,
  r.brand,
  ARRAY[]::text[],
  r.stock::integer,
  r.threshold::integer,
  true,
  r.instructions,
  c.id
FROM _products r
JOIN public.categories c ON c.slug = r.cat_slug
ON CONFLICT (slug) DO NOTHING;


-- ─── STEP 3: Services ────────────────────────────────────────────────────────
-- All prices in KES. Deposit percentages reflect standard Nairobi clinic practice.
-- form_fields = [] means NO intake form required (simple/cosmetic services).
-- Services with skin/health implications include a structured intake form.

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes, images, category, is_active, form_fields)
VALUES

-- ── FACIALS ───────────────────────────────────────────────────────────────────

(
  'Classic Facial',
  'classic-facial',
  'A foundational facial treatment tailored to your skin type. Includes deep cleansing, steam, exfoliation, extractions (if needed), a customised mask, and SPF finish. Perfect for first-time clients or monthly maintenance.',
  3500, 30, 60,
  ARRAY[]::text[], 'Facial', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"skin_concerns","label":"Primary skin concerns (select all that apply)","type":"multiselect","options":["Acne / Breakouts","Hyperpigmentation / Dark Spots","Dryness / Dehydration","Ageing / Fine Lines","Uneven Texture","Redness / Sensitivity","Large Pores","Dullness"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"current_products","label":"Current skincare products you use daily","type":"textarea","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Deep Cleanse Facial',
  'deep-cleanse-facial',
  'An intensive pore-clearing facial for oily and congested skin. Combines enzyme exfoliation, BHA extractions, high-frequency treatment, and a purifying clay mask to decongest, refine pores, and rebalance oil production.',
  4500, 30, 75,
  ARRAY[]::text[], 'Facial', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"skin_concerns","label":"Primary skin concerns","type":"multiselect","options":["Acne / Breakouts","Blackheads / Whiteheads","Enlarged Pores","Excess Sebum / Shine","Uneven Texture","Congestion"],"required":true},
    {"name":"active_breakouts","label":"Do you currently have active breakouts or inflamed acne?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Anti-Aging Facial',
  'anti-aging-facial',
  'A results-driven facial targeting visible signs of aging. Features peptide serums, retinol micro-infusion, collagen-stimulating massage techniques, and LED red-light therapy to firm, plump, and smooth skin.',
  5500, 30, 75,
  ARRAY[]::text[], 'Facial', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"skin_concerns","label":"Primary concerns you want addressed","type":"multiselect","options":["Fine Lines","Deep Wrinkles","Sagging / Loss of Firmness","Dullness / Loss of Radiance","Uneven Texture","Age Spots"],"required":true},
    {"name":"retinol_experience","label":"Have you used retinol or retinoid products before?","type":"radio","options":["Yes — regularly","Yes — occasionally","No"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Brightening Vitamin C Facial',
  'brightening-vitamin-c-facial',
  'A targeted brightening facial using pharmaceutical-grade vitamin C, kojic acid, and azelaic acid to correct hyperpigmentation, post-acne marks, and uneven skin tone. Formulated specifically for melanin-rich African skin tones.',
  4500, 30, 60,
  ARRAY[]::text[], 'Facial', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"skin_concerns","label":"Areas of concern (select all that apply)","type":"multiselect","options":["Hyperpigmentation","Post-Acne Dark Marks (PIH)","Melasma","Sun Spots / Age Spots","Dullness","Uneven Skin Tone"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"recent_sun_exposure","label":"Have you had significant sun exposure in the last 2 weeks?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Hydrating Glow Facial',
  'hydrating-glow-facial',
  'An ultra-nourishing facial for dry, dehydrated, and dull skin. Multi-layered hyaluronic acid infusion, ceramide mask, and oxygen therapy combine to instantly plump, radiate, and restore moisture levels for a glass-skin effect.',
  4000, 30, 60,
  ARRAY[]::text[], 'Facial', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"dehydration_level","label":"How would you describe your skin''s hydration?","type":"select","options":["Mildly dry","Moderately dry and tight","Severely dry and flaky","Oily but dehydrated"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Acne Treatment Facial',
  'acne-treatment-facial',
  'A medically-informed acne control facial combining salicylic acid exfoliation, anti-bacterial extractions, blue LED light therapy, and a calming zinc mask. Targets active breakouts and prevents future congestion. Safe for all acne stages.',
  4500, 30, 60,
  ARRAY[]::text[], 'Facial', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"acne_type","label":"How would you describe your acne?","type":"select","options":["Blackheads and whiteheads only","Occasional pimples","Regular breakouts (non-inflamed)","Inflamed pustules / cysts","Hormonal breakouts (jawline / chin)"],"required":true},
    {"name":"acne_duration","label":"How long have you been experiencing acne?","type":"select","options":["Less than 6 months","6 months to 2 years","More than 2 years","On and off my whole life"],"required":true},
    {"name":"current_acne_medication","label":"Are you currently on any acne medication (topical or oral)?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"medication_details","label":"If yes, please list your current acne medications","type":"text","required":false},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

-- ── CHEMICAL PEELS ────────────────────────────────────────────────────────────

(
  'Superficial Chemical Peel',
  'superficial-chemical-peel',
  'A light-depth peel using glycolic acid (30-50%) or lactic acid to resurface the outermost skin layer. Targets dullness, mild hyperpigmentation, early fine lines, and uneven texture. Minimal downtime — mild redness and flaking for 2-3 days.',
  5000, 50, 45,
  ARRAY[]::text[], 'Chemical Peel', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"skin_concerns","label":"Primary concerns you want the peel to address","type":"multiselect","options":["Hyperpigmentation / Dark Spots","Post-Acne Marks","Dullness","Fine Lines","Rough Texture","Uneven Skin Tone"],"required":true},
    {"name":"previous_peels","label":"Have you had a chemical peel before?","type":"radio","options":["Yes — in the last 6 months","Yes — over 6 months ago","No"],"required":true},
    {"name":"current_retinoid","label":"Are you currently using retinoids or prescription retinol?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"isotretinoin","label":"Have you used isotretinoin (Roaccutane / Accutane) in the last 6 months?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"recent_sun_exposure","label":"Have you had significant sun exposure or sunburn in the last 2 weeks?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"medical_conditions","label":"Do you have any of the following skin/medical conditions?","type":"multiselect","options":["Rosacea","Eczema / Psoriasis","Herpes Simplex (cold sores)","Keloid Scarring","Active Acne Cysts","None"],"required":true},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Medium-Depth Chemical Peel',
  'medium-depth-chemical-peel',
  'A TCA (trichloroacetic acid 20-35%) medium peel for significant skin correction. Targets moderate hyperpigmentation, melasma, acne scarring, deep sun damage, and pronounced fine lines. Expect 5-7 days of peeling. Pre-treatment preparation required.',
  8000, 50, 60,
  ARRAY[]::text[], 'Chemical Peel', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"fitzpatrick_type","label":"How would you describe your skin tone? (Fitzpatrick scale)","type":"select","options":["Very fair — always burns, never tans","Fair — usually burns, sometimes tans","Medium — sometimes burns, always tans","Olive / Brown — rarely burns, always tans","Dark Brown","Very Dark / Black"],"required":true},
    {"name":"skin_concerns","label":"Concerns you want the peel to address","type":"multiselect","options":["Melasma","Severe Hyperpigmentation","Acne Scarring","Deep Sun Damage","Pronounced Fine Lines / Wrinkles","Uneven Skin Tone"],"required":true},
    {"name":"previous_peels","label":"Have you had a chemical peel before?","type":"select","options":["Yes — superficial peel in the last 6 months","Yes — medium or deep peel","Yes — superficial only, over 6 months ago","No"],"required":true},
    {"name":"current_retinoid","label":"Are you currently using retinoids or prescription retinol?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"isotretinoin","label":"Have you used isotretinoin (Roaccutane / Accutane) in the last 6 months?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"on_medication","label":"Are you currently taking any prescription medication?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"medication_details","label":"If yes, list your medications (especially blood thinners, antibiotics, steroids)","type":"text","required":false},
    {"name":"medical_conditions","label":"Do you have any of the following?","type":"multiselect","options":["Diabetes","Rosacea","Eczema / Psoriasis","Lupus","Herpes Simplex (cold sores)","Keloid Scarring","Heart Condition","None"],"required":true},
    {"name":"recent_sun_exposure","label":"Have you had significant sun exposure or sunburn in the last 2 weeks?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"last_treatment_date","label":"Date of your last professional skin treatment (if any)","type":"date","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"consent","label":"I understand this treatment requires 5-7 days of recovery time and I have read and agree to the pre-treatment preparation guidelines","type":"radio","options":["Yes, I confirm"],"required":true}
  ]'
),

-- ── ADVANCED TREATMENTS ───────────────────────────────────────────────────────

(
  'Microdermabrasion',
  'microdermabrasion',
  'A non-invasive mechanical exfoliation treatment using diamond-tip crystals to remove the outer layer of dead skin cells. Visibly smooths fine lines, reduces hyperpigmentation, refines pore size, and improves product absorption. Zero downtime.',
  5500, 30, 60,
  ARRAY[]::text[], 'Advanced Treatment', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"skin_concerns","label":"Primary concerns (select all that apply)","type":"multiselect","options":["Fine Lines / Wrinkles","Hyperpigmentation","Rough Texture / Dullness","Enlarged Pores","Acne Scarring","Sun Damage"],"required":true},
    {"name":"active_acne","label":"Do you currently have active or inflamed acne?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"recent_sun_exposure","label":"Have you had significant sun exposure in the last 2 weeks?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'LED Light Therapy',
  'led-light-therapy',
  'A non-invasive light treatment using clinically proven wavelengths to target specific skin concerns. Blue light (415nm) kills acne-causing bacteria. Red light (630nm) stimulates collagen and reduces inflammation. Near-infrared (830nm) promotes deep healing. Painless and zero downtime.',
  3000, 0, 30,
  ARRAY[]::text[], 'Advanced Treatment', true,
  '[
    {"name":"led_goal","label":"What would you like LED therapy to help with?","type":"select","options":["Acne / Breakouts (Blue Light)","Anti-Aging / Collagen (Red Light)","Post-Treatment Recovery (Near-Infrared)","Redness / Inflammation","General Skin Health"],"required":true},
    {"name":"photosensitive_conditions","label":"Do you have any photosensitive conditions or take photosensitising medication?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"epilepsy","label":"Do you have a history of epilepsy or light-triggered seizures?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Dermaplaning',
  'dermaplaning',
  'A precision exfoliation treatment using a sterile surgical blade to remove the surface layer of dead skin cells and vellus hair (peach fuzz). Results in an immediately smoother, brighter complexion and enhanced product absorption. Popular as a pre-event treatment. Not suitable for active acne.',
  4500, 30, 45,
  ARRAY[]::text[], 'Advanced Treatment', true,
  '[
    {"name":"skin_type","label":"What is your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},
    {"name":"active_acne","label":"Do you currently have active breakouts or inflamed acne?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"rosacea","label":"Do you have rosacea or highly reactive skin?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

-- ── BODY TREATMENTS ───────────────────────────────────────────────────────────

(
  'Back Treatment',
  'back-treatment',
  'A targeted back facial that addresses bacne, ingrown hairs, rough texture, and hyperpigmentation on the back and shoulders. Includes deep cleanse, exfoliation, steam, extractions, and a customised treatment mask.',
  5000, 30, 60,
  ARRAY[]::text[], 'Body Treatment', true,
  '[
    {"name":"back_concerns","label":"Primary concerns for your back","type":"multiselect","options":["Bacne / Pimples","Blackheads","Hyperpigmentation / Dark Spots","Ingrown Hairs","Rough / Bumpy Texture","Oiliness"],"required":true},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Full Body Wrap',
  'full-body-wrap',
  'A luxurious therapeutic body wrap that detoxifies, hydrates, and smooths the skin from head to toe. Choose from: Brightening (vitamin C + kojic), Slimming (clay + caffeine), or Hydrating (shea butter + aloe). Includes body exfoliation and hot towel finish.',
  7000, 30, 90,
  ARRAY[]::text[], 'Body Treatment', true,
  '[
    {"name":"wrap_type","label":"Which body wrap would you prefer?","type":"select","options":["Brightening — Vitamin C + Kojic (for hyperpigmentation)","Slimming — Clay + Caffeine (for cellulite and tone)","Hydrating — Shea Butter + Aloe (for dryness)"],"required":true},
    {"name":"body_concerns","label":"Main body skin concerns (select all that apply)","type":"multiselect","options":["Hyperpigmentation / Dark Patches","Cellulite","Stretch Marks","Dry / Rough Skin","Uneven Tone","None"],"required":false},
    {"name":"known_allergies","label":"Any known allergies or ingredient sensitivities?","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Body Scrub & Polish',
  'body-scrub-polish',
  'An invigorating full-body exfoliation treatment using a custom blend of sugar or salt scrub with essential oils. Removes dead skin cells, smooths rough patches, improves skin tone, and leaves skin silky and glowing. Includes moisturising finish.',
  5500, 0, 60,
  ARRAY[]::text[], 'Body Treatment', true,
  '[]'
),

-- ── WAXING & HAIR REMOVAL ─────────────────────────────────────────────────────

(
  'Full Body Wax',
  'full-body-wax',
  'A comprehensive full-body waxing service covering legs, underarms, bikini, arms, and back. Premium warm wax for sensitive areas, strip wax for larger areas. Long-lasting smoothness for 3-6 weeks.',
  5000, 0, 90,
  ARRAY[]::text[], 'Waxing', true,
  '[]'
),

(
  'Bikini Wax (Brazilian)',
  'bikini-wax-brazilian',
  'A thorough Brazilian bikini wax using premium, low-temperature hard wax for a gentle, precise finish. Suitable for all skin types including sensitive skin.',
  2000, 0, 30,
  ARRAY[]::text[], 'Waxing', true,
  '[]'
),

(
  'Eyebrow Shaping & Tinting',
  'eyebrow-shaping-tinting',
  'Professional eyebrow shaping using wax and thread to sculpt the perfect arch for your face shape, combined with brow tinting to define, darken, and add fullness. Results last 4-6 weeks.',
  1500, 0, 30,
  ARRAY[]::text[], 'Waxing', true,
  '[]'
),

(
  'Lash Tinting',
  'lash-tinting',
  'Semi-permanent lash tint that darkens and defines natural lashes for up to 6 weeks — no mascara needed. Available in black, brown-black, and dark brown. Patch test required 24 hours before first appointment.',
  1200, 0, 20,
  ARRAY[]::text[], 'Waxing', true,
  '[]'
),

-- ── NAIL CARE ─────────────────────────────────────────────────────────────────

(
  'Classic Manicure',
  'classic-manicure',
  'A traditional manicure including nail shaping, cuticle care, hand soak, hand scrub, moisturising massage, and your choice of nail polish. Includes base coat, colour, and top coat.',
  2000, 0, 45,
  ARRAY[]::text[], 'Nail Care', true,
  '[]'
),

(
  'Gel Manicure',
  'gel-manicure',
  'A long-lasting gel polish manicure that stays chip-free for up to 3 weeks. Includes nail shaping, cuticle care, hand massage, and UV-cured gel colour. Available in 60+ shades.',
  3000, 0, 60,
  ARRAY[]::text[], 'Nail Care', true,
  '[]'
),

(
  'Classic Pedicure',
  'classic-pedicure',
  'A relaxing pedicure including foot soak, callus removal, nail shaping, cuticle care, lower leg massage, and nail polish application. Leaves feet soft, smooth, and pampered.',
  2500, 0, 60,
  ARRAY[]::text[], 'Nail Care', true,
  '[]'
),

(
  'Spa Pedicure',
  'spa-pedicure',
  'An elevated pedicure experience adding an exfoliating foot scrub, hydrating mask, and extended massage to the Classic Pedicure. Includes gel polish option. A full lower-leg and foot wellness ritual.',
  3500, 0, 75,
  ARRAY[]::text[], 'Nail Care', true,
  '[]'
),

-- ── MASSAGE & WELLNESS ────────────────────────────────────────────────────────

(
  'Relaxation Swedish Massage',
  'relaxation-swedish-massage',
  'A full-body Swedish massage designed to relieve muscle tension, reduce stress, and promote deep relaxation. Light to medium pressure using long, flowing strokes with aromatherapy oils. Choose your scent: lavender, eucalyptus, or citrus.',
  5500, 0, 60,
  ARRAY[]::text[], 'Massage & Wellness', true,
  '[]'
),

(
  'Hot Stone Massage',
  'hot-stone-massage',
  'A therapeutic massage using smooth, heated basalt stones placed on key energy points combined with deep tissue massage. Melts away deep muscle tension, improves circulation, and induces profound relaxation.',
  6500, 0, 75,
  ARRAY[]::text[], 'Massage & Wellness', true,
  '[]'
),

(
  'Deep Tissue Massage',
  'deep-tissue-massage',
  'A clinical massage targeting deep muscle layers and connective tissue to relieve chronic tension, sports injuries, and postural pain. Firm pressure with focused, slow strokes. Ideal for desk workers, athletes, and those with chronic back or neck pain.',
  6000, 0, 60,
  ARRAY[]::text[], 'Massage & Wellness', true,
  '[]'
),

-- ── CONSULTATIONS ─────────────────────────────────────────────────────────────

(
  'Skin Analysis & Consultation',
  'skin-analysis-consultation',
  'A 30-minute in-clinic skin analysis using advanced technology to assess hydration levels, sebum production, pigmentation, pore size, and skin age. Your practitioner will build a personalised skincare and treatment plan. Includes product recommendations and take-home guide.',
  1500, 100, 30,
  ARRAY[]::text[], 'Consultation', true,
  '[
    {"name":"skin_type","label":"How would you currently describe your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive","Not sure"],"required":true},
    {"name":"skin_concerns","label":"Your primary skin concerns (select all that apply)","type":"multiselect","options":["Acne / Breakouts","Hyperpigmentation / Dark Spots","Ageing / Fine Lines","Dryness / Dehydration","Oiliness / Shine","Redness / Sensitivity","Uneven Texture","Dullness","Melasma","Scarring"],"required":true},
    {"name":"current_routine","label":"Describe your current daily skincare routine","type":"textarea","required":false},
    {"name":"products_tried","label":"Products you have already tried (and how they worked)","type":"textarea","required":false},
    {"name":"diet_lifestyle","label":"Brief description of your diet, sleep, and stress levels (affects skin significantly)","type":"textarea","required":false},
    {"name":"medical_skin_conditions","label":"Do you have any diagnosed skin conditions?","type":"multiselect","options":["Rosacea","Eczema","Psoriasis","Melasma","Perioral Dermatitis","Seborrhoeic Dermatitis","None"],"required":false},
    {"name":"on_medication","label":"Are you on any medication that affects the skin?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"medication_details","label":"If yes, please specify","type":"text","required":false},
    {"name":"consultation_goal","label":"What is your primary goal from this consultation?","type":"select","options":["Build a complete skincare routine","Treat a specific skin concern","Prepare for an upcoming treatment","Product recommendations only","General skin health assessment"],"required":true},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
),

(
  'Virtual Skin Consultation',
  'virtual-skin-consultation',
  'A 30-minute online skin consultation via video call with one of our expert practitioners. Submit skin photos in advance for detailed pre-analysis. Ideal for clients outside Nairobi or those with busy schedules. Includes a personalised written skincare and treatment plan.',
  1000, 100, 30,
  ARRAY[]::text[], 'Consultation', true,
  '[
    {"name":"skin_type","label":"How would you describe your skin type?","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive","Not sure"],"required":true},
    {"name":"skin_concerns","label":"Primary skin concerns (select all that apply)","type":"multiselect","options":["Acne / Breakouts","Hyperpigmentation / Dark Spots","Ageing / Fine Lines","Dryness / Dehydration","Oiliness / Shine","Redness / Sensitivity","Uneven Texture","Dullness","Melasma","Scarring"],"required":true},
    {"name":"skin_description","label":"Describe your skin right now in your own words","type":"textarea","required":true},
    {"name":"current_routine","label":"Your current morning and evening skincare routine","type":"textarea","required":false},
    {"name":"products_tried","label":"Products you have tried previously (and your experience with them)","type":"textarea","required":false},
    {"name":"diet_lifestyle","label":"Diet, hydration, sleep, and stress levels","type":"textarea","required":false},
    {"name":"consultation_goal","label":"What is your primary goal from this consultation?","type":"select","options":["Build a skincare routine","Treat a specific concern","Pre-treatment advice","Product recommendations","General skin health check"],"required":true},
    {"name":"on_medication","label":"Are you currently on any medication?","type":"radio","options":["Yes","No"],"required":true},
    {"name":"medication_details","label":"If yes, please specify","type":"text","required":false},
    {"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}
  ]'
)
ON CONFLICT (slug) DO NOTHING;


-- ─── STEP 4: Product Images ──────────────────────────────────────────────────
-- Curated Unsplash placeholder images. Replace via the admin dashboard once
-- the client provides official product photography.

-- CLEANSERS
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'CeraVe Hydrating Cleanser 236ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1631730486784-74757d38e27c?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'La Roche-Posay Effaclar Purifying Foaming Gel 200ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Squalane Cleanser 50ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Cetaphil Gentle Skin Cleanser 500ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1571781565036-d3f759be73e4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Neutrogena Oil-Free Acne Wash 175ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1631730486784-74757d38e27c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Bioderma Sensibio H2O Micellar Water 500ml';

-- MOISTURISERS
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1570194065650-d99fb4e89d9a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'CeraVe Moisturising Cream 177g';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570194065650-d99fb4e89d9a?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'La Roche-Posay Toleriane Double Repair Face Moisturiser 75ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Neutrogena Hydro Boost Water Gel 50ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1570194065650-d99fb4e89d9a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Natural Moisturising Factors + HA 100ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Premier Beauty Barrier Repair Cream 50ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Cetaphil Moisturising Lotion 250ml';

-- SERUMS
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Niacinamide 10% + Zinc 1% 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Hyaluronic Acid 2% + B5 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Retinol 0.5% in Squalane 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'SkinCeuticals C E Ferulic Serum 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Premier Beauty Brightening Vitamin C Serum 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Garnier Vitamin C Brightening Serum 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Obagi Professional-C Serum 20% 30ml';

-- SUNSCREEN
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'La Roche-Posay Anthelios SPF 50+ Ultra-Light 50ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Neutrogena Ultra Sheer Dry-Touch SPF 50 88ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Mineral UV Filters SPF 30 50ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Skin Aqua UV Moisture Milk SPF 50+ PA++++ 40ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1631730486784-74757d38e27c?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Black Girl Sunscreen SPF 30 88ml';

-- TONERS & MISTS
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1624454002429-3e5b42e35177?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Some By Mi AHA BHA PHA 30 Days Miracle Toner 150ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1624454002429-3e5b42e35177?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Thayers Alcohol-Free Rose Petal Witch Hazel Toner 355ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1624454002429-3e5b42e35177?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Heritage Store Rose Water & Glycerin Facial Mist 237ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Paula''s Choice Skin Perfecting 2% BHA Liquid Exfoliant 118ml';

-- EYE CARE
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570194065650-d99fb4e89d9a?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'CeraVe Eye Repair Cream 14g';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Caffeine Solution 5% + EGCG 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Murad Retinol Youth Renewal Eye Serum 15ml';

-- MASKS & TREATMENTS
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Glamglow Supermud Clearing Treatment 30g';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary AHA 30% + BHA 2% Peeling Solution 30ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1573461160327-f9c30d3e7d4e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Innisfree Jeju Volcanic Pore Clay Mask 100ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1573461160327-f9c30d3e7d4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Dr. Jart+ Cicapair Tiger Grass Calming Mask 110ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1573461160327-f9c30d3e7d4e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Premier Beauty Recovery Sheet Mask (Pack of 5)';

-- BODY CARE
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Palmer''s Cocoa Butter Formula Body Lotion 400ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Aveeno Daily Moisturising Lotion 532ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'The Ordinary Glycolic Acid 7% Toning Solution 240ml (Body)';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570194065650-d99fb4e89d9a?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Bio-Oil Skincare Oil 125ml';

-- HAIR CARE
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'SheaMoisture Manuka Honey & Mafura Oil Intensive Hydration Masque 340g';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'OGX Biotin & Collagen Extra Strength Volumising Shampoo 385ml';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Jamaican Black Castor Oil 236ml';

-- WELLNESS
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Vital Proteins Collagen Peptides Powder 284g (Unflavored)';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Evening Primrose Oil Capsules 1000mg (90 Capsules)';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1559181567-c3190100191e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Solgar Vitamin C 1000mg with Rose Hips (100 Tablets)';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559181567-c3190100191e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Biotin (Vitamin B7) 10000mcg Hair, Skin & Nails Complex (60 Capsules)';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559181567-c3190100191e?auto=format&fit=crop&w=800&q=80'
] WHERE name = 'Omega-3 Fish Oil 1200mg (90 Softgels)';


-- ─── STEP 5: Service Images ───────────────────────────────────────────────────

-- FACIALS
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'classic-facial';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'deep-cleanse-facial';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'anti-aging-facial';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'brightening-vitamin-c-facial';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'hydrating-glow-facial';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'acne-treatment-facial';

-- CHEMICAL PEELS
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'superficial-chemical-peel';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'medium-depth-chemical-peel';

-- ADVANCED TREATMENTS
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'microdermabrasion';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1573461160327-f9c30d3e7d4e?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'led-light-therapy';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'dermaplaning';

-- BODY TREATMENTS
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'back-treatment';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'full-body-wrap';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'body-scrub-polish';

-- WAXING & HAIR REMOVAL
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4b4a36?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'full-body-wax';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1594938298603-c8148c4b4a36?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'bikini-wax-brazilian';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'eyebrow-shaping-tinting';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'lash-tinting';

-- NAIL CARE
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'classic-manicure';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'gel-manicure';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'classic-pedicure';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'spa-pedicure';

-- MASSAGE & WELLNESS
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'relaxation-swedish-massage';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'hot-stone-massage';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'deep-tissue-massage';

-- CONSULTATIONS
UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1573461160327-f9c30d3e7d4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'skin-analysis-consultation';

UPDATE public.services SET images = ARRAY[
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1573461160327-f9c30d3e7d4e?auto=format&fit=crop&w=800&q=80'
] WHERE slug = 'virtual-skin-consultation';


-- ─── STEP 6: Verify ──────────────────────────────────────────────────────────

SELECT 'Categories' AS table_name, COUNT(*) AS rows FROM public.categories
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Services', COUNT(*) FROM public.services;
