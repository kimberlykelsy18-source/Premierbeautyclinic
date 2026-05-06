-- ============================================================
-- Premier Beauty Clinic — New Products (from Google Sheet)
-- 123 products across Neostrata, Bioderma, La Roche-Posay, etc.
-- Run in Supabase SQL Editor
-- ============================================================

WITH new_products(name, slug, description, price, brand, usage_instructions, skin_concerns, main_ingredients, cat_slug) AS (
  VALUES
  ('Mandelic Clarifying cleanser', 'mandelic-clarifying-cleanser', 'The NeoStrata Mandelic Clarifying Cleanser is a gentle yet effective exfoliating cleanser designed for oily, combination, and acne-prone skin. Formulated with a powerful blend of exfoliating acids, it helps to unclog pores, reduce breakouts, and improve overall skin texture without stripping the skin. The result is a clearer, smoother, and more balanced complexion.

Key Ingredients: Formulated with exfoliating acids to clarify and refine the skin. Mandelic Acid (AHA) and Salicylic Acid (BHA) help unclog pores and reduce breakouts, while Gluconolactone (PHA) gently exfoliates. Hydrating ingredients like glycerin help maintain moisture for balanced, clearer-looking skin.

Best for: Acne & breakouts, clogged pores, excess oil, uneven skin texture, dullness, and post-acne marks.', 6400, 'Neostrata', 'Apply to damp skin and gently massage for at least a minute into a lather. Rinse thoroughly with water. Use once or twice daily as part of your skincare routine. Follow with a moisturizer and sunscreen during the day.', 'Acne & breakouts, clogged pores, excess oil, uneven skin texture, dullness, and post-acne marks.', 'Formulated with exfoliating acids to clarify and refine the skin. Mandelic Acid (AHA) and Salicylic Acid (BHA) help unclog pores and reduce breakouts, while Gluconolactone (PHA) gently exfoliates. Hydrating ingredients like glycerin help maintain moisture for balanced, clearer-looking skin.', 'cleansers'),
  ('Repair Exfoliating Wash (Mousse Exfoliante Nettoyante)', 'repair-exfoliating-wash-mousse-exfoliante-nettoyante', 'A gentle yet effective foaming cleanser formulated with Alpha Hydroxy Acids (AHAs) to exfoliate dead skin cells, unclog pores, and improve skin texture. Ideal for normal to oily and acne-prone skin, it helps reveal a smoother, clearer, and more radiant complexion without over-drying

Key Ingredients: Formulated with Polyhydroxy Acids (Gluconolactone & Maltobionic Acid) to gently exfoliate and refine skin texture, combined with soothing botanical extracts like aloe, chamomile, cucumber, and rosemary to calm and refresh. Hydrating ingredients such as glycerin help maintain moisture for soft, balanced skin

Best for: Suitable for normal, oily, and acne-prone skin. Ideal for improving uneven texture, dullness, and congestion', 6400, 'Neostrata', 'Apply to damp skin and gently massage for at least a minute to create a light lather. Rinse thoroughly with water. Use once or twice daily as tolerated. Follow with a moisturizer and daily sunscreen', 'Suitable for normal, oily, and acne-prone skin. Ideal for improving uneven texture, dullness, and congestion', 'Formulated with Polyhydroxy Acids (Gluconolactone & Maltobionic Acid) to gently exfoliate and refine skin texture, combined with soothing botanical extracts like aloe, chamomile, cucumber, and rosemary to calm and refresh. Hydrating ingredients such as glycerin help maintain moisture for soft, balanced skin', 'cleansers'),
  ('Post-Acne Mark Correcting Serum', 'post-acne-mark-correcting-serum', 'A targeted serum that helps visibly fade post-acne marks and even out skin tone. Formulated with a powerful blend of brightening and exfoliating ingredients, it works to reduce discoloration, smooth texture, and reveal a clearer, more radiant complexion. Its lightweight, fast-absorbing formula layers seamlessly into your daily routine for brighter, more even-looking skin over time

Key Ingredients: Formulated with a powerful brightening blend to target post-acne marks. Tranexamic Acid, Niacinamide, and Vitamin C help visibly fade discoloration and even skin tone, while NeoGlucosamine gently exfoliates to improve clarity. Soothing extracts like licorice root and willowherb help calm and balance the skin

Best for: Suitable for oily and acne-prone skin. Ideal for targeting post-acne marks, discoloration, and uneven tone', 10500, 'Neostrata', 'Apply to clean, dry skin twice daily. Follow with a moisturizer and daily sunscreen. Can be used under makeup.', 'Suitable for oily and acne-prone skin. Ideal for targeting post-acne marks, discoloration, and uneven tone', 'Formulated with a powerful brightening blend to target post-acne marks. Tranexamic Acid, Niacinamide, and Vitamin C help visibly fade discoloration and even skin tone, while NeoGlucosamine gently exfoliates to improve clarity. Soothing extracts like licorice root and willowherb help calm and balance the skin', 'masks-treatments'),
  ('Targeted Clalrifying Gel(Gel Anti-Obstruction)', 'targeted-clalrifying-gel-gel-anti-obstruction', 'The  NeostrataTargeted Clalrifying Gel is a fast-acting, targeted treatment designed to help clear breakouts and prevent clogged pores. Formulated with exfoliating and clarifying ingredients, it works to reduce blemishes, control excess oil, and promote a clearer, smoother complexion

Key Ingredients: Formulated with clarifying acids to help reduce breakouts and refine pores. Salicylic Acid (BHA) helps unclog pores and target blemishes, while Mandelic Acid (AHA) gently exfoliates to improve skin texture. Soothing and balancing ingredients help calm the skin while controlling excess oil for a clearer complexion

Best for: Suitable for oily and acne-prone skin. Ideal for targeting breakouts, clogged pores, and excess oil.', 6400, 'Neostrata', 'Apply a small amount directly to affected areas on clean, dry skin. Use once or twice daily as needed. Follow with a moisturizer and daily sunscreen', 'Suitable for oily and acne-prone skin. Ideal for targeting breakouts, clogged pores, and excess oil.', 'Formulated with clarifying acids to help reduce breakouts and refine pores. Salicylic Acid (BHA) helps unclog pores and target blemishes, while Mandelic Acid (AHA) gently exfoliates to improve skin texture. Soothing and balancing ingredients help calm the skin while controlling excess oil for a clearer complexion', 'masks-treatments'),
  ('Bionic Face Serum', 'bionic-face-serum', 'NeoStrata Bionic Face Serum is a hydrating and anti-aging serum designed to strengthen the skin barrier while improving texture and radiance. Formulated with Polyhydroxy Acids (PHAs), it gently exfoliates while delivering intense moisture, helping to smooth fine lines and enhance overall skin clarity. Ideal for sensitive and dry skin, this lightweight serum leaves the complexion softer, calmer, and more resilient.

Key Ingredients: Formulated with Polyhydroxy Acids (PHAs), including Gluconolactone and Lactobionic Acid, to gently exfoliate while providing antioxidant benefits. Hydrating ingredients help restore moisture, improve skin texture, and strengthen the skin barrier for a smoother, more radiant complexion.

Best for: Suitable for dry, sensitive, and aging skin. Ideal for those looking to improve dehydration, fine lines, and skin resilience.', 13600, 'Neostrata', 'Apply to clean, dry skin once or twice daily. Gently smooth over the face and neck. Follow with a moisturizer and daily sunscreen', 'Suitable for dry, sensitive, and aging skin. Ideal for those looking to improve dehydration, fine lines, and skin resilience.', 'Formulated with Polyhydroxy Acids (PHAs), including Gluconolactone and Lactobionic Acid, to gently exfoliate while providing antioxidant benefits. Hydrating ingredients help restore moisture, improve skin texture, and strengthen the skin barrier for a smoother, more radiant complexion.', 'masks-treatments'),
  ('Potent Retinol Complex', 'potent-retinol-complex', 'Potent Retinol Complex is an advanced anti-aging treatment designed to visibly reduce fine lines, wrinkles, and uneven skin tone. Formulated with potent retinol and exfoliating ingredients, it helps accelerate skin renewal, refine texture, and reveal a smoother, more radiant complexion. Its lightweight formula works overnight to improve clarity and restore a youthful-looking appearance

Key Ingredients: Formulated with Retinol to visibly reduce fine lines and improve skin texture, combined with NeoGlucosamine to enhance exfoliation and promote a more even skin tone. Hydrating and soothing ingredients help support the skin barrier and improve overall radiance

Best for: Suitable for normal, dry, oily and aging skin. Ideal for improving fine lines, wrinkles, uneven tone, and texture.', 18000, 'Neostrata', 'Apply a small amount to clean, dry skin in the evening. Start 2–3 times a week, then increase frequency as tolerated. Follow with a moisturizer. Use daily sunscreen, as retinol increases sun sensitivity.', 'Suitable for normal, dry, oily and aging skin. Ideal for improving fine lines, wrinkles, uneven tone, and texture.', 'Formulated with Retinol to visibly reduce fine lines and improve skin texture, combined with NeoGlucosamine to enhance exfoliation and promote a more even skin tone. Hydrating and soothing ingredients help support the skin barrier and improve overall radiance', 'masks-treatments'),
  ('Rebound Sculpting Cream', 'rebound-sculpting-cream', 'Rebound Sculpting Cream is an advanced anti-aging moisturizer designed to lift, firm, and restore skin''s youthful appearance. Powered by breakthrough peptide technology and exfoliating acids, it helps improve skin elasticity, smooth wrinkles, and enhance radiance for a more sculpted, revitalized complexion

Key Ingredients: Formulated with advanced anti-aging ingredients to firm and renew the skin. MicroDiPeptide-229 helps improve the look of collagen and elasticity, while a 10% AHA/PHA blend (Glycolic Acid & Gluconolactone) exfoliates and smooths texture. Aminofil helps visibly plump fine lines, and botanical extracts enhance brightness and skin tone

Best for: Suitable for normal, dry, and combination skin. Ideal for aging, dull, and loss of firmness', 17300, 'Neostrata', 'Apply to clean skin once or twice daily. Gently smooth over the face and neck. Use daily sunscreen, as this product contains exfoliating acids', 'Suitable for normal, dry, and combination skin. Ideal for aging, dull, and loss of firmness', 'Formulated with advanced anti-aging ingredients to firm and renew the skin. MicroDiPeptide-229 helps improve the look of collagen and elasticity, while a 10% AHA/PHA blend (Glycolic Acid & Gluconolactone) exfoliates and smooths texture. Aminofil helps visibly plump fine lines, and botanical extracts enhance brightness and skin tone', 'masks-treatments'),
  ('Triple Firming Neck Cream', 'triple-firming-neck-cream', 'An advanced anti-aging treatment specially formulated for the delicate neck and décolletage. Powered by a triple-action complex, it helps firm sagging skin, improve uneven tone, and reduce the appearance of lines and wrinkles for a smoother, more lifted, and youthful-looking neckline.

Key Ingredients: Formulated with a triple-action complex to firm and restore the skin. NeoGlucosamine gently exfoliates and helps even skin tone, while NeoCitriate supports collagen production for improved firmness. Pro-Amino Acid helps enhance skin volume and elasticity for a smoother, more lifted appearance

Best for: Suitable for normal, dry, and oily skin. Ideal for aging, sagging skin, and uneven tone on the neck and décolletage', 18500, 'Neostrata', 'Apply to clean skin twice daily. Gently smooth over the neck and décolletage using upward motions. Follow with a moisturizer and daily sunscreen', 'Suitable for normal, dry, and oily skin. Ideal for aging, sagging skin, and uneven tone on the neck and décolletage', 'Formulated with a triple-action complex to firm and restore the skin. NeoGlucosamine gently exfoliates and helps even skin tone, while NeoCitriate supports collagen production for improved firmness. Pro-Amino Acid helps enhance skin volume and elasticity for a smoother, more lifted appearance', 'masks-treatments'),
  ('Illuminating Serum', 'illuminating-serum', 'A powerful brightening serum designed to reduce dark spots and uneven skin tone. Formulated with a blend of advanced brightening ingredients, it helps fade discoloration, smooth skin texture, and reveal a more radiant, luminous complexion.

Key Ingredients: Formulated with a potent brightening complex to target discoloration. NeoGlucosamine gently exfoliates and helps fade dark spots, while Niacinamide (Vitamin B3) and B-Resorcinol improve skin tone clarity. Licorice Root Extract provides antioxidant benefits and enhances radiance for a more even, luminous complexion.

Best for: Suitable for all skin types. Ideal for Mild pigmentation & overall brightening', 13600, 'Neostrata', 'Apply 1–2 pumps to clean, dry skin twice daily. Smooth over the face and neck. Follow with a moisturizer and daily sunscreen.', 'Suitable for all skin types. Ideal for Mild pigmentation & overall brightening', 'Formulated with a potent brightening complex to target discoloration. NeoGlucosamine gently exfoliates and helps fade dark spots, while Niacinamide (Vitamin B3) and B-Resorcinol improve skin tone clarity. Licorice Root Extract provides antioxidant benefits and enhances radiance for a more even, luminous complexion.', 'masks-treatments'),
  ('Enlighten 15%Vitamin C+PHA serum', 'enlighten-15-vitamin-c-pha-serum', 'A high-potency brightening serum formulated with 15% pure Vitamin C to visibly reduce dark spots, even skin tone, and enhance radiance. Combined with gentle exfoliating PHAs and antioxidants, it helps smooth texture and reveal a brighter, more youthful-looking complexion.

Key Ingredients: Formulated with 15% Vitamin C (L-Ascorbic Acid) to brighten and even skin tone, combined with Gluconolactone (PHA) to gently exfoliate and enhance absorption. Antioxidants like Green Tea Extract and Feverfew help protect against environmental stress and improve overall skin radiance.

Best for: Suitable for all skin types. Ideal for dull skin, dark spots, uneven tone, and early signs of aging.', 14500, 'Neostrata', 'Apply to clean, dry skin once daily (morning). Smooth over the face and neck. Follow with a moisturizer and  sunscreen.', 'Suitable for all skin types. Ideal for dull skin, dark spots, uneven tone, and early signs of aging.', 'Formulated with 15% Vitamin C (L-Ascorbic Acid) to brighten and even skin tone, combined with Gluconolactone (PHA) to gently exfoliate and enhance absorption. Antioxidants like Green Tea Extract and Feverfew help protect against environmental stress and improve overall skin radiance.', 'masks-treatments'),
  ('Enlighten Pigment Controller serum', 'enlighten-pigment-controller-serum', 'Enlighten Pigment Controller serum is an intensive brightening treatment designed to target dark spots and uneven skin tone at multiple levels. Formulated with a powerful blend of exfoliating and antioxidant ingredients, it helps reduce discoloration, improve skin clarity, and reveal a smoother, more radiant complexion.

Key Ingredients: Formulated with a multi-action brightening complex. NeoGlucosamine helps fade discoloration and improve skin tone, while Retinol (0.1%) promotes cell turnover and smooths texture. Stabilized Vitamin C enhances radiance, and antioxidants like turmeric extract help target dark spots and protect against environmental damage.

Best for: Suitable for all skin types (normal, dry, and oily). Ideal for Stubborn pigmentation i.e. Melasma & deeper dark spots', 13000, 'Neostrata', 'Apply to clean, dry skin once daily for the first two weeks, then increase to twice daily as tolerated. Follow with a moisturizer and daily sunscreen.', 'Suitable for all skin types (normal, dry, and oily). Ideal for Stubborn pigmentation i.e. Melasma & deeper dark spots', 'Formulated with a multi-action brightening complex. NeoGlucosamine helps fade discoloration and improve skin tone, while Retinol (0.1%) promotes cell turnover and smooths texture. Stabilized Vitamin C enhances radiance, and antioxidants like turmeric extract help target dark spots and protect against environmental damage.', 'masks-treatments'),
  ('Enlighten Pigment Lightening Gel', 'enlighten-pigment-lightening-gel', 'Enlighten Pigment Lightening Gel is a  high-strength targeted treatment designed to visibly reduce dark spots and uneven skin tone. Formulated with a powerful blend of brightening and exfoliating ingredients, it helps fade pigmentation, smooth skin texture, and promote a clearer, more radiant complexion.

Key Ingredients: Formulated with a potent brightening complex. Kojic Acid, Vitamin C, and Butylresorcinol help reduce discoloration, while a 10% AHA/PHA blend exfoliates and improves skin tone. Licorice Extract enhances radiance for a clearer, more even complexion

Best for: Suitable for all skin types. Ideal for dark spots, hyperpigmentation i.e. Melasma, and post-acne marks.', 9100, 'Neostrata', 'Apply a small amount directly to affected areas twice daily. Limit sun exposure and use daily sunscreen to prevent recurrence of pigmentation', 'Suitable for all skin types. Ideal for dark spots, hyperpigmentation i.e. Melasma, and post-acne marks.', 'Formulated with a potent brightening complex. Kojic Acid, Vitamin C, and Butylresorcinol help reduce discoloration, while a 10% AHA/PHA blend exfoliates and improves skin tone. Licorice Extract enhances radiance for a clearer, more even complexion', 'masks-treatments'),
  ('Enlighten Dark spot Corrector', 'enlighten-dark-spot-corrector', 'A targeted spot treatment designed to visibly reduce dark spots and uneven skin tone. Formulated with a potent blend of exfoliating acids and brightening ingredients, it helps fade discoloration, improve skin clarity, and reveal a more even, radiant complexion

Key Ingredients: Formulated with a 10% AHA/PHA blend (Glycolic Acid, Citric Acid, Gluconolactone, Lactobionic Acid) to exfoliate and renew the skin. Kojic Acid, Vitamin C, and Licorice Extract help brighten and reduce discoloration for a more even skin tone

Best for: Suitable for all skin types. Ideal for dark spots, hyperpigmentation i.e. Melasma, and post-acne marks.', 5500, 'Neostrata', 'Apply directly to affected areas twice daily. Do not apply to the entire face. Use daily sunscreen and limit sun exposure during use.', 'Suitable for all skin types. Ideal for dark spots, hyperpigmentation i.e. Melasma, and post-acne marks.', 'Formulated with a 10% AHA/PHA blend (Glycolic Acid, Citric Acid, Gluconolactone, Lactobionic Acid) to exfoliate and renew the skin. Kojic Acid, Vitamin C, and Licorice Extract help brighten and reduce discoloration for a more even skin tone', 'masks-treatments'),
  ('Enlighten Ultra Brightening Cleanser', 'enlighten-ultra-brightening-cleanser', 'Enlighten Ultra Brightening Cleanser is a gentle exfoliating cleanser designed to brighten dull skin and improve uneven tone. Formulated with NeoGlucosamine, it helps remove impurities while promoting a clearer, smoother, and more radiant complexion.

Key Ingredients: Formulated with NeoGlucosamine (6%) to gently exfoliate and target uneven pigmentation, helping to brighten and smooth the skin. A blend of cleansing agents removes dirt, oil, and makeup, while botanical extracts help refresh and revitalize the complexion.

Best for: Suitable for all skin types (normal, dry, and oily). Ideal for dull skin, uneven tone, and dark spots.', 6300, 'Neostrata', 'Apply to wet skin and gently massage for at least 1 minute to create a light lather. Rinse thoroughly with water. Use twice daily for best results.', 'Suitable for all skin types (normal, dry, and oily). Ideal for dull skin, uneven tone, and dark spots.', 'Formulated with NeoGlucosamine (6%) to gently exfoliate and target uneven pigmentation, helping to brighten and smooth the skin. A blend of cleansing agents removes dirt, oil, and makeup, while botanical extracts help refresh and revitalize the complexion.', 'cleansers'),
  ('Smooth Surface Glycolic Peel', 'smooth-surface-glycolic-peel', 'An advanced at-home chemical peel designed to exfoliate, refine skin texture, and improve overall tone. Formulated with 10% Glycolic Acid, it helps smooth fine lines, unclog pores, and reveal a brighter, more even complexion for visibly renewed skin.

Key Ingredients: Formulated with 10% Glycolic Acid (AHA) to exfoliate and accelerate skin renewal, helping to refine texture and improve tone. Aminofil® helps restore skin volume and reduce the appearance of fine lines for smoother, more youthful-looking skin.

Best for: Suitable for normal , dry skin. Ideal for dullness, uneven texture, enlarged pores, and early signs of aging', 15000, 'Neostrata', 'Pour the solution into the jar of pads before first use. Wipe one pad over cleansed face thrice a week (evening), avoiding the eye and lip area. Do not rinse. Follow with a moisturizer and daily sunscreen.', 'Suitable for normal , dry skin. Ideal for dullness, uneven texture, enlarged pores, and early signs of aging', 'Formulated with 10% Glycolic Acid (AHA) to exfoliate and accelerate skin renewal, helping to refine texture and improve tone. Aminofil® helps restore skin volume and reduce the appearance of fine lines for smoother, more youthful-looking skin.', 'masks-treatments'),
  ('10% Glycolic Renewal Smoothing Lotion', '10-glycolic-renewal-smoothing-lotion', 'A lightweight exfoliating lotion designed to smooth, renew, and improve skin texture. Formulated with a potent 10% AHA blend, it helps refine pores, reduce fine lines, and enhance overall radiance for visibly smoother, more even-looking skin.

Key Ingredients: Formulated with a 10% AHA blend (Glycolic Acid & Citric Acid) to exfoliate, smooth texture, and improve skin clarity. Hydrating ingredients like glycerin and conditioning agents help maintain moisture while supporting skin renewal.

Best for: Suitable for normal and oily skin. Ideal for rough texture, dullness, enlarged pores, and early signs of aging', 10000, 'Neostrata', 'Apply to clean dry skin on the face, hands, or body. Use once or twice daily as tolerated. Follow with a moisturizer and daily sunscreen.', 'Suitable for normal and oily skin. Ideal for rough texture, dullness, enlarged pores, and early signs of aging', 'Formulated with a 10% AHA blend (Glycolic Acid & Citric Acid) to exfoliate, smooth texture, and improve skin clarity. Hydrating ingredients like glycerin and conditioning agents help maintain moisture while supporting skin renewal.', 'masks-treatments'),
  ('15% Glycolic Lotion Plus', '15-glycolic-lotion-plus', 'A lightweight exfoliating lotion designed to smooth, renew, and improve skin texture. Formulated with a potent 15% AHA blend, it helps refine pores, reduce fine lines, and enhance overall radiance for visibly smoother, more even-looking skin.

Key Ingredients: Formulated with a 15% AHA blend (Glycolic Acid & Citric Acid) to exfoliate, smooth texture, and improve skin clarity. Hydrating ingredients like glycerin and conditioning agents help maintain moisture while supporting skin renewal.

Best for: Suitable for normal and oily skin. Ideal for rough texture, dullness, enlarged pores, and early signs of aging', 11000, 'Neostrata', 'Apply to clean dry skin on the face, hands, or body. Use once or twice daily as tolerated. Follow with a moisturizer and daily sunscreen.', 'Suitable for normal and oily skin. Ideal for rough texture, dullness, enlarged pores, and early signs of aging', 'Formulated with a 15% AHA blend (Glycolic Acid & Citric Acid) to exfoliate, smooth texture, and improve skin clarity. Hydrating ingredients like glycerin and conditioning agents help maintain moisture while supporting skin renewal.', 'masks-treatments'),
  ('Restore  Hyaluronic Acid  Biocellulose Mask', 'restore-hyaluronic-acid-biocellulose-mask', 'An intensive hydrating sheet mask designed to instantly replenish moisture and soothe dehydrated skin. Infused with hyaluronic acid and a cooling biocellulose material, it helps restore hydration, calm the skin, and leave the complexion feeling refreshed, smooth, and revitalized.

Key Ingredients: Formulated with Hyaluronic Acid to deeply hydrate and plump the skin, combined with soothing and conditioning ingredients to help calm irritation and restore the skin barrier. The biocellulose mask material enhances absorption for optimal hydration and comfort.

Best for: Suitable for all skin types, especially dry, sensitive, and dehydrated skin. Ideal for post-treatment care and skin recovery', 2000, 'Neostrata', 'Apply the mask to clean skin and leave on for 10–15 minutes. Remove and gently massage any remaining serum into the skin. Use as needed or after treatments.', 'Suitable for all skin types, especially dry, sensitive, and dehydrated skin. Ideal for post-treatment care and skin recovery', 'Formulated with Hyaluronic Acid to deeply hydrate and plump the skin, combined with soothing and conditioning ingredients to help calm irritation and restore the skin barrier. The biocellulose mask material enhances absorption for optimal hydration and comfort.', 'masks-treatments'),
  ('Mela Anti-dark spot gentle peeling Night Cream', 'mela-anti-dark-spot-gentle-peeling-night-cream', 'A renewing night treatment designed to gently exfoliate and reduce dark spots while you sleep. Formulated with a combination of brightening and exfoliating ingredients, it helps improve skin tone, smooth texture, and reveal a more even, radiant complexion by morning.

Key Ingredients: Formulated with Glycolic Acid (AHA) to gently exfoliate and renew the skin, combined with Niacinamide and a Vitamin C derivative to help reduce dark spots and even skin tone. Hydrating ingredients like glycerin help maintain moisture and support a smooth, radiant complexion.

Best for: Suitable for all skin types, including sensitive skin. Ideal for dark spots, uneven tone, and dull skin.', 6500, 'Topicrem', 'Apply to clean, dry skin in the evening. Gently smooth over the face, avoiding the eye area. Use daily and apply sunscreen during the day.', 'Suitable for all skin types, including sensitive skin. Ideal for dark spots, uneven tone, and dull skin.', 'Formulated with Glycolic Acid (AHA) to gently exfoliate and renew the skin, combined with Niacinamide and a Vitamin C derivative to help reduce dark spots and even skin tone. Hydrating ingredients like glycerin help maintain moisture and support a smooth, radiant complexion.', 'masks-treatments'),
  ('Hydra+ Moisturizing Radiance Serum', 'hydra-moisturizing-radiance-serum', 'A lightweight hydrating serum designed to boost moisture and restore natural radiance. Enriched with hydrating and brightening ingredients, it helps plump the skin, smooth texture, and reveal a fresh, glowing complexion.

Key Ingredients: Formulated with Hyaluronic Acid to deeply hydrate and plump the skin, combined with Glycerin to maintain moisture balance. Brightening agents help enhance radiance, while soothing ingredients support a soft, smooth, and refreshed complexion

Best for: Suitable for all skin types, especially dehydrated and dull skin. Ideal for restoring radiance, hydration, and skin comfort.', 5800, 'Topicrem', 'Apply to clean, dry skin morning and/or evening. Gently smooth over the face and neck. Follow with a moisturizer and daily sunscreen.', 'Suitable for all skin types, especially dehydrated and dull skin. Ideal for restoring radiance, hydration, and skin comfort.', 'Formulated with Hyaluronic Acid to deeply hydrate and plump the skin, combined with Glycerin to maintain moisture balance. Brightening agents help enhance radiance, while soothing ingredients support a soft, smooth, and refreshed complexion', 'masks-treatments'),
  ('Cica+ soothing Cream', 'cica-soothing-cream', 'A calming and repairing cream designed to soothe irritated and weakened skin. Enriched with barrier-repairing and hydrating ingredients, it helps reduce discomfort, restore the skin barrier, and promote faster recovery for soft, protected skin.

Key Ingredients: Formulated with Centella Asiatica (Cica) to soothe and support skin repair, combined with Panthenol (Vitamin B5) to calm irritation and strengthen the skin barrier. Glycerin helps maintain hydration, while protective ingredients support faster recovery and long-lasting comfort.

Best for: Suitable for all skin types, especially sensitive, irritated, or damaged skin. Ideal for redness, dryness, and post-treatment care.', 4200, 'Topicrem', 'Apply to clean, dry skin twice daily. Use on the face or body as needed. Can be applied to targeted areas requiring soothing and repair.', 'Suitable for all skin types, especially sensitive, irritated, or damaged skin. Ideal for redness, dryness, and post-treatment care.', 'Formulated with Centella Asiatica (Cica) to soothe and support skin repair, combined with Panthenol (Vitamin B5) to calm irritation and strengthen the skin barrier. Glycerin helps maintain hydration, while protective ingredients support faster recovery and long-lasting comfort.', 'masks-treatments'),
  ('Hydra+Protective Day Cream (SPF50)', 'hydra-protective-day-cream-spf50', 'A hydrating daily moisturizer with high sun protection, designed to shield the skin from UV damage while maintaining optimal moisture levels. It helps prevent dehydration and dullness, leaving the skin soft, protected, and radiant throughout the day

Key Ingredients: Formulated with broad-spectrum UV filters (SPF50) to protect against UVA and UVB rays, combined with Hyaluronic Acid and Glycerin to hydrate and maintain moisture. Antioxidant ingredients help protect the skin from environmental stress and support a healthy, radiant complexion.

Best for: Suitable for all skin types, especially dehydrated and sensitive skin. Ideal for daily hydration and sun protection.', 5000, 'Topicrem', 'Apply evenly to the face and neck every morning as the last step of your skincare routine. Reapply during the day as needed, especially after sun exposure.', 'Suitable for all skin types, especially dehydrated and sensitive skin. Ideal for daily hydration and sun protection.', 'Formulated with broad-spectrum UV filters (SPF50) to protect against UVA and UVB rays, combined with Hyaluronic Acid and Glycerin to hydrate and maintain moisture. Antioxidant ingredients help protect the skin from environmental stress and support a healthy, radiant complexion.', 'masks-treatments'),
  ('Anti-age Global Serum', 'anti-age-global-serum', 'A multi-corrective anti-aging serum designed to target visible signs of aging, including fine lines, loss of firmness, and dullness. Formulated with a blend of revitalizing and hydrating ingredients, it helps smooth skin texture, improve elasticity, and restore a more youthful, radiant appearance.

Key Ingredients: Formulated with anti-aging peptides to help improve firmness and elasticity, combined with Hyaluronic Acid to hydrate and plump the skin. Antioxidants help protect against environmental stress, while smoothing ingredients improve overall skin texture and radiance

Best for: Suitable for all skin types, especially mature and aging skin. Ideal for fine lines, wrinkles, loss of firmness, and dullness', 12000, 'Topicrem', 'Apply to clean, dry skin morning and/or evening. Gently smooth over the face and neck. Follow with a moisturizer and daily sunscreen.', 'Suitable for all skin types, especially mature and aging skin. Ideal for fine lines, wrinkles, loss of firmness, and dullness', 'Formulated with anti-aging peptides to help improve firmness and elasticity, combined with Hyaluronic Acid to hydrate and plump the skin. Antioxidants help protect against environmental stress, while smoothing ingredients improve overall skin texture and radiance', 'masks-treatments'),
  ('AC Control Purifying Mask', 'ac-control-purifying-mask', 'A deep-cleansing mask designed to purify oily and acne-prone skin. It helps absorb excess oil, unclog pores, and reduce impurities, leaving the skin clearer, smoother, and more balanced.

Key Ingredients: Formulated with purifying and sebum-regulating ingredients to help absorb excess oil and reduce shine. Zinc helps control oil and minimize blemishes, while absorbent clays help draw out impurities and unclog pores for clearer-looking skin.

Best for: Suitable for oily and acne-prone skin. Ideal for excess oil, clogged pores, and breakouts.', 4000, 'Topicrem', 'Apply a thin layer to clean, dry skin. Leave on for 10–15 minutes, then rinse thoroughly. Use 1–2 times per week', 'Suitable for oily and acne-prone skin. Ideal for excess oil, clogged pores, and breakouts.', 'Formulated with purifying and sebum-regulating ingredients to help absorb excess oil and reduce shine. Zinc helps control oil and minimize blemishes, while absorbent clays help draw out impurities and unclog pores for clearer-looking skin.', 'masks-treatments'),
  ('HYdra+Gentle Cleansing Milk', 'hydra-gentle-cleansing-milk', 'A gentle, creamy cleanser that effectively removes makeup and impurities while maintaining the skin''s natural moisture balance. Its soothing formula leaves the skin soft, clean, and comfortably hydrated without tightness.

Key Ingredients: Formulated with Glycerin to help maintain hydration and prevent dryness, combined with gentle cleansing agents to remove makeup and impurities. Soothing ingredients help calm the skin, leaving it soft, refreshed, and comfortable.

Best for: Suitable for all skin types, especially dry and sensitive skin. Ideal for gentle daily cleansing and makeup removal.', 3500, 'Topicrem', 'Apply to the face using a cotton pad or fingertips. Gently massage and wipe away impurities. No rinsing required, or rinse if preferred. Use morning and evening.', 'Suitable for all skin types, especially dry and sensitive skin. Ideal for gentle daily cleansing and makeup removal.', 'Formulated with Glycerin to help maintain hydration and prevent dryness, combined with gentle cleansing agents to remove makeup and impurities. Soothing ingredients help calm the skin, leaving it soft, refreshed, and comfortable.', 'cleansers'),
  ('DA Protect Emmolient Balm', 'da-protect-emmolient-balm', 'A rich, soothing balm designed to nourish and protect very dry and sensitive skin. It helps restore the skin barrier, reduce dryness and itching, and provide long-lasting comfort for soft, supple, and protected skin.

Key Ingredients: Formulated with emollients and nourishing oils to restore and protect the skin barrier, combined with Glycerin to maintain hydration. Soothing ingredients help reduce discomfort, itching, and dryness for long-lasting relief.

Best for: Suitable for very dry, sensitive, and atopic-prone skin. Ideal for dryness, irritation, and weakened skin barrier.', 0, 'Topicrem', 'Apply to clean, dry skin once or twice daily. Use on the face and body as needed. Suitable for daily use by the whole family.', 'Suitable for very dry, sensitive, and atopic-prone skin. Ideal for dryness, irritation, and weakened skin barrier.', 'Formulated with emollients and nourishing oils to restore and protect the skin barrier, combined with Glycerin to maintain hydration. Soothing ingredients help reduce discomfort, itching, and dryness for long-lasting relief.', 'body-care'),
  ('Ultra Hydrant Moisturizing Milk', 'ultra-hydrant-moisturizing-milk', 'A lightweight, fast-absorbing body lotion that delivers long-lasting hydration for dry and sensitive skin. It helps restore comfort, improve softness, and protect the skin barrier, leaving the skin smooth, supple, and nourished throughout the day

Key Ingredients: Formulated with Glycerin to deeply hydrate and maintain moisture, combined with nourishing emollients to soften and smooth the skin. Protective ingredients help reinforce the skin barrier and prevent dryness for long-lasting comfort.

Best for: Suitable for all skin types, especially dry and sensitive skin. Ideal for daily hydration and maintaining soft, comfortable skin', 0, 'Topicrem', 'Apply to clean, dry skin once or twice daily. Massage gently until fully absorbed. Suitable for use on the body and face.', 'Suitable for all skin types, especially dry and sensitive skin. Ideal for daily hydration and maintaining soft, comfortable skin', 'Formulated with Glycerin to deeply hydrate and maintain moisture, combined with nourishing emollients to soften and smooth the skin. Protective ingredients help reinforce the skin barrier and prevent dryness for long-lasting comfort.', 'body-care'),
  ('Mela Unifying Ultra-Moisturizing Milk', 'mela-unifying-ultra-moisturizing-milk', 'A nourishing body lotion designed to hydrate while helping to improve uneven skin tone. Formulated with brightening and moisturizing ingredients, it helps reduce the appearance of dark spots, leaving the skin softer, smoother, and more radiant.

Key Ingredients: Formulated with Niacinamide  and other brighytening ingredients to help reduce dark spots and even out skin tone, combined with Glycerin to deeply hydrate and maintain moisture. Nourishing emollients help soften the skin and improve overall smoothness for a more radiant, uniform complexion.

Best for: Suitable for all skin types, especially dry and uneven skin tone. Ideal for dark spots, dullness, and body hydration.', 10200, 'Topicrem', 'Apply to clean, dry skin once daily( morning). Massage gently into the body until fully absorbed. Use consistently for best results.', 'Suitable for all skin types, especially dry and uneven skin tone. Ideal for dark spots, dullness, and body hydration.', 'Formulated with Niacinamide  and other brighytening ingredients to help reduce dark spots and even out skin tone, combined with Glycerin to deeply hydrate and maintain moisture. Nourishing emollients help soften the skin and improve overall smoothness for a more radiant, uniform complexion.', 'body-care'),
  ('Dermo Specific UR-10', 'dermo-specific-ur-10', 'A smoothing body treatment designed to exfoliate and hydrate rough, dry skin. It helps reduce flakiness, improve texture, and restore softness, leaving the skin smoother, more comfortable, and visibly renewed.

Key Ingredients: Formulated with 10% Urea to gently exfoliate and smooth rough skin while providing deep hydration. Glycerin helps maintain moisture balance, and emollients support the skin barrier, leaving the skin softer and more comfortable.

Best for: Suitable for dry, rough, and flaky skin. Ideal for keratosis pilaris, rough patches, and uneven texture.', 5000, 'Topicrem', 'Apply to clean, dry skin once or twice daily. Massage gently into affected areas until fully absorbed. Use consistently for best results.', 'Suitable for dry, rough, and flaky skin. Ideal for keratosis pilaris, rough patches, and uneven texture.', 'Formulated with 10% Urea to gently exfoliate and smooth rough skin while providing deep hydration. Glycerin helps maintain moisture balance, and emollients support the skin barrier, leaving the skin softer and more comfortable.', 'masks-treatments'),
  ('Dermo Specific UR-30', 'dermo-specific-ur-30', 'An intensive smoothing treatment formulated for very rough, thickened, and scaly skin. It helps exfoliate, soften, and deeply hydrate, improving skin texture and restoring comfort for visibly smoother, healthier-looking skin.

Key Ingredients: Formulated with 30% Urea to intensively exfoliate and soften thickened skin while providing deep hydration. Glycerin helps maintain moisture, and emollients support the skin barrier, leaving the skin smoother and more comfortable.

Best for: Suitable for very dry, rough, and thickened skin. Ideal for severe dryness, keratosis pilaris, calluses, and rough patches.', 4500, 'Topicrem', 'Apply to clean, dry skin once or twice daily. Focus on rough or thickened areas (elbows, knees, feet, arms). Use consistently for best results.', 'Suitable for very dry, rough, and thickened skin. Ideal for severe dryness, keratosis pilaris, calluses, and rough patches.', 'Formulated with 30% Urea to intensively exfoliate and soften thickened skin while providing deep hydration. Glycerin helps maintain moisture, and emollients support the skin barrier, leaving the skin smoother and more comfortable.', 'masks-treatments'),
  ('Cica+ Concetrated oil', 'cica-concetrated-oil', 'A nourishing multi-purpose oil designed to repair, soothe, and protect dry and fragile skin. It helps improve skin elasticity, reduce the appearance of marks, and restore comfort, leaving the skin soft, smooth, and visibly healthier.

Key Ingredients: Formulated with plant-based nourishing oils to restore and protect the skin barrier, combined with Centella Asiatica (Cica) to support skin repair and improve elasticity. Vitamin E provides antioxidant protection, while emollients help soften and smooth the skin.

Best for: Suitable for all skin types, especially dry, sensitive, and damaged skin. Ideal for stretch marks, dryness, and skin repair.', 4500, 'Topicrem', 'Apply to clean, dry skin once or twice daily. Massage gently into the face or body until fully absorbed. Can be used on targeted areas or all over the body.', 'Suitable for all skin types, especially dry, sensitive, and damaged skin. Ideal for stretch marks, dryness, and skin repair.', 'Formulated with plant-based nourishing oils to restore and protect the skin barrier, combined with Centella Asiatica (Cica) to support skin repair and improve elasticity. Vitamin E provides antioxidant protection, while emollients help soften and smooth the skin.', 'body-care'),
  ('Baby Ultra-Hydrating  Moisturizing Milk', 'baby-ultra-hydrating-moisturizing-milk', 'A gentle, nourishing moisturizer specially formulated for babies'' delicate skin. It provides long-lasting hydration, helps protect the skin barrier, and leaves the skin soft, smooth, and comfortable.

Key Ingredients: Formulated with Glycerin to deeply hydrate and maintain moisture balance, combined with mild emollients to nourish and protect the skin barrier. Gentle, skin-friendly ingredients help keep baby''s skin soft, smooth, and comfortable.

Best for: Suitable for babies and children, including sensitive and delicate skin. Ideal for daily hydration and skin protection.', 5500, 'Topicrem', 'Apply to clean, dry skin once or twice daily. Massage gently into the skin until fully absorbed. Suitable for use on the face and body.', 'Suitable for babies and children, including sensitive and delicate skin. Ideal for daily hydration and skin protection.', 'Formulated with Glycerin to deeply hydrate and maintain moisture balance, combined with mild emollients to nourish and protect the skin barrier. Gentle, skin-friendly ingredients help keep baby''s skin soft, smooth, and comfortable.', 'moisturisers'),
  ('Mela Unifying Exfoliating Bar', 'mela-unifying-exfoliating-bar', 'A gentle exfoliating cleansing bar designed to cleanse, smooth, and improve uneven skin tone. It helps remove impurities and dead skin cells while promoting a brighter, more even, and radiant complexion.

Key Ingredients: Formulated with exfoliating acids (AHAs) to help remove dead skin cells and improve skin texture, combined with Niacinamide to even out skin tone and reduce discoloration. Cleansing agents effectively remove impurities while maintaining skin comfort.

Best for: Suitable for all skin types, especially dull and uneven skin tone. Ideal for dark spots, rough texture, and body exfoliation', 1900, 'Topicrem', 'Apply to wet skin and work into a lather. Gently massage onto the face or body, then rinse thoroughly. Use once daily or as tolerated.', 'Suitable for all skin types, especially dull and uneven skin tone. Ideal for dark spots, rough texture, and body exfoliation', 'Formulated with exfoliating acids (AHAs) to help remove dead skin cells and improve skin texture, combined with Niacinamide to even out skin tone and reduce discoloration. Cleansing agents effectively remove impurities while maintaining skin comfort.', 'cleansers'),
  ('Ultra Hydrant Shower oil', 'ultra-hydrant-shower-oil', 'A gentle cleansing oil that cleanses while nourishing and protecting the skin. It helps prevent dryness, soothes discomfort, and leaves the skin soft, smooth, and comfortably hydrated after every shower.

Key Ingredients: Formulated with Glycerin to help maintain hydration and prevent dryness, combined with nourishing oils to protect and soften the skin. Gentle cleansing agents cleanse without disrupting the skin barrier, leaving the skin smooth and comfortable.

Best for: Suitable for all skin types, especially dry, sensitive, and irritated skin. Ideal for daily cleansing without stripping moisture', 5000, 'Topicrem', 'Apply to wet skin in the shower. Massage gently to create a light lather, then rinse thoroughly. Use daily on the face and body.', 'Suitable for all skin types, especially dry, sensitive, and irritated skin. Ideal for daily cleansing without stripping moisture', 'Formulated with Glycerin to help maintain hydration and prevent dryness, combined with nourishing oils to protect and soften the skin. Gentle cleansing agents cleanse without disrupting the skin barrier, leaving the skin smooth and comfortable.', 'cleansers'),
  ('Ultra-Hydratant Shower Gel', 'ultra-hydratant-shower-gel', 'A gentle, soap-free cleansing gel designed to cleanse and hydrate the skin without causing dryness. It removes impurities while maintaining the skin''s natural moisture balance, leaving it soft, fresh, and comfortable

Key Ingredients: Formulated with Glycerin to help maintain hydration and prevent dryness, combined with mild cleansing agents to gently remove impurities. Skin-conditioning ingredients help keep the skin soft, smooth, and balanced after cleansing.

Best for: Suitable for all skin types, especially sensitive and dry skin. Ideal for daily gentle cleansing.', 5000, 'Topicrem', 'Apply to wet skin, lather gently, then rinse thoroughly. Use daily on the face and body.', 'Suitable for all skin types, especially sensitive and dry skin. Ideal for daily gentle cleansing.', 'Formulated with Glycerin to help maintain hydration and prevent dryness, combined with mild cleansing agents to gently remove impurities. Skin-conditioning ingredients help keep the skin soft, smooth, and balanced after cleansing.', 'body-care'),
  ('Atoderm Huile de douche', 'atoderm-huile-de-douche', 'A nourishing cleansing oil that gently cleanses while protecting and restoring dry, sensitive skin. It helps replenish lipids, soothe discomfort, and leave the skin soft, smooth, and hydrated after every shower.

Key Ingredients: Formulated with plant-derived emollients to nourish and protect the skin barrier, combined with Glycerin to maintain hydration. The Skin Barrier Therapy™ complex helps prevent dryness and protect against external irritants, leaving the skin soft and comfortable.

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for irritation, tightness, and daily gentle cleansing.', 0, 'Bioderma', 'Apply to wet skin in the shower or bath. Massage gently, then rinse thoroughly. Use daily on the face and body.', 'Suitable for dry, very dry, and sensitive skin. Ideal for irritation, tightness, and daily gentle cleansing.', 'Formulated with plant-derived emollients to nourish and protect the skin barrier, combined with Glycerin to maintain hydration. The Skin Barrier Therapy™ complex helps prevent dryness and protect against external irritants, leaving the skin soft and comfortable.', 'cleansers'),
  ('Sensibio Gel Moussant', 'sensibio-gel-moussant', 'A gentle foaming cleanser designed to cleanse and soothe sensitive skin. It effectively removes impurities and makeup while preserving the skin''s natural balance, leaving it fresh, soft, and comfortable.

Key Ingredients: Formulated with Coco Glucoside & Glyceryl Oleate to gently cleanse while maintaining the skin barrier, combined with D.A.F™ complex to help improve skin tolerance and reduce sensitivity. Glycerin helps maintain hydration, leaving the skin soft and comfortable.

Best for: Suitable for sensitive, normal, and combination skin. Ideal for daily gentle cleansing without irritation.', 0, 'Bioderma', 'Apply to wet skin and gently massage for at least a minute to create a light foam. Rinse thoroughly with water. Use morning and evening.', 'Suitable for sensitive, normal, and combination skin. Ideal for daily gentle cleansing without irritation.', 'Formulated with Coco Glucoside & Glyceryl Oleate to gently cleanse while maintaining the skin barrier, combined with D.A.F™ complex to help improve skin tolerance and reduce sensitivity. Glycerin helps maintain hydration, leaving the skin soft and comfortable.', 'cleansers'),
  ('Sébium Gel Moussant', 's-bium-gel-moussant', 'A purifying foaming cleanser designed for oily and acne-prone skin. It gently removes excess oil and impurities while helping to prevent clogged pores, leaving the skin clean, fresh, and balanced.

Key Ingredients: Formulated with Zinc Sulfate and Copper Sulfate to purify the skin and help regulate excess oil. The Fluidactiv™ complex helps normalize sebum quality and prevent clogged pores. Lactic Acid (AHA) provides gentle exfoliation to help refine skin texture and keep pores clear, while mild cleansing agents remove impurities without over-drying.

Best for: Suitable for oily, combination  and acne-prone skin. Ideal for excess oil, shine, and breakouts.', 3500, 'Bioderma', 'Apply to wet skin and gently massage for at  to create a light foam. Rinse thoroughly with water. Use morning and evening.', 'Suitable for oily, combination  and acne-prone skin. Ideal for excess oil, shine, and breakouts.', 'Formulated with Zinc Sulfate and Copper Sulfate to purify the skin and help regulate excess oil. The Fluidactiv™ complex helps normalize sebum quality and prevent clogged pores. Lactic Acid (AHA) provides gentle exfoliation to help refine skin texture and keep pores clear, while mild cleansing agents remove impurities without over-drying.', 'cleansers'),
  ('Sébium Gel Moussant Actif', 's-bium-gel-moussant-actif', 'An intensive purifying cleanser designed for oily and acne-prone skin. Enriched with exfoliating acids, it helps unclog pores, reduce blemishes, and control excess oil while leaving the skin clean, smoother, and visibly clearer.

Key Ingredients: Formulated with Salicylic Acid (BHA) and Glycolic Acid (AHA) to exfoliate, unclog pores, and reduce blemishes. Zinc helps regulate excess oil and purify the skin, while gentle cleansing agents remove impurities without over-drying

Best for: Suitable for oily and acne-prone skin. Ideal for breakouts, clogged pores, and excess sebum.', 3500, 'Bioderma', 'Apply to wet skin and gently massage to create a light foam. Rinse thoroughly with water. Use once or twice daily as tolerated. Follow with a moisturizer and daily sunscreen.', 'Suitable for oily and acne-prone skin. Ideal for breakouts, clogged pores, and excess sebum.', 'Formulated with Salicylic Acid (BHA) and Glycolic Acid (AHA) to exfoliate, unclog pores, and reduce blemishes. Zinc helps regulate excess oil and purify the skin, while gentle cleansing agents remove impurities without over-drying', 'cleansers'),
  ('Sebium Hydra Cleanser', 'sebium-hydra-cleanser', 'A gentle, hydrating cleansing balm designed for acne-prone skin weakened by drying treatments. It cleanses without stripping, while soothing, restoring moisture, and improving skin comfort.

Key Ingredients: Formulated with Glycerin to deeply hydrate and restore moisture, combined with Shea Oil (Biomimetic Lipids) to nourish and reinforce the skin barrier. The D.A.F™ complex helps increase skin tolerance and reduce sensitivity, while gentle surfactants cleanse without irritating the skin.

Best for: Suitable for oily and acne-prone skin that is dehydrated or sensitized. Ideal for skin under acne treatments (retinoids, isotretinoin, etc.)', 3500, 'Bioderma', 'Apply to wet skin morning and/or evening. Massage gently, then rinse thoroughly. Follow with your treatment or moisturizer.', 'Suitable for oily and acne-prone skin that is dehydrated or sensitized. Ideal for skin under acne treatments (retinoids, isotretinoin, etc.)', 'Formulated with Glycerin to deeply hydrate and restore moisture, combined with Shea Oil (Biomimetic Lipids) to nourish and reinforce the skin barrier. The D.A.F™ complex helps increase skin tolerance and reduce sensitivity, while gentle surfactants cleanse without irritating the skin.', 'cleansers'),
  ('Pigmentbio Foaming cleanser', 'pigmentbio-foaming-cleanser', 'A brightening exfoliating cleanser designed to cleanse, smooth, and reduce dark spots. It combines gentle exfoliation with depigmenting actives to promote a more even, radiant complexion while maintaining skin comfort.

Key Ingredients: Formulated with a patented combination of Lysine Azelate & Andrographolide to help reduce hyperpigmentation and prevent dark spots. AHAs (Citric Acid) and micro-exfoliating beads gently exfoliate to smooth texture and enhance radiance. Coco Glucoside & Glyceryl Oleate help maintain hydration and strengthen the skin barrier.

Best for: Suitable for all skin types, including sensitive skin. Ideal for dark spots, uneven tone, and dull skin.', 0, 'Bioderma', 'Apply to wet skin and lather gently, then rinse thoroughly. Use once or twice daily. Can also be used as a mask 1–2 times weekly (leave on for 5 minutes, then rinse).', 'Suitable for all skin types, including sensitive skin. Ideal for dark spots, uneven tone, and dull skin.', 'Formulated with a patented combination of Lysine Azelate & Andrographolide to help reduce hyperpigmentation and prevent dark spots. AHAs (Citric Acid) and micro-exfoliating beads gently exfoliate to smooth texture and enhance radiance. Coco Glucoside & Glyceryl Oleate help maintain hydration and strengthen the skin barrier.', 'cleansers'),
  ('Atoderm Intensive Pain Bar', 'atoderm-intensive-pain-bar', 'An ultra-soothing cleansing bar designed for very dry, irritated, and atopic-prone skin. It gently cleanses while nourishing and protecting the skin barrier, helping to reduce dryness, itching, and discomfort.

Key Ingredients: Formulated with Glycerin to deeply hydrate and retain moisture, combined with Shea Butter (Shea Oil) to nourish and restore the skin barrier. Niacinamide helps strengthen the skin and reduce irritation, while Zinc helps purify and limit bacterial growth. The Skin Barrier Therapy™ complex helps protect against external aggressors and reduce dryness.

Best for: Suitable for very dry, sensitive, and atopic-prone skin. Ideal for irritation, itching, and weakened skin barrier.', 1900, 'Bioderma', 'Apply to wet skin and lather gently. Rinse thoroughly and pat dry. Use once or twice daily on the face and body.', 'Suitable for very dry, sensitive, and atopic-prone skin. Ideal for irritation, itching, and weakened skin barrier.', 'Formulated with Glycerin to deeply hydrate and retain moisture, combined with Shea Butter (Shea Oil) to nourish and restore the skin barrier. Niacinamide helps strengthen the skin and reduce irritation, while Zinc helps purify and limit bacterial growth. The Skin Barrier Therapy™ complex helps protect against external aggressors and reduce dryness.', 'masks-treatments'),
  ('Atoderm Shower Gel', 'atoderm-shower-gel', 'A gentle, soap-free cleansing gel designed to cleanse and protect normal to dry skin. It helps maintain the skin''s natural balance while soothing dryness and leaving the skin soft, comfortable, and hydrated after every shower.

Key Ingredients: Formulated with Glycerin to hydrate and maintain moisture, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and soothe irritation. The Skin Protect Complex™ helps boost hydration and provide long-lasting protection, while Coco Glucoside & Glyceryl Oleate gently cleanse without disrupting the skin balance.

Best for: Suitable for normal to dry and sensitive skin. Ideal for daily cleansing without dryness or tightness.', 0, 'Bioderma', 'Apply to wet skin and work into a light foam. Rinse thoroughly and gently dry. Use once or twice daily on the face and body.', 'Suitable for normal to dry and sensitive skin. Ideal for daily cleansing without dryness or tightness.', 'Formulated with Glycerin to hydrate and maintain moisture, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and soothe irritation. The Skin Protect Complex™ helps boost hydration and provide long-lasting protection, while Coco Glucoside & Glyceryl Oleate gently cleanse without disrupting the skin balance.', 'cleansers'),
  ('Sensibio Defensive', 'sensibio-defensive', 'A soothing daily moisturizer designed to strengthen the skin''s natural defenses and reduce sensitivity. It helps calm irritation, protect against environmental aggressors, and provide long-lasting hydration for healthier, more resilient skin.

Key Ingredients: Formulated with Carnosine + Vitamin E to provide antioxidant protection against environmental stress, combined with Red Sage Polyphenols to soothe and reduce skin reactivity. Tetrapeptide-10 helps strengthen the skin barrier, improving resilience and long-term comfort.

Best for: Suitable for sensitive and sensitized skin. Ideal for redness, irritation, and reactive skin.', 3800, 'Bioderma', 'Apply to clean skin morning and/or evening. Gently massage over the face and neck until absorbed.', 'Suitable for sensitive and sensitized skin. Ideal for redness, irritation, and reactive skin.', 'Formulated with Carnosine + Vitamin E to provide antioxidant protection against environmental stress, combined with Red Sage Polyphenols to soothe and reduce skin reactivity. Tetrapeptide-10 helps strengthen the skin barrier, improving resilience and long-term comfort.', 'masks-treatments'),
  ('Sensibio AR+Cream', 'sensibio-ar-cream', 'A soothing anti-redness moisturizer designed to reduce visible redness and strengthen sensitive skin. It helps calm irritation, improve skin tolerance, and protect against external triggers, leaving the skin balanced, comfortable, and visibly less reactive.

Key Ingredients: Formulated with Rosactiv™ 2.0 complex to biologically reduce and prevent redness, combined with soothing polysaccharides to calm irritation and reduce skin reactivity. Glycerin provides hydration, while phytosphingosine helps strengthen the skin barrier and improve resilience.

Best for: Suitable for sensitive and redness-prone skin. Ideal for rosacea, flushing, and reactive skin.', 2800, 'Bioderma', 'Apply to clean skin once or twice daily. Gently massage over the face and neck. Use with sunscreen during the day to prevent flare-ups', 'Suitable for sensitive and redness-prone skin. Ideal for rosacea, flushing, and reactive skin.', 'Formulated with Rosactiv™ 2.0 complex to biologically reduce and prevent redness, combined with soothing polysaccharides to calm irritation and reduce skin reactivity. Glycerin provides hydration, while phytosphingosine helps strengthen the skin barrier and improve resilience.', 'moisturisers'),
  ('Cicabio Crème', 'cicabio-cr-me', 'A repairing and soothing cream designed to restore irritated and damaged skin. It helps accelerate skin recovery, reduce discomfort, and protect the skin barrier, leaving the skin calm, hydrated, and visibly healthier.

Key Ingredients: Formulated with Copper & Zinc to purify and protect the skin, combined with Hyaluronic Acid to hydrate and support healing. Resveratrol & Centella Asiatica help repair and restore the skin barrier, while Antalgicine™ helps reduce discomfort and itching.

Best for: Suitable for all skin types, including sensitive and damaged skin. Ideal for irritation, redness, post-procedure care, and weakened skin barrier.', 4500, 'Bioderma', 'Apply to clean, dry skin once or twice daily. Use on affected areas until the skin is fully repaired.', 'Suitable for all skin types, including sensitive and damaged skin. Ideal for irritation, redness, post-procedure care, and weakened skin barrier.', 'Formulated with Copper & Zinc to purify and protect the skin, combined with Hyaluronic Acid to hydrate and support healing. Resveratrol & Centella Asiatica help repair and restore the skin barrier, while Antalgicine™ helps reduce discomfort and itching.', 'masks-treatments'),
  ('Sébium Kerato+', 's-bium-kerato', 'A targeted anti-blemish treatment designed to reduce acne, unclog pores, and prevent post-acne marks. It combines powerful exfoliating actives with high tolerance to improve skin texture, smooth imperfections, and promote a clearer, more even complexion

Key Ingredients: Formulated with Salicylic Acid (1.8%) to unclog pores and reduce breakouts, combined with Malic Acid Ester (10%) to exfoliate and promote skin renewal. The Fluidactiv™ complex helps regulate sebum quality and prevent new imperfections, while Glycerin maintains hydration and skin comfort

Best for: Suitable for oily and acne-prone skin. Ideal for breakouts, blackheads, clogged pores, and acne marks.', 3500, 'Bioderma', 'Apply to clean, dry skin morning and/or evening. Use on the entire face or targeted areas. Follow with moisturizer and daily sunscreen.', 'Suitable for oily and acne-prone skin. Ideal for breakouts, blackheads, clogged pores, and acne marks.', 'Formulated with Salicylic Acid (1.8%) to unclog pores and reduce breakouts, combined with Malic Acid Ester (10%) to exfoliate and promote skin renewal. The Fluidactiv™ complex helps regulate sebum quality and prevent new imperfections, while Glycerin maintains hydration and skin comfort', 'masks-treatments'),
  ('Sébium Hydra', 's-bium-hydra', 'A soothing and hydrating moisturizer specially formulated for oily, acne-prone skin undergoing drying treatments. It helps restore moisture, reduce discomfort, and rebalance the skin, leaving it soft, calm, and comfortable.

Key Ingredients: Formulated with Glycerin to deeply hydrate and restore moisture, combined with Ceramides to strengthen the skin barrier. Enoxolone helps soothe irritation, while the Fluidactiv™ complex helps regulate sebum quality and prevent clogged pores.

Best for: Suitable for oily and acne-prone skin, especially dehydrated or treatment-weakened skin. Ideal for dryness, irritation, and tightness caused by acne treatments', 3500, 'Bioderma', 'Apply to clean, dry skin once or twice daily. Gently smooth over the face. Can be used alongside acne treatments.', 'Suitable for oily and acne-prone skin, especially dehydrated or treatment-weakened skin. Ideal for dryness, irritation, and tightness caused by acne treatments', 'Formulated with Glycerin to deeply hydrate and restore moisture, combined with Ceramides to strengthen the skin barrier. Enoxolone helps soothe irritation, while the Fluidactiv™ complex helps regulate sebum quality and prevent clogged pores.', 'moisturisers'),
  ('Atoderm Crème', 'atoderm-cr-me', 'An ultra-nourishing daily moisturizer designed to hydrate, protect, and restore normal to dry skin. It helps strengthen the skin barrier, maintain moisture levels, and leave the skin soft, smooth, and comfortable all day long.

Key Ingredients: Formulated with Glycerin to deeply hydrate and retain moisture, combined with Niacinamide (Vitamin PP) to strengthen and restore the skin barrier. The Skin Protect Complex™ (sugars + lipids) helps maintain long-lasting hydration, while mineral oils and emollients nourish and protect the skin from dryness

Best for: Suitable for normal to dry and sensitive skin. Ideal for daily hydration and skin barrier protection for the whole family.', 0, 'Bioderma', 'Apply to clean, dry skin once or twice daily. Massage gently until fully absorbed. Can be used on the face and body.', 'Suitable for normal to dry and sensitive skin. Ideal for daily hydration and skin barrier protection for the whole family.', 'Formulated with Glycerin to deeply hydrate and retain moisture, combined with Niacinamide (Vitamin PP) to strengthen and restore the skin barrier. The Skin Protect Complex™ (sugars + lipids) helps maintain long-lasting hydration, while mineral oils and emollients nourish and protect the skin from dryness', 'body-care'),
  ('Atoderm Intensive Crème', 'atoderm-intensive-cr-me', 'A nourishing and soothing cream designed to relieve very dry, irritated, and sensitive skin. It helps restore the skin barrier, reduce itching and discomfort, and provide long-lasting hydration for softer, healthier-looking skin.

Key Ingredients: Formulated with Niacinamide (Vitamin B3) to strengthen the skin barrier and reduce irritation, combined with Glycerin to deeply hydrate and maintain moisture. Anti-itch active (PEA) helps relieve discomfort, while nourishing emollients restore lipids and improve skin resilience.

Best for: Suitable for very dry, sensitive, and atopic-prone skin. Ideal for itching, irritation, and weakened skin barrier', 0, 'Bioderma', 'Apply to clean, dry skin once or twice daily. Use on the face and body. Can be used alongside dermatological treatments.', 'Suitable for very dry, sensitive, and atopic-prone skin. Ideal for itching, irritation, and weakened skin barrier', 'Formulated with Niacinamide (Vitamin B3) to strengthen the skin barrier and reduce irritation, combined with Glycerin to deeply hydrate and maintain moisture. Anti-itch active (PEA) helps relieve discomfort, while nourishing emollients restore lipids and improve skin resilience.', 'masks-treatments'),
  ('Cicabio Crème SPF 50+', 'cicabio-cr-me-spf-50', 'A repairing and protective cream with very high sun protection, designed for weakened, irritated, or damaged skin. It helps accelerate skin recovery while preventing post-inflammatory dark marks and protecting against UV damage.

Key Ingredients: Formulated with Hyaluronic Acid and Polyglutamic Acid to hydrate and support skin repair, combined with Centella Asiatica & Resveratrol to promote healing and restore the skin barrier. Copper & Zinc help purify and protect the skin, while broad-spectrum UV filters (SPF50+) prevent hyperpigmentation and protect against sun damage.

Best for: Suitable for all skin types, including sensitive and damaged skin. Ideal for post-acne marks, post-procedure care, irritation, and scars.', 4500, 'Bioderma', 'Apply evenly to the face and neck before sun exposure. Reapply frequently, especially after sweating or towel drying. Shake well before use.', 'Suitable for all skin types, including sensitive and damaged skin. Ideal for post-acne marks, post-procedure care, irritation, and scars.', 'Formulated with Hyaluronic Acid and Polyglutamic Acid to hydrate and support skin repair, combined with Centella Asiatica & Resveratrol to promote healing and restore the skin barrier. Copper & Zinc help purify and protect the skin, while broad-spectrum UV filters (SPF50+) prevent hyperpigmentation and protect against sun damage.', 'sunscreen'),
  ('Photoderm Xdefense SPF 50+', 'photoderm-xdefense-spf-50', 'An advanced daily sunscreen that protects the skin from sun damage and environmental stress. Its ultra-fluid texture delivers high broad-spectrum protection while helping to detoxify the skin and enhance radiance for a healthy, protected complexion.

Key Ingredients: Formulated with broad-spectrum UV filters (SPF50+) to protect against UVA, UVB, visible light, and infrared rays. The Environmental Active Defense technology helps shield the skin from pollution and environmental aggressors, while Detox Science™ supports the skin''s natural detoxification process. Glycerin helps maintain hydration and skin comfort.

Best for: Suitable for all skin types, including sensitive skin. Ideal for daily sun protection, urban exposure, and pollution defense.', 3300, 'Bioderma', 'Apply evenly to the face and neck before sun exposure. Reapply frequently, especially after sweating or towel drying. Shake well before use.', 'Suitable for all skin types, including sensitive skin. Ideal for daily sun protection, urban exposure, and pollution defense.', 'Formulated with broad-spectrum UV filters (SPF50+) to protect against UVA, UVB, visible light, and infrared rays. The Environmental Active Defense technology helps shield the skin from pollution and environmental aggressors, while Detox Science™ supports the skin''s natural detoxification process. Glycerin helps maintain hydration and skin comfort.', 'sunscreen'),
  ('Photoderm Aquafluid SPF 50+', 'photoderm-aquafluid-spf-50', 'A lightweight, ultra-fluid sunscreen that delivers very high protection while leaving a dry-touch, invisible finish. It helps protect the skin from sun damage and premature aging while keeping it comfortable, fresh, and shine-free

Key Ingredients: Formulated with broad-spectrum UV filters (SPF50+) to protect against UVA and UVB rays, combined with the Cellular Bioprotection™ patent to strengthen the skin''s natural defenses. Glycerin helps maintain hydration, while mattifying powders provide a dry-touch, shine-free finish.

Best for: Suitable for all skin types, including sensitive, combination, and oily skin. Ideal for daily sun protection with a lightweight feel.', 3500, 'Bioderma', 'Apply evenly to the face and neck before sun exposure. Reapply every 2 hours or after sweating, swimming, or towel drying.', 'Suitable for all skin types, including sensitive, combination, and oily skin. Ideal for daily sun protection with a lightweight feel.', 'Formulated with broad-spectrum UV filters (SPF50+) to protect against UVA and UVB rays, combined with the Cellular Bioprotection™ patent to strengthen the skin''s natural defenses. Glycerin helps maintain hydration, while mattifying powders provide a dry-touch, shine-free finish.', 'sunscreen'),
  ('Pigmentbio Daily Care SPF 50+', 'pigmentbio-daily-care-spf-50', 'A brightening daily moisturizer with very high sun protection that helps reduce dark spots, even out skin tone, and prevent new pigmentation. It hydrates, protects, and enhances radiance for a smoother, more luminous complexion.

Key Ingredients: Formulated with LumiReveal™ Technology (Andrographolide, Lysine Azelate, Glabridin) to reduce melanin production and target dark spots. Vitamin C, E & Niacinamide (Vitamin PP) provide antioxidant protection, brighten the skin, and strengthen the barrier. Salicylic Acid gently exfoliates to enhance radiance, while broad-spectrum SPF50+ filters protect against UV-induced pigmentation.

Best for: Suitable for all skin types, especially hyperpigmented and uneven skin tone. Ideal for melasma, dark spots, and dull skin.', 6500, 'Bioderma', 'Apply to the face and neck every morning after cleansing. Reapply every 2 hours during prolonged sun exposure.', 'Suitable for all skin types, especially hyperpigmented and uneven skin tone. Ideal for melasma, dark spots, and dull skin.', 'Formulated with LumiReveal™ Technology (Andrographolide, Lysine Azelate, Glabridin) to reduce melanin production and target dark spots. Vitamin C, E & Niacinamide (Vitamin PP) provide antioxidant protection, brighten the skin, and strengthen the barrier. Salicylic Acid gently exfoliates to enhance radiance, while broad-spectrum SPF50+ filters protect against UV-induced pigmentation.', 'sunscreen'),
  ('Pigmentbio C-Concentrate', 'pigmentbio-c-concentrate', 'A high-potency brightening serum designed to reduce dark spots and improve uneven skin tone. Powered by stabilized Vitamin C and exfoliating acids, it helps refine skin texture, boost radiance, and promote a clearer, more luminous complexion.

Key Ingredients: Formulated with Stabilized Vitamin C (Ascorbyl Glucoside) to brighten skin and reduce pigmentation, combined with Vitamin E & Niacinamide (Vitamin PP) to protect, soothe, and strengthen the skin barrier. Glycolic Acid (AHA) and Salicylic Acid (BHA) provide gentle exfoliation to smooth texture and enhance radiance. The LumiReveal™ Technology helps target pigmentation at multiple stages for more effective dark spot correction.

Best for: Suitable for all skin types, especially hyperpigmented and uneven skin tone. Ideal for melasma, dark spots, and dull skin.', 8500, 'Bioderma', 'Use as a treatment cure (1–3 months). Apply 5 drops in the evening to the face and neck after cleansing. Can be used alone or before a night cream.', 'Suitable for all skin types, especially hyperpigmented and uneven skin tone. Ideal for melasma, dark spots, and dull skin.', 'Formulated with Stabilized Vitamin C (Ascorbyl Glucoside) to brighten skin and reduce pigmentation, combined with Vitamin E & Niacinamide (Vitamin PP) to protect, soothe, and strengthen the skin barrier. Glycolic Acid (AHA) and Salicylic Acid (BHA) provide gentle exfoliation to smooth texture and enhance radiance. The LumiReveal™ Technology helps target pigmentation at multiple stages for more effective dark spot correction.', 'serums'),
  ('Pigmentbio Night Renewer Cream', 'pigmentbio-night-renewer-cream', 'An overnight brightening treatment that helps reduce dark spots, even out skin tone, and boost skin renewal while you sleep. Its lightweight sleeping-mask texture hydrates, smooths, and enhances radiance for a fresher, more luminous complexion by morning.

Key Ingredients: Formulated with LumiReveal™ Technology (Andrographolide, Lysine Azelate, Glabridin) to reduce melanin production and target dark spots. Vitamin C, E & Niacinamide help brighten, protect, and strengthen the skin barrier. Glycolic Acid & Salicylic Acid gently exfoliate to boost cell renewal, while Hexapeptide-2 supports collagen production and smoother skin

Best for: Suitable for all skin types, including sensitive skin. Ideal for dark spots, uneven tone, and dull skin.', 10000, 'Bioderma', 'Apply to clean skin in the evening. Use on the face and neck after cleansing. Can be used alone or after a serum.', 'Suitable for all skin types, including sensitive skin. Ideal for dark spots, uneven tone, and dull skin.', 'Formulated with LumiReveal™ Technology (Andrographolide, Lysine Azelate, Glabridin) to reduce melanin production and target dark spots. Vitamin C, E & Niacinamide help brighten, protect, and strengthen the skin barrier. Glycolic Acid & Salicylic Acid gently exfoliate to boost cell renewal, while Hexapeptide-2 supports collagen production and smoother skin', 'moisturisers'),
  ('Pigmentbio Sensitive Areas', 'pigmentbio-sensitive-areas', 'A targeted brightening treatment designed specifically for delicate and intimate areas. It helps reduce dark spots, even out skin tone, and soothe irritation while maintaining high tolerance for sensitive skin.

Key Ingredients: Formulated with Lysine Azelate & Andrographolide to reduce melanin production and target dark spots. Glabridin (Licorice Extract) helps brighten and even skin tone, while Laminaria Ochroleuca (Golden Seaweed Extract) soothes irritation and reduces redness. Hydrating agents help maintain skin comfort and softness.

Best for: Suitable for all skin types, including sensitive and delicate areas. Ideal for underarms, inner thighs, neck, knees, elbows, and external intimate areas.', 4800, 'Bioderma', 'Apply to clean, dry skin once or twice daily. Can be used after shaving or waxing to help prevent irritation and pigmentation.', 'Suitable for all skin types, including sensitive and delicate areas. Ideal for underarms, inner thighs, neck, knees, elbows, and external intimate areas.', 'Formulated with Lysine Azelate & Andrographolide to reduce melanin production and target dark spots. Glabridin (Licorice Extract) helps brighten and even skin tone, while Laminaria Ochroleuca (Golden Seaweed Extract) soothes irritation and reduces redness. Hydrating agents help maintain skin comfort and softness.', 'masks-treatments'),
  ('Nodé DS+ Shampooing', 'nod-ds-shampooing', 'An intensive anti-dandruff shampoo designed to treat severe and persistent dandruff. It helps eliminate flakes, soothe itching, and prevent recurrence by targeting the root cause of dandruff.

Key Ingredients: Formulated with the DSactiv™ complex to reduce the growth of dandruff-causing yeast and regulate sebum. Salicylic Acid & Citric Acid help exfoliate and remove flakes, while Palmitamide MEA soothes itching and irritation. Gentle cleansing agents cleanse without stripping the scalp

Best for: Suitable for dandruff-prone, oily, and irritated scalp. Ideal for seborrheic dermatitis, itching, flakes, and redness.', 4800, 'Bioderma', 'Apply to wet scalp and gently massage. Rinse, then reapply and leave on for 5 minutes before rinsing. Use 2–3 times per week (treatment phase), then reduce to maintenance.', 'Suitable for dandruff-prone, oily, and irritated scalp. Ideal for seborrheic dermatitis, itching, flakes, and redness.', 'Formulated with the DSactiv™ complex to reduce the growth of dandruff-causing yeast and regulate sebum. Salicylic Acid & Citric Acid help exfoliate and remove flakes, while Palmitamide MEA soothes itching and irritation. Gentle cleansing agents cleanse without stripping the scalp', 'hair-care'),
  ('Sensibio H2O Micellar Water', 'sensibio-h2o-micellar-water', 'A gentle, no-rinse cleansing water that removes makeup, dirt, and impurities while soothing and respecting the skin''s natural balance. Ideal for sensitive skin, it leaves the skin clean, fresh, and comfortable without irritation.

Key Ingredients: Formulated with Micellar Technology (Cleansing Micelles) to effectively capture and remove makeup, dirt, and pollution without disrupting the skin barrier. The D.A.F™ complex helps increase skin tolerance and reduce sensitivity, while highly purified water and soothing sugars help calm and protect the skin.

Best for: Suitable for all skin types, especially sensitive and reactive skin. Ideal for daily cleansing and makeup removal.', 3500, 'Bioderma', 'Soak a cotton pad with the product. Gently cleanse the face and eyes. Repeat until clean , no rinsing required.', 'Suitable for all skin types, especially sensitive and reactive skin. Ideal for daily cleansing and makeup removal.', 'Formulated with Micellar Technology (Cleansing Micelles) to effectively capture and remove makeup, dirt, and pollution without disrupting the skin barrier. The D.A.F™ complex helps increase skin tolerance and reduce sensitivity, while highly purified water and soothing sugars help calm and protect the skin.', 'cleansers'),
  ('Effaclar Purifying Foaming Gel Cleanser', 'effaclar-purifying-foaming-gel-cleanser', 'A purifying foaming gel designed for oily and acne-prone skin. It gently removes excess oil, dirt, and impurities while maintaining the skin''s natural balance, leaving it clean, fresh, and comfortable.

Key Ingredients: Formulated with Zinc PCA to help regulate excess sebum and purify the skin, combined with La Roche-Posay Thermal Spring Water to soothe and reduce irritation. Mild cleansing agents (Coco-Betaine) gently remove impurities without over-drying the skin.

Best for: Suitable for oily, combination, and acne-prone skin. Ideal for excess oil, clogged pores, and breakouts.', 4200, 'La Roche Posay', 'Apply to wet skin and gently massage to create a light foam ( for at least a minute). Rinse thoroughly with water. Use morning and evening.', 'Suitable for oily, combination, and acne-prone skin. Ideal for excess oil, clogged pores, and breakouts.', 'Formulated with Zinc PCA to help regulate excess sebum and purify the skin, combined with La Roche-Posay Thermal Spring Water to soothe and reduce irritation. Mild cleansing agents (Coco-Betaine) gently remove impurities without over-drying the skin.', 'cleansers'),
  ('Effaclar Micro-Peeling Purifying Gel Cleanser', 'effaclar-micro-peeling-purifying-gel-cleanser', 'An exfoliating purifying cleanser designed for oily and acne-prone skin. It helps unclog pores, reduce excess oil, and smooth skin texture while targeting persistent breakouts and marks for clearer, more refined skin.

Key Ingredients: Formulated with Salicylic Acid (2%) to deeply unclog pores and reduce acne, combined with LHA (Capryloyl Salicylic Acid) for gentle micro-exfoliation and smoother skin texture. Zinc helps regulate excess oil and purify the skin, while cleansing agents remove impurities without excessive irritation

Best for: Suitable for oily and acne-prone skin. Ideal for persistent breakouts, clogged pores, blackheads, and body acne.', 4500, 'La Roche Posay', 'Apply to wet skin and gently massage to create a lather(for at least a minute). Rinse thoroughly. Use once daily or as tolerated (can also be used on the body)', 'Suitable for oily and acne-prone skin. Ideal for persistent breakouts, clogged pores, blackheads, and body acne.', 'Formulated with Salicylic Acid (2%) to deeply unclog pores and reduce acne, combined with LHA (Capryloyl Salicylic Acid) for gentle micro-exfoliation and smoother skin texture. Zinc helps regulate excess oil and purify the skin, while cleansing agents remove impurities without excessive irritation', 'cleansers'),
  ('Anthelios SPF 50+ Invisible Fluid SPF 50+', 'anthelios-spf-50-invisible-fluid-spf-50', 'A lightweight, high-protection sunscreen designed for daily use on sensitive skin. It provides very high broad-spectrum protection against UVA and UVB rays while offering an invisible, non-greasy finish for comfortable, everyday wear

Key Ingredients: Formulated with advanced UV filters to provide very high broad-spectrum protection against UVA and UVB rays. The Cell-Ox Shield® technology combines antioxidants with sun filters to help protect against environmental damage. Lightweight emollients ensure a non-greasy, invisible finish suitable for daily use.

Best for: Suitable for all skin types, including sensitive, oily, and acne-prone skin. Ideal for daily sun protection without heaviness or white cast.', 3800, 'La Roche Posay', 'Apply evenly to the face and neck before sun exposure. Reapply every 2 hours, especially after sweating or wiping. Shake well before use', 'Suitable for all skin types, including sensitive, oily, and acne-prone skin. Ideal for daily sun protection without heaviness or white cast.', 'Formulated with advanced UV filters to provide very high broad-spectrum protection against UVA and UVB rays. The Cell-Ox Shield® technology combines antioxidants with sun filters to help protect against environmental damage. Lightweight emollients ensure a non-greasy, invisible finish suitable for daily use.', 'sunscreen'),
  ('Anthelios Invisible Spray SPF50+', 'anthelios-invisible-spray-spf50', 'A lightweight, easy-to-apply sunscreen spray that provides very high broad-spectrum protection. Ideal for quick, even application on the face and body, it leaves an invisible, non-greasy finish while protecting the skin from sun damage.

Key Ingredients: Formulated with advanced UV filters (Mexoplex® system) to provide broad-spectrum protection against UVA and UVB rays. Glycerin helps maintain hydration, while La Roche-Posay Thermal Spring Water soothes and protects sensitive skin. Lightweight solvents ensure fast absorption and an invisible finish.

Best for: Suitable for all skin types, including sensitive skin. Ideal for daily use and outdoor activities.', 4000, 'La Roche Posay', 'Shake well before use. Spray generously onto the skin before sun exposure. Reapply every 2 hours, especially after sweating or swimming. Avoid spraying directly onto the face,spray into hands first.', 'Suitable for all skin types, including sensitive skin. Ideal for daily use and outdoor activities.', 'Formulated with advanced UV filters (Mexoplex® system) to provide broad-spectrum protection against UVA and UVB rays. Glycerin helps maintain hydration, while La Roche-Posay Thermal Spring Water soothes and protects sensitive skin. Lightweight solvents ensure fast absorption and an invisible finish.', 'sunscreen'),
  ('Serozinc Toner', 'serozinc-toner', 'A purifying and mattifying facial mist designed for oily and acne-prone skin. It helps reduce excess shine, soothe irritation, and tighten the appearance of pores, leaving the skin fresh, balanced, and comfortable.

Key Ingredients: Formulated with Zinc Sulfate to regulate excess oil, purify the skin, and reduce shine. Combined with Sodium Chloride for mild astringent effects and Purified Water to refresh and soothe the skin

Best for: Suitable for oily, acne-prone, and sensitive skin. Ideal for excess oil, shine, enlarged pores, and breakouts.', 4000, 'La Roche Posay', 'Spray onto the face after cleansing. Allow to absorb or gently pat into the skin. Can also be used throughout the day or over makeup to control shine.', 'Suitable for oily, acne-prone, and sensitive skin. Ideal for excess oil, shine, enlarged pores, and breakouts.', 'Formulated with Zinc Sulfate to regulate excess oil, purify the skin, and reduce shine. Combined with Sodium Chloride for mild astringent effects and Purified Water to refresh and soothe the skin', 'toners-mists'),
  ('Hydrating Cleanser', 'hydrating-cleanser', 'A gentle, non-foaming cleanser designed to cleanse while maintaining the skin''s natural moisture barrier. It removes dirt and impurities without stripping the skin, leaving it soft, hydrated, and comfortable.

Key Ingredients: Formulated with 3 Essential Ceramides (1, 3, 6-II) to help restore and protect the skin barrier, combined with Hyaluronic Acid to attract and retain moisture. Glycerin provides additional hydration, while MVE Technology ensures continuous moisture release throughout the day.

Best for: Suitable for normal to dry and sensitive skin. Ideal for dehydration, dryness, and compromised skin barrier', 2800, 'Cerave', 'Apply to damp skin and gently massage. Rinse thoroughly with water. Use morning and evening', 'Suitable for normal to dry and sensitive skin. Ideal for dehydration, dryness, and compromised skin barrier', 'Formulated with 3 Essential Ceramides (1, 3, 6-II) to help restore and protect the skin barrier, combined with Hyaluronic Acid to attract and retain moisture. Glycerin provides additional hydration, while MVE Technology ensures continuous moisture release throughout the day.', 'cleansers'),
  ('Skin Renewing Vitamin C Serum', 'skin-renewing-vitamin-c-serum', 'A brightening antioxidant serum formulated with pure Vitamin C to improve skin tone, boost radiance, and protect against environmental damage. It helps reduce dullness and early signs of aging while maintaining hydration and strengthening the skin barrier.

Key Ingredients: Formulated with 10% Pure Vitamin C (L-Ascorbic Acid) to brighten skin and reduce dark spots, combined with 3 Essential Ceramides (1, 3, 6-II) to restore and protect the skin barrier. Hyaluronic Acid helps attract and retain moisture, while Vitamin B5 soothes and supports hydration.

Best for: Suitable for all skin types, including sensitive skin. Ideal for dullness, uneven tone, and early signs of aging', 5500, 'Cerave', 'Apply to clean, dry skin in the morning. Use a few drops on the face and neck. Follow with moisturizer and sunscreen', 'Suitable for all skin types, including sensitive skin. Ideal for dullness, uneven tone, and early signs of aging', 'Formulated with 10% Pure Vitamin C (L-Ascorbic Acid) to brighten skin and reduce dark spots, combined with 3 Essential Ceramides (1, 3, 6-II) to restore and protect the skin barrier. Hyaluronic Acid helps attract and retain moisture, while Vitamin B5 soothes and supports hydration.', 'serums'),
  ('Skin Renewing Retinol Serum', 'skin-renewing-retinol-serum', 'A gentle anti-aging serum formulated with encapsulated retinol to improve skin texture, reduce fine lines, and enhance radiance. It helps renew the skin while maintaining hydration and strengthening the skin barrier.

Key Ingredients: Formulated with Encapsulated Retinol to promote skin renewal and reduce fine lines, combined with 3 Essential Ceramides (1, 3, 6-II) to restore and protect the skin barrier. Hyaluronic Acid provides hydration and plumps the skin, while Niacinamide helps soothe and reduce irritation.

Best for: Suitable for all skin types, including sensitive skin. Ideal for fine lines, uneven texture, and early signs of aging', 5200, 'Cerave', 'Apply to clean skin in the evening only. Start 2–3 times per week, then increase as tolerated. Always use sunscreen during the day', 'Suitable for all skin types, including sensitive skin. Ideal for fine lines, uneven texture, and early signs of aging', 'Formulated with Encapsulated Retinol to promote skin renewal and reduce fine lines, combined with 3 Essential Ceramides (1, 3, 6-II) to restore and protect the skin barrier. Hyaluronic Acid provides hydration and plumps the skin, while Niacinamide helps soothe and reduce irritation.', 'masks-treatments'),
  ('Skin Resurfacing Retinol Serum', 'skin-resurfacing-retinol-serum', 'A lightweight retinol serum formulated to reduce post-acne marks, refine skin texture, and improve overall skin clarity. It helps smooth uneven skin while maintaining hydration and supporting the skin barrier

Key Ingredients: Formulated with Encapsulated Retinol to promote cell turnover and smooth skin texture, combined with Niacinamide to calm and reduce inflammation. Licorice Root Extract helps brighten and fade dark marks, while 3 Essential Ceramides (1, 3, 6-II) restore and protect the skin barrier. Hyaluronic Acid provides hydration and improves skin comfort.

Best for: Suitable for normal, combination, and oily skin. Ideal for post-acne marks, uneven texture, enlarged pores, and breakouts.', 4900, 'Cerave', 'Apply to clean skin in the evening only. Start 2–3 times per week, then increase as tolerated. Always follow with moisturizer and use SPF during the day.', 'Suitable for normal, combination, and oily skin. Ideal for post-acne marks, uneven texture, enlarged pores, and breakouts.', 'Formulated with Encapsulated Retinol to promote cell turnover and smooth skin texture, combined with Niacinamide to calm and reduce inflammation. Licorice Root Extract helps brighten and fade dark marks, while 3 Essential Ceramides (1, 3, 6-II) restore and protect the skin barrier. Hyaluronic Acid provides hydration and improves skin comfort.', 'masks-treatments'),
  ('SA Smothing Cream', 'sa-smothing-cream', 'An exfoliating and hydrating cream designed to smooth rough, bumpy skin and improve texture. It gently removes dead skin cells while restoring the skin barrier, leaving skin softer, clearer, and more even.

Key Ingredients: Formulated with Salicylic Acid (BHA) to exfoliate and unclog pores, combined with Lactic Acid (AHA) to smooth skin texture. 10% Urea deeply hydrates and softens rough patches, while 3 Essential Ceramides (1, 3, 6-II) help restore and protect the skin barrier. Hyaluronic Acid attracts moisture, and Niacinamide helps soothe the skin.

Best for: Suitable for dry, rough, and bumpy skin. Ideal for keratosis pilaris (KP), rough patches, and body acne.', 4500, 'Cerave', 'Apply generously to affected areas daily. Best used after showering on slightly damp skin. Avoid the eye area.', 'Suitable for dry, rough, and bumpy skin. Ideal for keratosis pilaris (KP), rough patches, and body acne.', 'Formulated with Salicylic Acid (BHA) to exfoliate and unclog pores, combined with Lactic Acid (AHA) to smooth skin texture. 10% Urea deeply hydrates and softens rough patches, while 3 Essential Ceramides (1, 3, 6-II) help restore and protect the skin barrier. Hyaluronic Acid attracts moisture, and Niacinamide helps soothe the skin.', 'moisturisers'),
  ('2% BHA Liquid Exfoliant', '2-bha-liquid-exfoliant', 'A exfoliating toner that unclogs pores, reduces blackheads, and smooths skin texture. This leave-on formula works deep inside the pores to control oil and improve clarity for visibly clearer, more radiant skin.

Key Ingredients: 2% Salicylic Acid (BHA) → penetrates pores, unclogs congestion, reduces acne
Green Tea Extract → soothes irritation and provides antioxidant benefits
Methylpropanediol → enhances absorption and hydrates the skin

Best for: Suitable for all skin types, especially:

Oily & acne-prone skin
Combination skin
Blackhead-prone skin', 7000, 'Paula''s Choice', 'Apply after cleansing using hands or a cotton pad. Do not rinse. Start thrice a week, then increase to daily as tolerated. Always follow with sunscreen during the day', 'Suitable for all skin types, especially:

Oily & acne-prone skin
Combination skin
Blackhead-prone skin', '2% Salicylic Acid (BHA) → penetrates pores, unclogs congestion, reduces acne
Green Tea Extract → soothes irritation and provides antioxidant benefits
Methylpropanediol → enhances absorption and hydrates the skin', 'masks-treatments'),
  ('Glycolic 7% Toner', 'glycolic-7-toner', 'A powerful exfoliating toner that removes dead skin cells, improves uneven tone, and enhances skin radiance for a smoother, brighter complexion.

Key Ingredients: Formulated with 7% Glycolic Acid (AHA) to exfoliate dead skin cells, smooth texture, and brighten the complexion, combined with Tasmanian Pepperberry Extract to help reduce irritation. Aloe Vera soothes and hydrates the skin, while Ginseng Root Extract helps boost radiance and revitalize dull skin.

Best for: Suitable for normal, combination skin. Ideal for dullness, uneven tone, texture. Not recommended for sensitive skin', 0, 'The Ordinary', 'Apply to the face using a cotton pad in the evening. Do not rinse. Start 2–3 times per week, then increase as tolerated', 'Suitable for normal, combination skin. Ideal for dullness, uneven tone, texture. Not recommended for sensitive skin', 'Formulated with 7% Glycolic Acid (AHA) to exfoliate dead skin cells, smooth texture, and brighten the complexion, combined with Tasmanian Pepperberry Extract to help reduce irritation. Aloe Vera soothes and hydrates the skin, while Ginseng Root Extract helps boost radiance and revitalize dull skin.', 'masks-treatments'),
  ('Azelaic 10% serum', 'azelaic-10-serum', 'A multi-benefit treatment that helps reduce acne, calm redness, and brighten uneven skin tone while improving overall skin texture.

Key Ingredients: Formulated with 10% Azelaic Acid to reduce acne, calm inflammation, and brighten uneven skin tone, combined with Vitamin E (Tocopherol) to provide antioxidant protection. A base of silicone derivatives (Dimethicone) helps create a smooth texture and improve application while maintaining skin comfort.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for acne, redness, rosacea, and dark spots.', 3000, 'The Ordinary', 'Apply a small amount to the face morning and/or evening. Use after water-based serums and before heavier creams. Always follow with SPF during the day.', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for acne, redness, rosacea, and dark spots.', 'Formulated with 10% Azelaic Acid to reduce acne, calm inflammation, and brighten uneven skin tone, combined with Vitamin E (Tocopherol) to provide antioxidant protection. A base of silicone derivatives (Dimethicone) helps create a smooth texture and improve application while maintaining skin comfort.', 'masks-treatments'),
  ('Lash & Brow Serum', 'lash-brow-serum', 'A lightweight treatment designed to enhance the appearance of thicker, fuller, and healthier-looking lashes and brows with consistent use.

Key Ingredients: Formulated with a multi-peptide complex to support stronger, fuller-looking lashes and brows, combined with Biotinoyl Tripeptide-1 to help improve density and thickness. Panthenol (Pro-Vitamin B5) nourishes and conditions hair, while Hyaluronic Acid helps hydrate and support healthy hair growth.

Best for: Suitable for all lash and brow types.', 3000, 'The Ordinary', 'Apply a thin layer along the lash line and on brows once daily (preferably at night). Use on clean, dry skin. Allow to absorb before applying other products.', 'Suitable for all lash and brow types.', 'Formulated with a multi-peptide complex to support stronger, fuller-looking lashes and brows, combined with Biotinoyl Tripeptide-1 to help improve density and thickness. Panthenol (Pro-Vitamin B5) nourishes and conditions hair, while Hyaluronic Acid helps hydrate and support healthy hair growth.', 'hair-care'),
  ('Squalane + Amino Acids Lip Balm', 'squalane-amino-acids-lip-balm', 'A nourishing lip balm that hydrates, softens, and protects dry lips while restoring comfort and smoothness.

Key Ingredients: Formulated with Squalane to deeply moisturize and prevent moisture loss, combined with Amino Acids to support hydration and repair. Shea Butter helps soften and nourish the lips, while Plant-Based Oils provide additional conditioning and protection.

Best for: Suitable for all skin types. Ideal for dry, chapped, and dehydrated lips.', 3500, 'The Ordinary', 'Apply directly to lips as needed throughout the day. Can be used alone or under lipstick.', 'Suitable for all skin types. Ideal for dry, chapped, and dehydrated lips.', 'Formulated with Squalane to deeply moisturize and prevent moisture loss, combined with Amino Acids to support hydration and repair. Shea Butter helps soften and nourish the lips, while Plant-Based Oils provide additional conditioning and protection.', 'masks-treatments'),
  ('Xémose Hydrating Lotion', 'x-mose-hydrating-lotion', 'A soothing, lipid-replenishing body lotion that hydrates, nourishes, and protects very dry and sensitive skin while restoring comfort and softness.

Key Ingredients: Formulated with Uriage Thermal Water to soothe and strengthen the skin barrier, combined with the Cerasterol 2F complex to restore lipids and reinforce the skin''s protective barrier. Glycerin helps attract and retain moisture, while nourishing emollients help soften and protect dry, irritated skin.

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, irritated, and itchy skin', 6500, 'Uriage', 'Apply daily to clean, dry skin. Use once or twice daily on the body. Suitable for adults, children, and babies.', 'Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, irritated, and itchy skin', 'Formulated with Uriage Thermal Water to soothe and strengthen the skin barrier, combined with the Cerasterol 2F complex to restore lipids and reinforce the skin''s protective barrier. Glycerin helps attract and retain moisture, while nourishing emollients help soften and protect dry, irritated skin.', 'moisturisers'),
  ('Xémose Cleansing Oil', 'x-mose-cleansing-oil', 'A gentle, lipid-replenishing cleansing oil that cleanses, soothes, and protects very dry and sensitive skin while maintaining the skin''s natural barrier.

Key Ingredients: Formulated with Glycerin to deeply hydrate and protect the skin barrier, combined with Shea Butter to nourish, soothe, and relieve dryness and itching. Lipid-replenishing agents (Ceramides) help restore the skin''s protective barrier, while gentle cleansing agents remove impurities without stripping the skin.

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, itchy, and irritated skin.', 6000, 'Uriage', 'Apply to wet skin and massage to create a light lather. Rinse thoroughly and gently pat dry. Use daily on face and body.', 'Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, itchy, and irritated skin.', 'Formulated with Glycerin to deeply hydrate and protect the skin barrier, combined with Shea Butter to nourish, soothe, and relieve dryness and itching. Lipid-replenishing agents (Ceramides) help restore the skin''s protective barrier, while gentle cleansing agents remove impurities without stripping the skin.', 'cleansers'),
  ('Oil-Free Acne Wash', 'oil-free-acne-wash', 'A daily acne-fighting cleanser that deeply cleans pores, reduces breakouts, and controls excess oil for clearer, healthier-looking skin.

Key Ingredients: Formulated with 2% Salicylic Acid (BHA) to unclog pores, treat acne, and prevent future breakouts, combined with Aloe Vera & Chamomile Extracts to help soothe and calm the skin. Gentle cleansing agents remove excess oil and impurities without leaving pore-clogging residue.

Best for: Suitable for oily and acne-prone skin. Ideal for breakouts, blackheads, and excess oil.', 4000, 'Neutrogena', 'Apply to wet face and gently massage to create a lather. Rinse thoroughly. start with thrice a week, then daily as tolerated', 'Suitable for oily and acne-prone skin. Ideal for breakouts, blackheads, and excess oil.', 'Formulated with 2% Salicylic Acid (BHA) to unclog pores, treat acne, and prevent future breakouts, combined with Aloe Vera & Chamomile Extracts to help soothe and calm the skin. Gentle cleansing agents remove excess oil and impurities without leaving pore-clogging residue.', 'masks-treatments'),
  ('Fresh Foaming Cleanser', 'fresh-foaming-cleanser', 'A 2-in-1 cleanser and makeup remover that effectively removes dirt, oil, and even waterproof makeup while leaving the skin clean and refreshed.

Key Ingredients: Formulated with Glycerin to help maintain hydration and prevent dryness, combined with Mild Cleansing Agents (Lauryl Glucoside, Decyl Glucoside, Cocamidopropyl Betaine) to effectively remove dirt, oil, and makeup. Additional cleansing agents help create a rich foam that cleanses thoroughly without leaving pore-clogging residue

Best for: Suitable for normal, combination, and oily skin. Ideal for makeup removal, daily cleansing, and excess oil', 2200, 'Neutrogena', 'Apply to wet face and massage into a foamy lather. Gently cleanse, including around the eyes. Rinse thoroughly with water.', 'Suitable for normal, combination, and oily skin. Ideal for makeup removal, daily cleansing, and excess oil', 'Formulated with Glycerin to help maintain hydration and prevent dryness, combined with Mild Cleansing Agents (Lauryl Glucoside, Decyl Glucoside, Cocamidopropyl Betaine) to effectively remove dirt, oil, and makeup. Additional cleansing agents help create a rich foam that cleanses thoroughly without leaving pore-clogging residue', 'cleansers'),
  ('Alcohol Free Toner', 'alcohol-free-toner', 'A gentle daily toner that removes impurities and refreshes the skin without drying it out, leaving it clean, soft, and balanced

Key Ingredients: Formulated with Glycerin to help hydrate and maintain the skin''s moisture balance, combined with Panthenol (Pro-Vitamin B5) to soothe and condition the skin. Mild cleansing agents (Polysorbate 20) help remove leftover impurities, while a water-based formula refreshes without stripping the skin.

Best for: Suitable for all skin types, including sensitive skin. Ideal for daily toning, light cleansing, and maintaining skin balance', 2000, 'Neutrogena', 'Apply using a cotton pad after cleansing. Gently sweep over face and neck.', 'Suitable for all skin types, including sensitive skin. Ideal for daily toning, light cleansing, and maintaining skin balance', 'Formulated with Glycerin to help hydrate and maintain the skin''s moisture balance, combined with Panthenol (Pro-Vitamin B5) to soothe and condition the skin. Mild cleansing agents (Polysorbate 20) help remove leftover impurities, while a water-based formula refreshes without stripping the skin.', 'toners-mists'),
  ('Hydroboost  Hydratig Serum', 'hydroboost-hydratig-serum', 'A lightweight hydrating serum that boosts moisture levels, smooths the skin, and enhances radiance for a plump, healthy-looking complexion.

Key Ingredients: Formulated with Hyaluronic Acid (Sodium Hyaluronate) to attract and retain moisture for plumper, hydrated skin, combined with Glycerin to enhance hydration and prevent moisture loss. Natural Moisturizing Factors (Amino Acids & Electrolytes) help restore the skin''s moisture balance, while soothing agents help maintain skin comfort.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for dehydration, dullness, and tight skin.', 3600, 'Neutrogena', 'Apply to clean skin morning and evening. Use before moisturizer. Can be layered under makeup.', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for dehydration, dullness, and tight skin.', 'Formulated with Hyaluronic Acid (Sodium Hyaluronate) to attract and retain moisture for plumper, hydrated skin, combined with Glycerin to enhance hydration and prevent moisture loss. Natural Moisturizing Factors (Amino Acids & Electrolytes) help restore the skin''s moisture balance, while soothing agents help maintain skin comfort.', 'serums'),
  ('Hydroboost Gel Cream', 'hydroboost-gel-cream', 'A deeply hydrating gel-cream moisturizer that replenishes moisture, strengthens the skin barrier, and leaves skin soft, smooth, and comfortable without a greasy feel.

Key Ingredients: A deeply hydrating gel-cream moisturizer that replenishes moisture, strengthens the skin barrier, and leaves skin soft, smooth, and comfortable without a greasy feel.

Best for: Suitable for normal to dry and sensitive skin. Ideal for dehydration, tightness, and dull skin.', 3800, 'Neutrogena', 'Apply to clean face and neck morning and evening. Use after serum for best results', 'Suitable for normal to dry and sensitive skin. Ideal for dehydration, tightness, and dull skin.', 'A deeply hydrating gel-cream moisturizer that replenishes moisture, strengthens the skin barrier, and leaves skin soft, smooth, and comfortable without a greasy feel.', 'masks-treatments'),
  ('Body Sunscreen SPF', 'body-sunscreen-spf', 'A lightweight, high-protection sunscreen designed to shield the skin from harmful UVA and UVB rays while keeping it protected during daily activities and outdoor exposure.

Key Ingredients: Formulated with chemical UV filters (Avobenzone, Homosalate, Octisalate, Octocrylene) to provide broad-spectrum protection against UVA and UVB rays, combined with Helioplex® technology for enhanced sun stability. Some variants include Vitamin E and Niacinamide to help nourish and protect the skin, while lightweight emollients ensure a non-greasy, fast-absorbing finish.

Best for: Suitable for all skin types. Oily skin → Clear Body Spray. Sensitive skin → Mineral versions. Normal skin → Ultra Sheer / Beach Defense', 3500, 'Neutrogena', 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after swimming/sweating. Use on all exposed body areas.', 'Suitable for all skin types. Oily skin → Clear Body Spray. Sensitive skin → Mineral versions. Normal skin → Ultra Sheer / Beach Defense', 'Formulated with chemical UV filters (Avobenzone, Homosalate, Octisalate, Octocrylene) to provide broad-spectrum protection against UVA and UVB rays, combined with Helioplex® technology for enhanced sun stability. Some variants include Vitamin E and Niacinamide to help nourish and protect the skin, while lightweight emollients ensure a non-greasy, fast-absorbing finish.', 'sunscreen'),
  ('Daily Hydration +SPF 15', 'daily-hydration-spf-15', 'A lightweight daily body lotion that provides long-lasting hydration while protecting the skin from sun damage, leaving it soft, smooth, and healthy-looking.

Key Ingredients: Formulated with Glycerin to attract and retain moisture for long-lasting hydration, combined with Sunflower Seed Oil to nourish and soften the skin. Pro-Vitamin B5 (Panthenol) helps soothe and support the skin barrier, while chemical UV filters (Avobenzone, Octisalate, Homosalate) provide broad-spectrum protection against UVA and UVB rays.

Best for: Suitable for normal to dry and sensitive skin. Ideal for daily hydration + light sun protection', 4500, 'Eucerin', 'Apply generously to the body 15 minutes before sun exposure. Reapply every 2 hours if exposed to sunlight. Can be used daily after showering.', 'Suitable for normal to dry and sensitive skin. Ideal for daily hydration + light sun protection', 'Formulated with Glycerin to attract and retain moisture for long-lasting hydration, combined with Sunflower Seed Oil to nourish and soften the skin. Pro-Vitamin B5 (Panthenol) helps soothe and support the skin barrier, while chemical UV filters (Avobenzone, Octisalate, Homosalate) provide broad-spectrum protection against UVA and UVB rays.', 'body-care'),
  ('Roughness Relief  Lotion', 'roughness-relief-lotion', 'An exfoliating and hydrating body lotion that smooths rough, bumpy skin while restoring moisture and improving overall skin texture.

Key Ingredients: Formulated with 10% Urea to hydrate and gently exfoliate rough, bumpy skin, combined with Alpha Hydroxy Acids (AHA) to improve texture and promote smoother skin. Ceramide-3 helps restore and strengthen the skin barrier, while Glycerin attracts and retains moisture for long-lasting hydration.

Best for: Suitable for dry, very dry, and rough skin. Ideal for keratosis pilaris (KP), rough patches, and bumpy skin.', 4500, 'Eucerin', 'Apply daily to clean, dry skin. Use consistently for best results. Use sunscreen on exposed areas (contains exfoliating acids).', 'Suitable for dry, very dry, and rough skin. Ideal for keratosis pilaris (KP), rough patches, and bumpy skin.', 'Formulated with 10% Urea to hydrate and gently exfoliate rough, bumpy skin, combined with Alpha Hydroxy Acids (AHA) to improve texture and promote smoother skin. Ceramide-3 helps restore and strengthen the skin barrier, while Glycerin attracts and retains moisture for long-lasting hydration.', 'body-care'),
  ('Intensive Repair Lotion', 'intensive-repair-lotion', 'A rich, exfoliating body lotion that deeply hydrates, smooths rough texture, and restores very dry, flaky skin for a softer, healthier appearance.

Key Ingredients: Formulated with Alpha Hydroxy Acids (AHAs) to gently exfoliate dead skin cells and improve texture, combined with Urea to soften rough patches and deeply hydrate. Glycerin helps attract and retain moisture, while Natural Moisturizing Factors (NMFs) restore the skin barrier and maintain hydration. Nourishing ingredients like Sunflower Oil & Pro-Vitamin B5 help soothe and condition dry, irritated skin.

Best for: Suitable for very dry, rough, and flaky skin. Ideal for eczema-prone, dull, and ashy skin.', 3500, 'Eucerin', 'Apply daily to clean, dry skin. Massage until fully absorbed. Best used after showering', 'Suitable for very dry, rough, and flaky skin. Ideal for eczema-prone, dull, and ashy skin.', 'Formulated with Alpha Hydroxy Acids (AHAs) to gently exfoliate dead skin cells and improve texture, combined with Urea to soften rough patches and deeply hydrate. Glycerin helps attract and retain moisture, while Natural Moisturizing Factors (NMFs) restore the skin barrier and maintain hydration. Nourishing ingredients like Sunflower Oil & Pro-Vitamin B5 help soothe and condition dry, irritated skin.', 'body-care'),
  ('Vitamin C body Lotion', 'vitamin-c-body-lotion', 'A brightening body lotion that hydrates, improves uneven skin tone, and enhances radiance for smoother, more luminous-looking skin

Key Ingredients: Formulated with Vitamin C (Ascorbic Acid & derivatives) to brighten the skin and improve uneven tone, combined with Ferulic Acid to enhance antioxidant protection and boost brightening effects. Vitamin E helps nourish and protect the skin, while Coconut Oil deeply moisturizes and softens. Glycerin & Aloe Vera provide hydration and soothing benefits for smoother, healthier-looking skin.

Best for: Suitable for all skin types. Ideal for dull skin, uneven tone, dark spots, and dryness.', 4400, 'Advanced Clinicals', 'Apply to clean or slightly damp skin. Massage until fully absorbed. Use daily (morning or evening)', 'Suitable for all skin types. Ideal for dull skin, uneven tone, dark spots, and dryness.', 'Formulated with Vitamin C (Ascorbic Acid & derivatives) to brighten the skin and improve uneven tone, combined with Ferulic Acid to enhance antioxidant protection and boost brightening effects. Vitamin E helps nourish and protect the skin, while Coconut Oil deeply moisturizes and softens. Glycerin & Aloe Vera provide hydration and soothing benefits for smoother, healthier-looking skin.', 'body-care'),
  ('Aloe Liquid Soap', 'aloe-liquid-soap', 'A gentle, multi-purpose cleansing soap that washes away impurities while hydrating and soothing the skin, leaving it soft, clean, and refreshed.

Key Ingredients: Formulated with Aloe Vera (Aloe Barbadensis Leaf Juice – ~39%) to soothe, hydrate, and soften the skin, combined with Argan Oil to nourish and protect with essential fatty acids and vitamin E. Jojoba Extract helps maintain moisture balance, while Cucumber Extract soothes and refreshes the skin. Glycerin provides additional hydration, and Arnica Extract helps calm and condition the skin.

Best for: Suitable for all skin types, including sensitive skin. Ideal for daily cleansing of face, hands, and bod', 2600, 'Forever', 'Apply to wet skin, lather gently, then rinse thoroughly. Can be used on hands, face, body, and even hair.', 'Suitable for all skin types, including sensitive skin. Ideal for daily cleansing of face, hands, and bod', 'Formulated with Aloe Vera (Aloe Barbadensis Leaf Juice – ~39%) to soothe, hydrate, and soften the skin, combined with Argan Oil to nourish and protect with essential fatty acids and vitamin E. Jojoba Extract helps maintain moisture balance, while Cucumber Extract soothes and refreshes the skin. Glycerin provides additional hydration, and Arnica Extract helps calm and condition the skin.', 'cleansers'),
  ('Aloe Propolis Creme', 'aloe-propolis-creme', 'A rich, nourishing cream that deeply hydrates, soothes, and protects the skin while improving softness and overall skin comfort.

Key Ingredients: Formulated with Aloe Vera (Aloe Barbadensis Leaf Juice) to soothe, hydrate, and support skin healing, combined with Bee Propolis Extract to provide antibacterial and protective benefits. Chamomile Extract helps calm and reduce irritation, while Vitamin A & Vitamin E nourish the skin and provide antioxidant protection. Beeswax helps lock in moisture and protect the skin barrier.

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for rough skin, irritation, and dryness.', 2900, 'Forever', 'Apply to clean skin as needed. Use on face and body, focusing on dry or irritated areas.', 'Suitable for dry, very dry, and sensitive skin. Ideal for rough skin, irritation, and dryness.', 'Formulated with Aloe Vera (Aloe Barbadensis Leaf Juice) to soothe, hydrate, and support skin healing, combined with Bee Propolis Extract to provide antibacterial and protective benefits. Chamomile Extract helps calm and reduce irritation, while Vitamin A & Vitamin E nourish the skin and provide antioxidant protection. Beeswax helps lock in moisture and protect the skin barrier.', 'moisturisers'),
  ('Hyaluronic acid moisturizing body wash', 'hyaluronic-acid-moisturizing-body-wash', 'A hydrating body wash that gently cleanses while boosting moisture, leaving the skin soft, smooth, and refreshed after every wash.

Key Ingredients: Formulated with Hyaluronic Acid to attract and retain moisture for hydrated, plump skin, combined with Glycerin to help maintain the skin''s moisture balance. Niacinamide (Vitamin B3) helps improve skin smoothness and strengthen the barrier, while gentle cleansing agents cleanse without stripping the skin.

Best for: Suitable for all skin types, especially dry and dehydrated skin. Ideal for daily cleansing with added hydration.', 3900, 'Olay', 'Apply to wet skin using hands or a sponge. Massage into a lather, then rinse thoroughly. Use daily in the shower.', 'Suitable for all skin types, especially dry and dehydrated skin. Ideal for daily cleansing with added hydration.', 'Formulated with Hyaluronic Acid to attract and retain moisture for hydrated, plump skin, combined with Glycerin to help maintain the skin''s moisture balance. Niacinamide (Vitamin B3) helps improve skin smoothness and strengthen the barrier, while gentle cleansing agents cleanse without stripping the skin.', 'body-care'),
  ('Retinol Moisturizing Body wash', 'retinol-moisturizing-body-wash', 'A renewing body wash that gently cleanses while helping to improve skin texture and smoothness, leaving the skin soft, refreshed, and more radiant.

Key Ingredients: Formulated with Retinol (Vitamin A derivative) to help improve skin texture and promote smoother-looking skin, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance radiance. Glycerin helps maintain hydration, while gentle cleansing agents cleanse without stripping the skin.

Best for: Suitable for all skin types, especially dull or rough skin. Ideal for improving texture and smoothness.', 4500, 'Olay', 'Apply to wet skin using hands or a sponge. Massage into a lather, then rinse thoroughly. Use daily in the shower.', 'Suitable for all skin types, especially dull or rough skin. Ideal for improving texture and smoothness.', 'Formulated with Retinol (Vitamin A derivative) to help improve skin texture and promote smoother-looking skin, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance radiance. Glycerin helps maintain hydration, while gentle cleansing agents cleanse without stripping the skin.', 'body-care'),
  ('Vitamin C Moisturizing Body Wash', 'vitamin-c-moisturizing-body-wash', 'A brightening body wash that gently cleanses while boosting radiance, leaving the skin refreshed, hydrated, and glowing.

Key Ingredients: Formulated with Vitamin C (derivative) to help brighten and improve skin radiance, combined with Niacinamide (Vitamin B3) to support the skin barrier and enhance smoothness. Glycerin helps attract and retain moisture, while gentle cleansing agents cleanse the skin without stripping it.

Best for: Suitable for all skin types. Ideal for dull, tired-looking skin and daily cleansing.', 3900, 'Olay', 'Apply to wet skin using hands or a sponge. Massage into a lather, then rinse thoroughly. Use daily in the shower.', 'Suitable for all skin types. Ideal for dull, tired-looking skin and daily cleansing.', 'Formulated with Vitamin C (derivative) to help brighten and improve skin radiance, combined with Niacinamide (Vitamin B3) to support the skin barrier and enhance smoothness. Glycerin helps attract and retain moisture, while gentle cleansing agents cleanse the skin without stripping it.', 'body-care'),
  ('Collagen Peptide Moisturizing Body Wash', 'collagen-peptide-moisturizing-body-wash', 'A nourishing body wash that gently cleanses while improving skin firmness and elasticity, leaving the skin soft, smooth, and healthy-looking.

Key Ingredients: Formulated with Collagen Peptides to help support skin firmness and improve elasticity, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance smoothness. Glycerin helps attract and retain moisture, while gentle cleansing agents cleanse without stripping the skin.

Best for: Suitable for all skin types, especially dry and mature skin. Ideal for loss of firmness, dryness, and dull skin.', 3500, 'Olay', 'Apply to wet skin using hands or a sponge. Massage into a lather, then rinse thoroughly. Use daily in the shower.', 'Suitable for all skin types, especially dry and mature skin. Ideal for loss of firmness, dryness, and dull skin.', 'Formulated with Collagen Peptides to help support skin firmness and improve elasticity, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance smoothness. Glycerin helps attract and retain moisture, while gentle cleansing agents cleanse without stripping the skin.', 'body-care'),
  ('Hyaluronic Acid Moisturizing Body Lotion', 'hyaluronic-acid-moisturizing-body-lotion', 'A lightweight moisturizing lotion that deeply hydrates and locks in moisture, leaving the skin soft, smooth, and visibly plump

Key Ingredients: Formulated with Hyaluronic Acid to attract and retain moisture for plumper, hydrated skin, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and improve smoothness. Glycerin helps maintain hydration, while nourishing emollients soften and protect the skin

Best for: Suitable for all skin types, especially dry and dehydrated skin. Ideal for tightness, dullness, and moisture loss.', 3900, 'Olay', 'Apply to clean or slightly damp skin. Massage until fully absorbed. Use daily (morning and evening).', 'Suitable for all skin types, especially dry and dehydrated skin. Ideal for tightness, dullness, and moisture loss.', 'Formulated with Hyaluronic Acid to attract and retain moisture for plumper, hydrated skin, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and improve smoothness. Glycerin helps maintain hydration, while nourishing emollients soften and protect the skin', 'body-care'),
  ('Age Renew Retinol Overnight Body & Face Lotion', 'age-renew-retinol-overnight-body-face-lotion', 'An overnight smoothing lotion that helps improve skin texture, firmness, and tone while deeply hydrating for softer, healthier-looking skin

Key Ingredients: Formulated with Retinol to help improve skin texture and reduce the appearance of fine lines, combined with Peptides to support skin firmness and elasticity. Niacinamide (Vitamin B3) helps strengthen the skin barrier and enhance radiance, while Glycerin provides deep hydration. Nourishing emollients help soften and smooth the skin.

Best for: Suitable for all skin types, especially mature and dry skin. Ideal for fine lines, uneven texture, and dull skin.', 5800, 'Gold Bond', 'Apply to clean skin in the evening. Massage into body (and face if suitable). Use daily at night and apply SPF during the day.', 'Suitable for all skin types, especially mature and dry skin. Ideal for fine lines, uneven texture, and dull skin.', 'Formulated with Retinol to help improve skin texture and reduce the appearance of fine lines, combined with Peptides to support skin firmness and elasticity. Niacinamide (Vitamin B3) helps strengthen the skin barrier and enhance radiance, while Glycerin provides deep hydration. Nourishing emollients help soften and smooth the skin.', 'body-care'),
  ('Diabetics'' Dry Skin Relief Body Lotion', 'diabetics-dry-skin-relief-body-lotion', 'A clinically tested moisturizing lotion designed to relieve dryness and improve skin condition in diabetic skin, leaving it softer, smoother, and healthier-looking.

Key Ingredients: Formulated with Aloe Vera to soothe and calm dry, irritated skin, combined with Vitamins B, C & E to nourish and protect the skin. Glycerin helps attract and retain moisture, while a blend of skin-conditioning emollients helps restore softness and improve overall skin texture

Best for: Suitable for very dry and sensitive skin. Ideal for diabetic skin, extreme dryness, and rough texture.', 3500, 'Gold Bond', 'Apply daily to clean, dry skin. Massage gently until fully absorbed. (Use regularly for best results).', 'Suitable for very dry and sensitive skin. Ideal for diabetic skin, extreme dryness, and rough texture.', 'Formulated with Aloe Vera to soothe and calm dry, irritated skin, combined with Vitamins B, C & E to nourish and protect the skin. Glycerin helps attract and retain moisture, while a blend of skin-conditioning emollients helps restore softness and improve overall skin texture', 'moisturisers'),
  ('Cetaphil Moisturizing Cream (Face & Body)', 'cetaphil-moisturizing-cream-face-body', 'A rich, non-greasy moisturizing cream that provides long-lasting hydration while protecting and restoring the skin''s natural barrier

Key Ingredients: Formulated with Glycerin to attract and retain moisture, combined with Sweet Almond Oil to nourish and soften the skin. Panthenol (Pro-Vitamin B5) helps soothe and support the skin barrier, while Niacinamide (Vitamin B3) improves skin resilience and hydration. Rich emollients help lock in moisture and protect against dryness

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for dehydration, tightness, and compromised skin barrier', 3800, 'Cetaphil', 'Apply to clean, dry skin. Use daily on face and body. Reapply as needed, especially on dry areas', 'Suitable for dry, very dry, and sensitive skin. Ideal for dehydration, tightness, and compromised skin barrier', 'Formulated with Glycerin to attract and retain moisture, combined with Sweet Almond Oil to nourish and soften the skin. Panthenol (Pro-Vitamin B5) helps soothe and support the skin barrier, while Niacinamide (Vitamin B3) improves skin resilience and hydration. Rich emollients help lock in moisture and protect against dryness', 'body-care'),
  ('Kiehl''s Ultra Facial Cream', 'kiehl-s-ultra-facial-cream', 'A lightweight yet deeply hydrating moisturizer that provides long-lasting moisture, strengthens the skin barrier, and keeps skin soft and balanced throughout the day

Key Ingredients: Formulated with Squalane to deeply moisturize and prevent moisture loss, combined with Glacial Glycoprotein to help protect and hydrate the skin in harsh conditions. Glycerin helps attract and retain moisture, while nourishing emollients support a smooth, soft skin barrier.

Best for: Suitable for all skin types, including sensitive skin. Ideal for dehydration, dryness, and daily moisture maintenance', 9500, 'Kiehl''s', 'Apply to clean skin morning and evening. Use after serum for best results', 'Suitable for all skin types, including sensitive skin. Ideal for dehydration, dryness, and daily moisture maintenance', 'Formulated with Squalane to deeply moisturize and prevent moisture loss, combined with Glacial Glycoprotein to help protect and hydrate the skin in harsh conditions. Glycerin helps attract and retain moisture, while nourishing emollients support a smooth, soft skin barrier.', 'moisturisers'),
  ('Creme de Corps', 'creme-de-corps', 'A rich, luxurious body moisturizer that deeply nourishes and softens dry skin, leaving it smooth, supple, and hydrated all day

Key Ingredients: Formulated with Cocoa Butter to deeply nourish and improve skin softness, combined with Shea Butter to moisturize and protect the skin barrier. Squalane helps prevent moisture loss and maintain hydration, while Beta-Carotene (Pro-Vitamin A) provides antioxidant benefits and enhances skin smoothness.

Best for: Suitable for dry to very dry skin. Ideal for roughness, flakiness, and long-lasting hydration.', 12000, 'Kiehl''s', 'Apply to clean skin after showering. Massage until fully absorbed. Use  Twice daily for best results.', 'Suitable for dry to very dry skin. Ideal for roughness, flakiness, and long-lasting hydration.', 'Formulated with Cocoa Butter to deeply nourish and improve skin softness, combined with Shea Butter to moisturize and protect the skin barrier. Squalane helps prevent moisture loss and maintain hydration, while Beta-Carotene (Pro-Vitamin A) provides antioxidant benefits and enhances skin smoothness.', 'body-care'),
  ('Crème de Corps Whipped Body Butter', 'cr-me-de-corps-whipped-body-butter', 'A lightweight, whipped body butter that deeply hydrates and softens the skin, leaving it smooth, airy, and non-greasy.

Key Ingredients: Formulated with Shea Butter to deeply nourish and soften the skin, combined with Jojoba Butter to help restore moisture and improve skin smoothness. Squalane helps preve

Best for: Suitable for dry to very dry skin. Ideal for dryness, rough texture, and lack of softness.', 9000, 'Kiehl''s', 'Apply to clean skin after showering. Massage until fully absorbed. Use  twice daily for best results.', 'Suitable for dry to very dry skin. Ideal for dryness, rough texture, and lack of softness.', 'Formulated with Shea Butter to deeply nourish and soften the skin, combined with Jojoba Butter to help restore moisture and improve skin smoothness. Squalane helps preve', 'moisturisers'),
  ('Retinol skin renewing Serum', 'retinol-skin-renewing-serum', 'A gentle daily retinol serum that visibly smooths fine lines, improves skin texture, and enhances radiance with minimal irritation.

Key Ingredients: Formulated with Pure Retinol (Micro-Dosed) to smooth fine lines and improve skin texture, combined with Ceramides to strengthen the skin barrier and reduce irritation. Peptides help improve skin firmness and elasticity, while soothing agents help maintain skin comfort during retinol use.

Best for: Suitable for all skin types, including sensitive skin. Ideal for fine lines, uneven texture, and dullness.', 20500, 'Kiehl''s', 'Apply to clean skin morning or evening. Start once daily and adjust as tolerated. Always follow with moisturizer and SPF during the day.', 'Suitable for all skin types, including sensitive skin. Ideal for fine lines, uneven texture, and dullness.', 'Formulated with Pure Retinol (Micro-Dosed) to smooth fine lines and improve skin texture, combined with Ceramides to strengthen the skin barrier and reduce irritation. Peptides help improve skin firmness and elasticity, while soothing agents help maintain skin comfort during retinol use.', 'masks-treatments'),
  ('Lait-Crème Concentré (Vitamin E Moisturizer)', 'lait-cr-me-concentr-vitamin-e-moisturizer', 'A nourishing multi-purpose cream that hydrates, smooths, and preps the skin, leaving it soft, radiant, and perfectly moisturized

Key Ingredients: Formulated with Shea Butter to deeply nourish and soften the skin, combined with Vitamin E to provide antioxidant protection and support skin repair. Aloe Vera helps soothe and hydrate, while Glycerin attracts and retains moisture for long-lasting hydration.

Best for: Suitable for normal, dry, and sensitive skin. Ideal for dryness, dullness, and makeup prep.', 3500, 'Embryolisse', 'Apply to clean skin morning and/or evening. Can be used as: Moisturizer, Makeup primer, Hydrating mask', 'Suitable for normal, dry, and sensitive skin. Ideal for dryness, dullness, and makeup prep.', 'Formulated with Shea Butter to deeply nourish and soften the skin, combined with Vitamin E to provide antioxidant protection and support skin repair. Aloe Vera helps soothe and hydrate, while Glycerin attracts and retains moisture for long-lasting hydration.', 'moisturisers'),
  ('Avène Cleansing Oil', 'av-ne-cleansing-oil', 'A soothing cleansing oil that gently cleanses while restoring the skin barrier and relieving dryness, leaving the skin soft, calm, and comfortable.

Key Ingredients: Formulated with Avène Thermal Spring Water to soothe and calm irritation, combined with I-modulia® (biotechnology-derived active) to reduce itching and support the skin barrier. Cer-Omega (lipid complex) helps restore and nourish the skin, while Glycerin provides hydration and prevents dryness during cleansing

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, itchy, and irritated skin.', 4800, 'Avène', 'Apply to wet skin and massage gently. Rinse thoroughly and pat dry. Use daily on face and body', 'Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, itchy, and irritated skin.', 'Formulated with Avène Thermal Spring Water to soothe and calm irritation, combined with I-modulia® (biotechnology-derived active) to reduce itching and support the skin barrier. Cer-Omega (lipid complex) helps restore and nourish the skin, while Glycerin provides hydration and prevents dryness during cleansing', 'cleansers'),
  ('cold cream handcream', 'cold-cream-handcream', 'A nourishing hand cream that repairs, protects, and deeply hydrates dry, cracked hands, leaving them soft, smooth, and comfortable.

Key Ingredients: Formulated with Cold Cream (Beeswax + Oils blend) to deeply nourish and protect the skin barrier, combined with Avène Thermal Spring Water to soothe and calm irritation. Glycerin helps attract and retain moisture, while rich emollients soften and repair dry, cracked skin

Best for: Suitable for dry, very dry, and sensitive hands. Ideal for cracked, rough, or damaged skin.', 3000, 'Avène', 'Apply to hands as needed throughout the day. Reapply after washing hands for best results.', 'Suitable for dry, very dry, and sensitive hands. Ideal for cracked, rough, or damaged skin.', 'Formulated with Cold Cream (Beeswax + Oils blend) to deeply nourish and protect the skin barrier, combined with Avène Thermal Spring Water to soothe and calm irritation. Glycerin helps attract and retain moisture, while rich emollients soften and repair dry, cracked skin', 'moisturisers'),
  ('Lipid Replenishing Cream', 'lipid-replenishing-cream', 'A soothing, nourishing cream that restores the skin barrier, relieves dryness, and calms irritation for soft, comfortable skin.

Key Ingredients: Formulated with Avène Thermal Spring Water to soothe and calm irritation, combined with I-modulia® (biotechnology-derived active) to reduce itching and support the skin''s natural defenses. Cer-Omega (lipid complex) helps restore and strengthen the skin barrier, while Glycerin provides long-lasting hydration and prevents dryness.

Best for: Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, itchy, and irritated skin.', 4500, 'Avène', 'Apply to clean, dry skin once or twice daily. Use on face and body.', 'Suitable for dry, very dry, and sensitive skin. Ideal for eczema-prone, itchy, and irritated skin.', 'Formulated with Avène Thermal Spring Water to soothe and calm irritation, combined with I-modulia® (biotechnology-derived active) to reduce itching and support the skin''s natural defenses. Cer-Omega (lipid complex) helps restore and strengthen the skin barrier, while Glycerin provides long-lasting hydration and prevents dryness.', 'moisturisers'),
  ('Uncover Glow Toner', 'uncover-glow-toner', 'A brightening exfoliating toner that gently removes dead skin cells, smooths texture, and enhances radiance for a clearer, more even complexion.

Key Ingredients: Formulated with Alpha Hydroxy Acids (AHAs) to exfoliate dead skin cells and improve skin texture, combined with Niacinamide (Vitamin B3) to brighten and even out skin tone. Glycerin helps maintain hydration, while soothing agents help reduce irritation and support skin comfort.

Best for: Suitable for normal, combination, and oily skin. Ideal for dullness, uneven tone, and rough texture.', 2150, 'Uncover', 'Apply to clean skin using a cotton pad. Use 2–3 times per week in the evening. Do not rinse. Follow with moisturizer and SPF during the day.', 'Suitable for normal, combination, and oily skin. Ideal for dullness, uneven tone, and rough texture.', 'Formulated with Alpha Hydroxy Acids (AHAs) to exfoliate dead skin cells and improve skin texture, combined with Niacinamide (Vitamin B3) to brighten and even out skin tone. Glycerin helps maintain hydration, while soothing agents help reduce irritation and support skin comfort.', 'toners-mists'),
  ('Uncover Spf50+', 'uncover-spf50', 'A lightweight broad-spectrum sunscreen that protects the skin from harmful UV rays while helping to maintain an even, healthy-looking complexion.

Key Ingredients: Formulated with broad-spectrum UV filters (such as Avobenzone, Octocrylene, and other sun filters) to protect against UVA and UVB rays, combined with Niacinamide (Vitamin B3) to help brighten and even out skin tone. Glycerin provides hydration, while lightweight emollients ensure a smooth, non-greasy finish.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for daily sun protection and preventing dark spots', 3200, 'Uncover', 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours, especially after sweating or swimming. Use as the last step in your skincare routine.', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for daily sun protection and preventing dark spots', 'Formulated with broad-spectrum UV filters (such as Avobenzone, Octocrylene, and other sun filters) to protect against UVA and UVB rays, combined with Niacinamide (Vitamin B3) to help brighten and even out skin tone. Glycerin provides hydration, while lightweight emollients ensure a smooth, non-greasy finish.', 'sunscreen'),
  ('Green Tea Blemish Control Serum', 'green-tea-blemish-control-serum', 'A lightweight serum that targets breakouts, controls excess oil, and soothes the skin for a clearer, more balanced complexion.

Key Ingredients: Formulated with Mandelic Acid (AHA) to gently exfoliate the skin surface and improve texture, combined with Salicylic Acid (BHA) to deeply unclog pores and help prevent breakouts. Azelaic Acid helps reduce inflammation, fade blemishes, and even out skin tone. Green Tea Extract soothes the skin and reduces redness, while Niacinamide (Vitamin B3) helps control oil and strengthen the skin barrier. Glycerin provides lightweight hydration without clogging pores

Best for: Suitable for oily, combination, and acne-prone skin. Ideal for breakouts, excess oil, and inflammation.', 3500, 'Uncover', 'Apply to clean skin morning or evening. Use before moisturizer. Follow with SPF during the day.', 'Suitable for oily, combination, and acne-prone skin. Ideal for breakouts, excess oil, and inflammation.', 'Formulated with Mandelic Acid (AHA) to gently exfoliate the skin surface and improve texture, combined with Salicylic Acid (BHA) to deeply unclog pores and help prevent breakouts. Azelaic Acid helps reduce inflammation, fade blemishes, and even out skin tone. Green Tea Extract soothes the skin and reduces redness, while Niacinamide (Vitamin B3) helps control oil and strengthen the skin barrier. Glycerin provides lightweight hydration without clogging pores', 'serums'),
  ('Pimple Patch', 'pimple-patch', 'A targeted spot treatment patch that helps absorb impurities, reduce inflammation, and protect pimples for faster, cleaner healing.

Key Ingredients: Formulated with Hydrocolloid to absorb excess fluid, draw out impurities, and speed up pimple healing, combined with Tea Tree Oil to help reduce bacteria and inflammation. Centella Asiatica (Cica) helps soothe irritation and support skin recovery.

Best for: Suitable for all skin types, especially acne-prone skin. Ideal for whiteheads, active pimples, and inflamed spots', 1100, 'Uncover', 'Apply directly onto clean, dry skin over the pimple. Leave on for 6–8 hours or overnight. Remove and replace if needed.', 'Suitable for all skin types, especially acne-prone skin. Ideal for whiteheads, active pimples, and inflamed spots', 'Formulated with Hydrocolloid to absorb excess fluid, draw out impurities, and speed up pimple healing, combined with Tea Tree Oil to help reduce bacteria and inflammation. Centella Asiatica (Cica) helps soothe irritation and support skin recovery.', 'masks-treatments'),
  ('Lactic Acid  Serum', 'lactic-acid-serum', 'A gentle exfoliating serum that smooths skin texture, brightens dull skin, and improves overall radiance for a clearer, more even complexion.

Key Ingredients: Formulated with Lactic Acid (AHA) to gently exfoliate dead skin cells, smooth texture, and improve skin radiance, combined with Glycerin to help maintain hydration and prevent dryness. Hyaluronic Acid supports moisture retention and plumps the skin, while soothing agents help reduce irritation and support skin comfort.

Best for: Suitable for normal, dry, and combination skin. Ideal for dullness, uneven tone, and rough texture.', 3350, 'Fundamentals', 'Apply to clean, dry skin in the evening. Use 2–3 times per week, then increase as tolerated. Do not rinse. Follow with a moisturizer. Always use SPF during the day', 'Suitable for normal, dry, and combination skin. Ideal for dullness, uneven tone, and rough texture.', 'Formulated with Lactic Acid (AHA) to gently exfoliate dead skin cells, smooth texture, and improve skin radiance, combined with Glycerin to help maintain hydration and prevent dryness. Hyaluronic Acid supports moisture retention and plumps the skin, while soothing agents help reduce irritation and support skin comfort.', 'masks-treatments'),
  ('0.03%Retinol Water Serum', '0-03-retinol-water-serum', 'A lightweight retinol serum that helps smooth fine lines, improve skin texture, and boost overall radiance for clearer, more youthful-looking skin.

Key Ingredients: Formulated with Retinol (Vitamin A derivative) to improve skin texture, reduce fine lines, and promote cell turnover, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance skin clarity. Hyaluronic Acid helps retain moisture and reduce dryness, while Glycerin provides additional hydration for balanced, comfortable skin.

Best for: Suitable for normal, combination, and oily skin. Ideal for fine lines, uneven texture, acne, and dullness.', 3350, 'Fundamentals', 'Apply to clean, dry skin in the evening only. Start 2–3 times per week, then increase as tolerated. Follow with a moisturizer. Always use SPF during the day.', 'Suitable for normal, combination, and oily skin. Ideal for fine lines, uneven texture, acne, and dullness.', 'Formulated with Retinol (Vitamin A derivative) to improve skin texture, reduce fine lines, and promote cell turnover, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance skin clarity. Hyaluronic Acid helps retain moisture and reduce dryness, while Glycerin provides additional hydration for balanced, comfortable skin.', 'masks-treatments'),
  ('7%Polyhydroxy Tonic', '7-polyhydroxy-tonic', 'A gentle exfoliating toner that hydrates while refining skin texture, helping to improve radiance and smoothness without irritating the skin

Key Ingredients: Formulated with Polyhydroxy Acids (PHAs) to gently exfoliate dead skin cells while attracting moisture to the skin, combined with Glycerin to hydrate and support the skin barrier. Niacinamide (Vitamin B3) helps improve skin tone and strengthen the skin, while soothing agents help maintain comfort and reduce irritation.

Best for: Suitable for all skin types, especially sensitive skin. Ideal for dullness, rough texture, and mild uneven tone.', 3350, 'Fundamentals', 'Apply to clean skin using a cotton pad or hands. Use once daily, preferably in the evening. Do not rinse. Follow with moisturizer and use SPF during the day.', 'Suitable for all skin types, especially sensitive skin. Ideal for dullness, rough texture, and mild uneven tone.', 'Formulated with Polyhydroxy Acids (PHAs) to gently exfoliate dead skin cells while attracting moisture to the skin, combined with Glycerin to hydrate and support the skin barrier. Niacinamide (Vitamin B3) helps improve skin tone and strengthen the skin, while soothing agents help maintain comfort and reduce irritation.', 'toners-mists'),
  ('5% Glycolic serum', '5-glycolic-serum', 'A resurfacing serum that gently exfoliates, smooths skin texture, and brightens the complexion for a clearer, more radiant look.

Key Ingredients: Formulated with 5% Glycolic Acid (AHA) to exfoliate dead skin cells, improve texture, and enhance skin radiance, combined with Glycerin to help maintain hydration and prevent dryness. Hyaluronic Acid supports moisture retention and plumps the skin, while soothing agents help reduce irritation and support skin comfort.

Best for: Suitable for normal, combination, and oily skin. Ideal for dullness, uneven tone, and rough texture. PS:Use with caution on sensitive skin.', 3350, 'Fundamentals', 'Apply to clean, dry skin in the evening. Use 2–3 times per week, then increase as tolerated. Do not rinse. Follow with moisturizer. Always use SPF during the day.', 'Suitable for normal, combination, and oily skin. Ideal for dullness, uneven tone, and rough texture. PS:Use with caution on sensitive skin.', 'Formulated with 5% Glycolic Acid (AHA) to exfoliate dead skin cells, improve texture, and enhance skin radiance, combined with Glycerin to help maintain hydration and prevent dryness. Hyaluronic Acid supports moisture retention and plumps the skin, while soothing agents help reduce irritation and support skin comfort.', 'serums'),
  ('Gentle Face Wash', 'gentle-face-wash', 'A mild, refreshing cleanser that gently removes impurities while soothing and hydrating the skin for a clean, soft, and balanced feel.

Key Ingredients: Formulated with Aloe Vera (Aloe Barbadensis Leaf Extract) to soothe, hydrate, and calm the skin, combined with Glycerin to help maintain moisture balance. Cucumber Extract refreshes and cools the skin, while gentle cleansing agents remove dirt and impurities without stripping the skin.

Best for: Suitable for all skin types, including sensitive skin. Ideal for daily cleansing without dryness or irritation.', 3380, 'Aloe Unique', 'Apply to wet face and gently massage. Rinse thoroughly with water. Use morning and evening.', 'Suitable for all skin types, including sensitive skin. Ideal for daily cleansing without dryness or irritation.', 'Formulated with Aloe Vera (Aloe Barbadensis Leaf Extract) to soothe, hydrate, and calm the skin, combined with Glycerin to help maintain moisture balance. Cucumber Extract refreshes and cools the skin, while gentle cleansing agents remove dirt and impurities without stripping the skin.', 'cleansers'),
  ('Everyday Facial Lotion', 'everyday-facial-lotion', 'A lightweight daily moisturizer that hydrates, soothes, and helps maintain a balanced, healthy-looking complexion.

Key Ingredients: Formulated with Aloe Vera (Aloe Barbadensis Leaf Extract) to soothe, hydrate, and calm the skin, combined with Glycerin to help attract and retain moisture. Vitamin E provides antioxidant protection and supports skin health, while lightweight emollients help soften and maintain the skin barrier.

Best for: Suitable for normal, combination, and sensitive skin. Ideal for daily hydration and maintaining skin balance', 3050, 'Aloe Unique', 'Apply to clean skin morning and evening. Use after cleansing and toning. Follow with SPF during the day.', 'Suitable for normal, combination, and sensitive skin. Ideal for daily hydration and maintaining skin balance', 'Formulated with Aloe Vera (Aloe Barbadensis Leaf Extract) to soothe, hydrate, and calm the skin, combined with Glycerin to help attract and retain moisture. Vitamin E provides antioxidant protection and supports skin health, while lightweight emollients help soften and maintain the skin barrier.', 'moisturisers'),
  ('Bakuchiol Serum', 'bakuchiol-serum', 'A gentle, plant-based alternative to retinol that helps smooth fine lines, improve skin texture, and enhance radiance without irritation.

Key Ingredients: Formulated with Bakuchiol to help improve skin texture, smooth fine lines, and support collagen production, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance skin clarity. Hyaluronic Acid helps retain moisture and plump the skin, while Glycerin provides hydration for a soft, balanced feel.

Best for: Suitable for all skin types, including sensitive skin. Ideal for fine lines, uneven texture, and dullness.', 3350, 'Fundamentals', 'Apply to clean skin morning and/or evening. Use before moisturizer. Follow with SPF during the day.', 'Suitable for all skin types, including sensitive skin. Ideal for fine lines, uneven texture, and dullness.', 'Formulated with Bakuchiol to help improve skin texture, smooth fine lines, and support collagen production, combined with Niacinamide (Vitamin B3) to strengthen the skin barrier and enhance skin clarity. Hyaluronic Acid helps retain moisture and plump the skin, while Glycerin provides hydration for a soft, balanced feel.', 'serums'),
  ('Age defying eye and lip cream', 'age-defying-eye-and-lip-cream', 'A gentle anti-aging cream designed to hydrate, smooth fine lines, and improve the appearance of delicate skin around the eyes and lips.

Key Ingredients: Formulated with Aloe Vera (Aloe Barbadensis Leaf Extract) to soothe and hydrate delicate skin, combined with Vitamin E to provide antioxidant protection and support skin repair. Peptides help improve skin firmness and reduce the appearance of fine lines, while Glycerin helps retain moisture and keep the skin soft and smooth.

Best for: Suitable for all skin types, including sensitive skin. Ideal for fine lines, dryness, and early signs of aging around the eyes and lips.', 3470, 'Aloe Unique', 'Apply a small amount around the eye and lip area. Gently pat until absorbed. Use morning and evening.', 'Suitable for all skin types, including sensitive skin. Ideal for fine lines, dryness, and early signs of aging around the eyes and lips.', 'Formulated with Aloe Vera (Aloe Barbadensis Leaf Extract) to soothe and hydrate delicate skin, combined with Vitamin E to provide antioxidant protection and support skin repair. Peptides help improve skin firmness and reduce the appearance of fine lines, while Glycerin helps retain moisture and keep the skin soft and smooth.', 'moisturisers'),
  ('5% Azelaic Hello Glow Foaming Cleanser', '5-azelaic-hello-glow-foaming-cleanser', 'A gentle foaming cleanser that helps brighten the skin, reduce blemishes, and improve overall clarity while cleansing.

Key Ingredients: Formulated with 5% Azelaic Acid to help reduce acne, calm inflammation, and brighten uneven skin tone, combined with Niacinamide (Vitamin B3) to control oil and improve skin clarity. Glycerin helps maintain hydration, while gentle foaming agents cleanse without stripping the skin.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for blemishes, uneven tone, and dull skin.', 2000, 'Sun Kissed', 'Apply to wet skin and massage gently. Rinse thoroughly with water. Use morning and evening', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for blemishes, uneven tone, and dull skin.', 'Formulated with 5% Azelaic Acid to help reduce acne, calm inflammation, and brighten uneven skin tone, combined with Niacinamide (Vitamin B3) to control oil and improve skin clarity. Glycerin helps maintain hydration, while gentle foaming agents cleanse without stripping the skin.', 'cleansers'),
  ('Hydragel Moisturizer', 'hydragel-moisturizer', 'A lightweight gel moisturizer that delivers intense hydration while keeping the skin fresh, smooth, and non-greasy.

Key Ingredients: Formulated with Hyaluronic Acid to deeply hydrate and retain moisture in the skin, combined with Niacinamide (Vitamin B3) to help balance oil production and improve skin texture. Glycerin attracts moisture, while lightweight gel-based humectants provide hydration without clogging pores or leaving a heavy feel.

Best for: Formulated with broad-spectrum UV filters (such as Avobenzone, Octocrylene, and other sun filters) to protect against UVA and UVB rays, combined with Niacinamide (Vitamin B3) to help improve skin tone and support the skin barrier. Glycerin provides hydration, while lightweight emollients ensure a smooth, non-greasy finish.', 2000, 'Sun Kissed', 'Apply to clean skin morning and evening. Use after serum. Follow with SPF during the day.', 'Formulated with broad-spectrum UV filters (such as Avobenzone, Octocrylene, and other sun filters) to protect against UVA and UVB rays, combined with Niacinamide (Vitamin B3) to help improve skin tone and support the skin barrier. Glycerin provides hydration, while lightweight emollients ensure a smooth, non-greasy finish.', 'Formulated with Hyaluronic Acid to deeply hydrate and retain moisture in the skin, combined with Niacinamide (Vitamin B3) to help balance oil production and improve skin texture. Glycerin attracts moisture, while lightweight gel-based humectants provide hydration without clogging pores or leaving a heavy feel.', 'moisturisers'),
  ('Sunkissed Sunscreen Spf50+', 'sunkissed-sunscreen-spf50', 'A lightweight, broad-spectrum sunscreen that protects the skin from harmful UV rays while helping maintain a smooth, even complexion.

Best for: Suitable for all skin types, including oily and acne-prone skin. Ideal for daily sun protection and preventing dark spots.', 2450, 'Sun Kissed', 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours, especially after sweating or swimming. Use as the last step in your skincare routine.', 'Suitable for all skin types, including oily and acne-prone skin. Ideal for daily sun protection and preventing dark spots.', '', 'sunscreen'),
  ('Hypochlorous Acid spray', 'hypochlorous-acid-spray', 'A soothing antibacterial mist that helps calm irritation, reduce acne-causing bacteria, and support faster skin recovery.

Key Ingredients: Formulated with Hypochlorous Acid (HOCl) to help reduce acne-causing bacteria and calm inflammation, combined with Electrolyzed Water and Sodium Chloride to support skin healing and maintain a balanced, soothing environment.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for breakouts, irritation, redness, and post-treatment care.', 3300, 'Medicube', 'Spray directly onto clean skin. Allow to air dry or gently pat in. Use morning, evening, or throughout the day as needed.', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for breakouts, irritation, redness, and post-treatment care.', 'Formulated with Hypochlorous Acid (HOCl) to help reduce acne-causing bacteria and calm inflammation, combined with Electrolyzed Water and Sodium Chloride to support skin healing and maintain a balanced, soothing environment.', 'masks-treatments'),
  ('Azelaic Acid +Niacinimide Serum', 'azelaic-acid-niacinimide-serum', 'A clarifying serum that helps reduce acne, calm inflammation, and improve uneven skin tone for a clearer, smoother complexion

Key Ingredients: Formulated with Azelaic Acid to reduce acne, calm inflammation, and brighten uneven skin tone, combined with Niacinamide (Vitamin B3) to regulate oil production and strengthen the skin barrier. Hyaluronic Acid helps maintain hydration, while Glycerin supports moisture balance for comfortable, non-drying wear.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for acne, redness, dark spots, and uneven tone', 3200, 'Medicube', 'Apply to clean skin morning and/or evening. Use before moisturizer. Follow with SPF during the day.', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for acne, redness, dark spots, and uneven tone', 'Formulated with Azelaic Acid to reduce acne, calm inflammation, and brighten uneven skin tone, combined with Niacinamide (Vitamin B3) to regulate oil production and strengthen the skin barrier. Hyaluronic Acid helps maintain hydration, while Glycerin supports moisture balance for comfortable, non-drying wear.', 'serums'),
  ('Azelaic Acid +Niacinimide foaming cleanser', 'azelaic-acid-niacinimide-foaming-cleanser', 'A gentle treatment cleanser that helps clear pores, reduce breakouts, and improve skin tone while effectively cleansing the skin.

Key Ingredients: Formulated with Azelaic Acid to help reduce acne, calm inflammation, and brighten uneven skin tone, combined with Niacinamide (Vitamin B3) to regulate oil production and improve skin clarity. Glycerin helps maintain hydration, while gentle foaming agents cleanse without stripping the skin.

Best for: Suitable for all skin types, including sensitive and acne-prone skin. Ideal for acne, redness, and uneven skin tone.', 2500, 'Medicube', 'Apply to wet skin and massage gently. Rinse thoroughly with water. Use morning and evening.', 'Suitable for all skin types, including sensitive and acne-prone skin. Ideal for acne, redness, and uneven skin tone.', 'Formulated with Azelaic Acid to help reduce acne, calm inflammation, and brighten uneven skin tone, combined with Niacinamide (Vitamin B3) to regulate oil production and improve skin clarity. Glycerin helps maintain hydration, while gentle foaming agents cleanse without stripping the skin.', 'cleansers'),
  ('15% TXA Tranexamic Acid Serum', '15-txa-tranexamic-acid-serum', 'A powerful brightening serum that targets dark spots, hyperpigmentation, and uneven skin tone for a more luminous, even complexion.

Key Ingredients: Formulated with 15% Tranexamic Acid to reduce melanin production and target dark spots, combined with Niacinamide (Vitamin B3) to brighten and strengthen the skin barrier. Hyaluronic Acid provides hydration and plumps the skin, while Glycerin supports moisture balance for optimal skin comfort.

Best for: Suitable for all skin types, including sensitive skin. Ideal for dark spots, melasma, post-acne marks, and uneven tone.', 6500, 'Medicube', 'Apply to clean, dry skin morning and/or evening. Use a few drops and pat gently into the skin. Follow with moisturizer and daily sunscreen.', 'Suitable for all skin types, including sensitive skin. Ideal for dark spots, melasma, post-acne marks, and uneven tone.', 'Formulated with 15% Tranexamic Acid to reduce melanin production and target dark spots, combined with Niacinamide (Vitamin B3) to brighten and strengthen the skin barrier. Hyaluronic Acid provides hydration and plumps the skin, while Glycerin supports moisture balance for optimal skin comfort.', 'masks-treatments')
)

INSERT INTO public.products
  (name, slug, description, price, brand, images, stock, low_stock_threshold, is_active, usage_instructions, category_id)
SELECT
  np.name,
  np.slug,
  np.description,
  np.price,
  np.brand,
  ARRAY[]::text[],
  20,
  5,
  true,
  np.usage_instructions,
  c.id
FROM new_products np
JOIN public.categories c ON c.slug = np.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- ─── Service–Product Links ────────────────────────────────────────────────
-- Links products to related services so they appear on treatment pages.

INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'mandelic-clarifying-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'repair-exfoliating-wash-mousse-exfoliante-nettoyante'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'post-acne-mark-correcting-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'targeted-clalrifying-gel-gel-anti-obstruction'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'targeted-clalrifying-gel-gel-anti-obstruction'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'targeted-clalrifying-gel-gel-anti-obstruction'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'targeted-clalrifying-gel-gel-anti-obstruction'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'bionic-face-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'potent-retinol-complex'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'potent-retinol-complex'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'potent-retinol-complex'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'potent-retinol-complex'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'potent-retinol-complex'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'potent-retinol-complex'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-anti-age-facial' AND p.slug = 'rebound-sculpting-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'rebound-sculpting-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'rebound-sculpting-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'age-defying-retinol-peel' AND p.slug = 'rebound-sculpting-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-regeneration-face-neck' AND p.slug = 'rebound-sculpting-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'rebound-sculpting-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'triple-firming-neck-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'triple-firming-neck-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'triple-firming-neck-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'illuminating-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'enlighten-15-vitamin-c-pha-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'enlighten-pigment-controller-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'enlighten-pigment-controller-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'enlighten-pigment-controller-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'enlighten-pigment-controller-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'enlighten-pigment-controller-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'enlighten-pigment-controller-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'enlighten-pigment-lightening-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'enlighten-pigment-lightening-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'enlighten-pigment-lightening-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'enlighten-pigment-lightening-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'enlighten-dark-spot-corrector'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'enlighten-dark-spot-corrector'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'enlighten-dark-spot-corrector'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'enlighten-dark-spot-corrector'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'enlighten-ultra-brightening-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'enlighten-ultra-brightening-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'enlighten-ultra-brightening-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'enlighten-ultra-brightening-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'smooth-surface-glycolic-peel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'smooth-surface-glycolic-peel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'smooth-surface-glycolic-peel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '10-glycolic-renewal-smoothing-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = '10-glycolic-renewal-smoothing-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '10-glycolic-renewal-smoothing-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '10-glycolic-renewal-smoothing-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '10-glycolic-renewal-smoothing-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '10-glycolic-renewal-smoothing-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '15-glycolic-lotion-plus'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = '15-glycolic-lotion-plus'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '15-glycolic-lotion-plus'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '15-glycolic-lotion-plus'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '15-glycolic-lotion-plus'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '15-glycolic-lotion-plus'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'restore-hyaluronic-acid-biocellulose-mask'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'restore-hyaluronic-acid-biocellulose-mask'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'restore-hyaluronic-acid-biocellulose-mask'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'mela-anti-dark-spot-gentle-peeling-night-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'hydra-moisturizing-radiance-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'cica-soothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'cica-soothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'cica-soothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydra-protective-day-cream-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydra-protective-day-cream-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydra-protective-day-cream-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-anti-age-facial' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'age-defying-retinol-peel' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-regeneration-face-neck' AND p.slug = 'anti-age-global-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'ac-control-purifying-mask'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'ac-control-purifying-mask'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'ac-control-purifying-mask'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydra-gentle-cleansing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydra-gentle-cleansing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydra-gentle-cleansing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'da-protect-emmolient-balm'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'da-protect-emmolient-balm'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'da-protect-emmolient-balm'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'ultra-hydrant-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'ultra-hydrant-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'ultra-hydrant-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'mela-unifying-ultra-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'mela-unifying-ultra-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'mela-unifying-ultra-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'mela-unifying-ultra-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'mela-unifying-ultra-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'dermo-specific-ur-10'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'dermo-specific-ur-10'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'dermo-specific-ur-10'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'dermo-specific-ur-10'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'dermo-specific-ur-10'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'dermo-specific-ur-10'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'dermo-specific-ur-30'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'dermo-specific-ur-30'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'dermo-specific-ur-30'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'dermo-specific-ur-30'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'dermo-specific-ur-30'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'dermo-specific-ur-30'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'baby-ultra-hydrating-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'baby-ultra-hydrating-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'baby-ultra-hydrating-moisturizing-milk'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'mela-unifying-exfoliating-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'mela-unifying-exfoliating-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'mela-unifying-exfoliating-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'mela-unifying-exfoliating-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'ultra-hydrant-shower-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'ultra-hydrant-shower-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'ultra-hydrant-shower-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'ultra-hydratant-shower-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'ultra-hydratant-shower-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'ultra-hydratant-shower-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'atoderm-huile-de-douche'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'atoderm-huile-de-douche'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'atoderm-huile-de-douche'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'sensibio-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'sensibio-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'sensibio-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 's-bium-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 's-bium-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 's-bium-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 's-bium-gel-moussant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 's-bium-gel-moussant-actif'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 's-bium-gel-moussant-actif'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 's-bium-gel-moussant-actif'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 's-bium-gel-moussant-actif'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'sebium-hydra-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'sebium-hydra-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'sebium-hydra-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'sebium-hydra-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'sebium-hydra-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'sebium-hydra-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'pigmentbio-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'atoderm-intensive-pain-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'atoderm-intensive-pain-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'atoderm-intensive-pain-bar'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'atoderm-shower-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'atoderm-shower-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'atoderm-shower-gel'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'sensibio-ar-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'sensibio-ar-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'sensibio-ar-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'cicabio-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'cicabio-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'cicabio-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 's-bium-kerato'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 's-bium-hydra'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 's-bium-hydra'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 's-bium-hydra'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 's-bium-hydra'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 's-bium-hydra'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 's-bium-hydra'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'atoderm-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'atoderm-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'atoderm-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'atoderm-intensive-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'atoderm-intensive-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'atoderm-intensive-cr-me'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'cicabio-cr-me-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'photoderm-xdefense-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'photoderm-xdefense-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'photoderm-xdefense-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'photoderm-aquafluid-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'photoderm-aquafluid-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'photoderm-aquafluid-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'pigmentbio-daily-care-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'pigmentbio-daily-care-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'pigmentbio-daily-care-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'pigmentbio-daily-care-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'pigmentbio-c-concentrate'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'pigmentbio-c-concentrate'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'pigmentbio-c-concentrate'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'pigmentbio-c-concentrate'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'pigmentbio-night-renewer-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'pigmentbio-night-renewer-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'pigmentbio-night-renewer-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'pigmentbio-night-renewer-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'pigmentbio-sensitive-areas'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'pigmentbio-sensitive-areas'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'pigmentbio-sensitive-areas'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'pigmentbio-sensitive-areas'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'pigmentbio-sensitive-areas'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'nod-ds-shampooing'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'nod-ds-shampooing'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'nod-ds-shampooing'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'effaclar-purifying-foaming-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'effaclar-purifying-foaming-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'effaclar-purifying-foaming-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'effaclar-micro-peeling-purifying-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'effaclar-micro-peeling-purifying-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'effaclar-micro-peeling-purifying-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'effaclar-micro-peeling-purifying-gel-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'anthelios-spf-50-invisible-fluid-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'anthelios-spf-50-invisible-fluid-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'anthelios-spf-50-invisible-fluid-spf-50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'anthelios-invisible-spray-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'anthelios-invisible-spray-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'anthelios-invisible-spray-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'serozinc-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'serozinc-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'serozinc-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydrating-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydrating-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydrating-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'skin-renewing-vitamin-c-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'skin-renewing-vitamin-c-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'skin-renewing-vitamin-c-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'skin-renewing-vitamin-c-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'skin-renewing-vitamin-c-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'skin-renewing-vitamin-c-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'skin-renewing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'skin-renewing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'skin-renewing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'skin-renewing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'skin-resurfacing-retinol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'sa-smothing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '2-bha-liquid-exfoliant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = '2-bha-liquid-exfoliant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '2-bha-liquid-exfoliant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '2-bha-liquid-exfoliant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '2-bha-liquid-exfoliant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '2-bha-liquid-exfoliant'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'glycolic-7-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'glycolic-7-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'glycolic-7-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'glycolic-7-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'glycolic-7-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'glycolic-7-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'azelaic-10-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brow-lamination' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'lash-extensions' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'lash-lift' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'scalp-analysis' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'lash-brow-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'squalane-amino-acids-lip-balm'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'squalane-amino-acids-lip-balm'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'squalane-amino-acids-lip-balm'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'x-mose-hydrating-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'x-mose-hydrating-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'x-mose-hydrating-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'x-mose-cleansing-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'x-mose-cleansing-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'x-mose-cleansing-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'oil-free-acne-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'oil-free-acne-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'oil-free-acne-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'fresh-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'fresh-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'fresh-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'alcohol-free-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'alcohol-free-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'alcohol-free-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'hydroboost-hydratig-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydroboost-gel-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydroboost-gel-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydroboost-gel-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'body-sunscreen-spf'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'body-sunscreen-spf'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'daily-hydration-spf-15'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'daily-hydration-spf-15'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'daily-hydration-spf-15'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'roughness-relief-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'roughness-relief-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'roughness-relief-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'roughness-relief-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'roughness-relief-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'roughness-relief-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'intensive-repair-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'intensive-repair-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'intensive-repair-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'intensive-repair-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'intensive-repair-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'intensive-repair-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'vitamin-c-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'vitamin-c-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'vitamin-c-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'vitamin-c-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'vitamin-c-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'vitamin-c-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'aloe-liquid-soap'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'aloe-liquid-soap'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'aloe-liquid-soap'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'aloe-propolis-creme'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'aloe-propolis-creme'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'aloe-propolis-creme'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hyaluronic-acid-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hyaluronic-acid-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hyaluronic-acid-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'retinol-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'retinol-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'retinol-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'vitamin-c-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'vitamin-c-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'collagen-peptide-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'collagen-peptide-moisturizing-body-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hyaluronic-acid-moisturizing-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hyaluronic-acid-moisturizing-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hyaluronic-acid-moisturizing-body-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'age-renew-retinol-overnight-body-face-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'age-renew-retinol-overnight-body-face-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'age-renew-retinol-overnight-body-face-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'cetaphil-moisturizing-cream-face-body'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'cetaphil-moisturizing-cream-face-body'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'cetaphil-moisturizing-cream-face-body'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'kiehl-s-ultra-facial-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'kiehl-s-ultra-facial-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'kiehl-s-ultra-facial-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'creme-de-corps'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'creme-de-corps'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'creme-de-corps'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'retinol-skin-renewing-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'retinol-skin-renewing-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'retinol-skin-renewing-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'lait-cr-me-concentr-vitamin-e-moisturizer'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'lait-cr-me-concentr-vitamin-e-moisturizer'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'lait-cr-me-concentr-vitamin-e-moisturizer'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'av-ne-cleansing-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'av-ne-cleansing-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'av-ne-cleansing-oil'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'lipid-replenishing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'lipid-replenishing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'lipid-replenishing-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'uncover-glow-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'uncover-glow-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'uncover-glow-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'uncover-glow-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'uncover-glow-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'uncover-glow-toner'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'uncover-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'green-tea-blemish-control-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'pimple-patch'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'pimple-patch'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'pimple-patch'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'lactic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '0-03-retinol-water-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '7-polyhydroxy-tonic'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = '7-polyhydroxy-tonic'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '7-polyhydroxy-tonic'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '7-polyhydroxy-tonic'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '7-polyhydroxy-tonic'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '7-polyhydroxy-tonic'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '5-glycolic-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'gentle-face-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'gentle-face-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'gentle-face-wash'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'everyday-facial-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'everyday-facial-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'everyday-facial-lotion'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'bakuchiol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'bakuchiol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'bakuchiol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'bakuchiol-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'age-defying-eye-and-lip-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'age-defying-eye-and-lip-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'age-defying-eye-and-lip-cream'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '5-azelaic-hello-glow-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = '5-azelaic-hello-glow-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '5-azelaic-hello-glow-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '5-azelaic-hello-glow-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '5-azelaic-hello-glow-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '5-azelaic-hello-glow-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'hydragel-moisturizer'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'hydragel-moisturizer'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'hydragel-moisturizer'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'sunkissed-sunscreen-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'sunkissed-sunscreen-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'sunkissed-sunscreen-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'sunkissed-sunscreen-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'sunkissed-sunscreen-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'sunkissed-sunscreen-spf50'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'hypochlorous-acid-spray'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'hypochlorous-acid-spray'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'hypochlorous-acid-spray'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'azelaic-acid-niacinimide-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = 'azelaic-acid-niacinimide-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = 'azelaic-acid-niacinimide-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = 'azelaic-acid-niacinimide-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = 'azelaic-acid-niacinimide-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = 'azelaic-acid-niacinimide-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = 'azelaic-acid-niacinimide-foaming-cleanser'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'revitalizing-peel' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-peel' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'microneedling-with-concentrate' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'brightening-facial' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'skin-soothing-facial' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'hydrafacial' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'premier-signature-facial' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;
INSERT INTO public.service_products (service_id, product_id)
SELECT s.id, p.id
FROM public.services s, public.products p
WHERE s.slug = 'clarifying-peel' AND p.slug = '15-txa-tranexamic-acid-serum'
ON CONFLICT DO NOTHING;