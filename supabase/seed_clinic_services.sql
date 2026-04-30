-- Premier Beauty Clinic - Official Services Seed
-- Source: Premier Beauty Clinic official service menu
-- Run in Supabase SQL Editor
--
-- STEP 1: Remove old placeholder/dummy services (run this block first)
-- STEP 2: Insert official services (each INSERT block runs independently)
-- -----------------------------------------------------------------------

-- -----------------------------------------------------------------------
-- STEP 1 - Clean up old services
-- -----------------------------------------------------------------------

DELETE FROM public.service_products;
DELETE FROM public.reviews WHERE service_id IS NOT NULL;

DO $$
BEGIN
  UPDATE public.appointments SET service_id = NULL WHERE service_id IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  UPDATE public.walk_ins SET service_id = NULL WHERE service_id IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DELETE FROM public.services;


-- -----------------------------------------------------------------------
-- STEP 2 - IMAGING & CONSULTATION
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Consultation & AI Skin Analysis',
  'consultation-ai-skin-analysis',
  'A comprehensive assessment that combines an in-depth consultation involving a review of concerns and medical history alongside a professional evaluation of the skin type, condition and key skin parameters.',
  2500, 0, 60, ARRAY[]::text[], 'Imaging & Consultation', true,
  '[{"name":"skin_concerns","label":"Primary skin concerns","type":"multiselect","options":["Acne / Breakouts","Hyperpigmentation / Dark Spots","Dryness / Dehydration","Ageing / Fine Lines","Sensitivity / Redness","Uneven Texture","Oiliness","Other"],"required":true},{"name":"medical_history","label":"Any relevant medical history or conditions?","type":"textarea","required":false},{"name":"current_medications","label":"Are you currently on any medications?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or ingredient sensitivities","type":"text","required":false},{"name":"previous_treatments","label":"Previous skin treatments received","type":"textarea","required":false}]'::jsonb,
  ARRAY['Comprehensive skin assessment','Personalised treatment recommendations','AI-assisted skin analysis','Review of medical history and concerns']::text[],
  'Tailored treatment plan designed specifically for your skin'
),

(
  'Dermatologist Consultation',
  'dermatologist-consultation',
  'A medical assessment conducted by a Dermatologist to evaluate skin concerns, establish diagnosis and recommend appropriate treatment options.',
  5000, 0, 60, ARRAY[]::text[], 'Imaging & Consultation', true,
  '[{"name":"main_concern","label":"Main reason for consultation","type":"textarea","required":true},{"name":"symptoms","label":"Describe your skin symptoms","type":"textarea","required":true},{"name":"duration","label":"How long have you had this concern?","type":"select","options":["Less than 1 month","1-3 months","3-6 months","6-12 months","More than 1 year"],"required":true},{"name":"current_medications","label":"Current medications (prescription and over-the-counter)","type":"textarea","required":false},{"name":"known_allergies","label":"Known allergies","type":"text","required":false},{"name":"family_history","label":"Relevant family history of skin conditions","type":"text","required":false}]'::jsonb,
  ARRAY['Expert medical diagnosis','Prescription options when needed','Evidence-based treatment plan','Specialist referral if required']::text[],
  NULL
),

(
  'Scalp Analysis',
  'scalp-analysis',
  'A thorough examination of the scalp and hair condition to assess concerns such as dryness, oil imbalance, dandruff, hair thinning or scalp sensitivity.',
  2500, 0, 60, ARRAY[]::text[], 'Imaging & Consultation', true,
  '[{"name":"scalp_concern","label":"Primary scalp or hair concern","type":"multiselect","options":["Hair Thinning / Hair Loss","Dandruff / Flaking","Dry Scalp","Oily Scalp","Itching / Irritation","Scalp Sensitivity","Hair Breakage"],"required":true},{"name":"concern_duration","label":"How long have you experienced this concern?","type":"select","options":["Less than 1 month","1-3 months","3-6 months","Over 6 months"],"required":true},{"name":"current_products","label":"Hair products currently in use","type":"textarea","required":false},{"name":"current_medications","label":"Are you on any medications?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Detailed scalp and hair health evaluation','Identifies root causes of hair concerns','Personalised hair care recommendations']::text[],
  NULL
),

(
  'Dermatoscopy',
  'dermatoscopy',
  'A non-invasive diagnostic procedure using a dermatoscope to closely examine skin lesions, vascular patterns, and other structures not visible to the naked eye.',
  3500, 0, 60, ARRAY[]::text[], 'Imaging & Consultation', true,
  '[{"name":"lesion_description","label":"Describe the skin lesion(s) of concern","type":"textarea","required":true},{"name":"lesion_duration","label":"How long have you had this lesion?","type":"select","options":["Less than 1 month","1-6 months","6 months - 1 year","More than 1 year"],"required":true},{"name":"changes_observed","label":"Have you noticed changes in size, colour, or shape?","type":"radio","options":["Yes","No","Not sure"],"required":true},{"name":"family_history","label":"Family history of melanoma or skin cancer?","type":"radio","options":["Yes","No","Unknown"],"required":true}]'::jsonb,
  ARRAY['Non-invasive examination','Detailed analysis of skin lesions','Early detection support','Professional dermoscopic assessment']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 3 - FACIAL TREATMENTS
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Hydrafacial',
  'hydrafacial',
  'Gentle treatment that deep cleanses, exfoliates, extracts the pores and hydrates the skin using serum infusion technology to improve skin glow, reduce congestion and refresh dull or oily skin with no downtime.',
  15000, 0, 60, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Primary skin concerns","type":"multiselect","options":["Dullness","Congestion / Large Pores","Dryness / Dehydration","Hyperpigmentation","Uneven Texture","Oiliness"],"required":true},{"name":"known_allergies","label":"Known allergies or ingredient sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Deep pore cleansing and extraction','Intense hydration with serum infusion','Instant skin glow with no downtime','Reduces congestion and dullness','Suitable for all skin types']::text[],
  'Visibly clearer, hydrated and radiant skin - immediately after treatment'
),

(
  'Premier Signature Facial',
  'premier-signature-facial',
  'Deep cleansing treatment that removes impurities for a clean, balanced and refreshed skin.',
  8500, 0, 45, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Primary skin concerns","type":"multiselect","options":["Acne / Breakouts","Congestion","Dryness","Dullness","Uneven Texture","Sensitivity"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Deep cleansing of pores','Removes surface impurities','Balanced and refreshed skin','Suitable for first-time clients']::text[],
  NULL
),

(
  'Brightening Facial',
  'brightening-facial',
  'Enhances product absorption and evens out skin tone with brightening ingredients and boosts radiance.',
  8500, 0, 60, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Primary concerns","type":"multiselect","options":["Hyperpigmentation","Dullness","Uneven Skin Tone","Sun Damage","Dark Spots"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Evens out skin tone','Boosts radiance and glow','Targets hyperpigmentation','Enhances product absorption']::text[],
  NULL
),

(
  'Premier Anti-Age Facial',
  'premier-anti-age-facial',
  'Firming facial using collagen-boosting serums and facial massage. Includes neck and decollete.',
  15000, 0, 50, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Anti-aging concerns","type":"multiselect","options":["Fine Lines","Deep Wrinkles","Loss of Firmness / Sagging","Dullness","Neck and Decollete Aging","Age Spots"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Firms and lifts skin','Reduces fine lines and wrinkles','Collagen-boosting treatment','Includes neck and decollete','Advanced facial massage techniques']::text[],
  NULL
),

(
  'Skin Soothing Facial',
  'skin-soothing-facial',
  'Gentle treatment that reduces irritation, calms the skin and boosts moisture balance for radiance.',
  7500, 0, 45, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Skin sensitivities or concerns","type":"multiselect","options":["Redness / Rosacea","Sensitivity","Dehydration","Irritation","Reactive Skin","Eczema-Prone"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Calms and soothes irritated skin','Reduces redness and inflammation','Restores moisture balance','Gentle enough for sensitive skin']::text[],
  NULL
),

(
  'Express Facial',
  'express-facial',
  'A quick yet effective treatment that deeply cleanses, exfoliates and hydrates the skin.',
  5000, 0, 30, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Quick and effective','Deep cleansing','Exfoliation and hydration','Perfect for maintenance']::text[],
  NULL
),

(
  'Bridal Facial',
  'bridal-facial',
  'A luxurious radiance boosting treatment that unveils a luminous camera-ready complexion. Deeply hydrates, firms and brightens the face, neck and decollete.',
  18000, 0, 90, ARRAY[]::text[], 'Facial Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Skin concerns to address","type":"multiselect","options":["Dullness","Hyperpigmentation","Dehydration","Fine Lines","Uneven Texture","Dark Spots"],"required":true},{"name":"event_date","label":"Event / Wedding date","type":"date","required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Camera-ready luminous complexion','Deeply hydrates and firms','Brightens face, neck and decollete','Long-lasting radiance','Luxurious 90-minute treatment']::text[],
  'Luminous, camera-ready glow on your special day'
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 4 - CHEMICAL PEEL TREATMENTS
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Clarifying Peel',
  'clarifying-peel',
  'Instant radiance, smoother texture and beginner friendly.',
  15000, 0, 60, ARRAY[]::text[], 'Chemical Peel Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"previous_peel","label":"Have you had a chemical peel before?","type":"radio","options":["Yes","No"],"required":true},{"name":"skin_concerns","label":"Primary skin concerns","type":"multiselect","options":["Acne / Breakouts","Congestion","Uneven Texture","Dullness","Large Pores"],"required":true},{"name":"current_medications","label":"Are you on retinoids, antibiotics or blood thinners?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"sun_exposure","label":"Significant sun exposure in the past 2 weeks?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Instant radiance boost','Smoother skin texture','Beginner-friendly peel','Reduces congestion','Minimal downtime']::text[],
  NULL
),

(
  'Brightening Peel',
  'brightening-peel',
  'Targets hyperpigmentation, sun damage and uneven skin tone.',
  15000, 0, 60, ARRAY[]::text[], 'Chemical Peel Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"previous_peel","label":"Have you had a chemical peel before?","type":"radio","options":["Yes","No"],"required":true},{"name":"skin_concerns","label":"Primary concerns","type":"multiselect","options":["Hyperpigmentation","Sun Damage","Uneven Skin Tone","Post-Inflammatory Marks","Melasma","Dullness"],"required":true},{"name":"current_medications","label":"Are you on retinoids, antibiotics or blood thinners?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"sun_exposure","label":"Significant sun exposure in the past 2 weeks?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets hyperpigmentation and dark spots','Addresses sun damage','Evens out skin tone','Boosts radiance']::text[],
  NULL
),

(
  'Revitalizing Peel',
  'revitalizing-peel',
  'Clears congestion, controls oil and reduces breakouts.',
  15000, 0, 60, ARRAY[]::text[], 'Chemical Peel Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"previous_peel","label":"Have you had a chemical peel before?","type":"radio","options":["Yes","No"],"required":true},{"name":"skin_concerns","label":"Primary concerns","type":"multiselect","options":["Acne","Congestion","Oiliness","Breakouts","Enlarged Pores"],"required":true},{"name":"active_acne","label":"Do you currently have active inflamed acne?","type":"radio","options":["Yes","No"],"required":true},{"name":"current_medications","label":"Are you on retinoids or antibiotics?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Clears congestion and blackheads','Controls excess oil','Reduces breakouts','Refines pores']::text[],
  NULL
),

(
  'Age-Defying Retinol Peel',
  'age-defying-retinol-peel',
  'Anti-aging, collagen boosting and refines pores.',
  18000, 0, 60, ARRAY[]::text[], 'Chemical Peel Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"retinol_experience","label":"Have you used retinol or retinoid products before?","type":"select","options":["Yes - regularly","Yes - occasionally","No - first time"],"required":true},{"name":"previous_peel","label":"Have you had a chemical peel before?","type":"radio","options":["Yes","No"],"required":true},{"name":"skin_concerns","label":"Anti-aging concerns","type":"multiselect","options":["Fine Lines","Deep Wrinkles","Loss of Firmness","Enlarged Pores","Dullness","Uneven Texture"],"required":true},{"name":"current_medications","label":"Are you on retinoids, antibiotics or blood thinners?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"sun_exposure","label":"Significant sun exposure in the past 2 weeks?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Stimulates collagen production','Reduces fine lines and wrinkles','Refines enlarged pores','Anti-aging and resurfacing']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 5 - REGENERATIVE THERAPY
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Microneedling with Concentrate',
  'microneedling-with-concentrate',
  'Regenerative skin treatment that promotes collagen production, improves skin texture, reduces scars and enhances natural skin radiance using concentrated active serum blend.',
  18000, 30, 90, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Primary concerns","type":"multiselect","options":["Acne Scars","Hyperpigmentation","Fine Lines / Wrinkles","Loss of Firmness","Uneven Texture","Large Pores","Stretch Marks"],"required":true},{"name":"blood_thinners","label":"Are you on blood thinners or anticoagulants?","type":"radio","options":["Yes","No"],"required":true},{"name":"keloid_history","label":"Do you have a history of keloid scarring?","type":"radio","options":["Yes","No"],"required":true},{"name":"active_acne","label":"Active inflamed acne in the treatment area?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Stimulates natural collagen production','Reduces acne scars and hyperpigmentation','Improves skin texture and radiance','Concentrated active serum blend','Visible skin rejuvenation']::text[],
  NULL
),

(
  'Microneedling with GFC',
  'microneedling-with-gfc',
  'Regenerative skin treatment that promotes collagen production, improves skin texture, reduces scars and enhances natural skin radiance using GROWTH FACTORS Technology.',
  35000, 30, 90, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Primary concerns","type":"multiselect","options":["Acne Scars","Deep Scars","Hyperpigmentation","Fine Lines / Wrinkles","Loss of Firmness","Uneven Texture","Hair Loss"],"required":true},{"name":"blood_thinners","label":"Are you on blood thinners or anticoagulants?","type":"radio","options":["Yes","No"],"required":true},{"name":"keloid_history","label":"Do you have a history of keloid scarring?","type":"radio","options":["Yes","No"],"required":true},{"name":"active_acne","label":"Active inflamed acne in the treatment area?","type":"radio","options":["Yes","No"],"required":true},{"name":"autoimmune","label":"Any autoimmune or blood clotting conditions?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Advanced Growth Factor Concentrate technology','Deep collagen regeneration','Reduces stubborn scars and pigmentation','Superior skin rejuvenation results','Medical-grade regenerative treatment']::text[],
  'Clinically proven collagen regeneration with Growth Factor technology'
),

(
  'Premier Regeneration - Face & Neck',
  'premier-regeneration-face-neck',
  'Targets early aging signs, improves elasticity, and enhances overall tone and texture.',
  25000, 30, 90, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Aging concerns to address","type":"multiselect","options":["Loss of Firmness / Elasticity","Fine Lines","Deep Wrinkles","Uneven Tone","Dullness","Neck Laxity"],"required":true},{"name":"blood_thinners","label":"Are you on blood thinners or anticoagulants?","type":"radio","options":["Yes","No"],"required":true},{"name":"keloid_history","label":"Do you have a history of keloid scarring?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets early signs of aging','Improves skin elasticity','Enhances tone and texture','Covers face and neck','Regenerative collagen treatment']::text[],
  NULL
),

(
  'Premier Regeneration - Stretch Marks',
  'premier-regeneration-stretch-marks',
  'Customized microneedling protocol for stretch marks, uneven texture or post-inflammatory pigmentation. Treatment area and duration assessed individually.',
  35000, 30, 90, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"treatment_area","label":"Treatment area with stretch marks","type":"select","options":["Abdomen","Thighs","Hips / Buttocks","Arms","Breasts","Other"],"required":true},{"name":"stretch_mark_age","label":"How old are the stretch marks?","type":"select","options":["Less than 6 months (red/pink)","6 months - 2 years","More than 2 years (white/silver)"],"required":true},{"name":"blood_thinners","label":"Are you on blood thinners or anticoagulants?","type":"radio","options":["Yes","No"],"required":true},{"name":"keloid_history","label":"Do you have a history of keloid scarring?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets stretch marks on any body zone','Customized treatment protocol','Improves skin texture','Reduces post-inflammatory pigmentation']::text[],
  NULL
),

(
  'Brightening IV Therapy',
  'brightening-iv-therapy',
  'Medical-grade, result driven Intravenous Therapy designed to help improve skin radiance and even skin tone by delivering potent antioxidants and skin-supporting nutrients directly into the bloodstream. Reduces dullness, promotes a brighter complexion, enhances hydration and supports overall skin vitality.',
  20000, 0, 120, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"medical_conditions","label":"Do you have any of the following conditions?","type":"multiselect","options":["Diabetes","Heart Condition","Kidney Disease","High Blood Pressure","G6PD Deficiency","None of the above"],"required":true},{"name":"current_medications","label":"Current medications","type":"textarea","required":false},{"name":"known_allergies","label":"Known allergies (especially vitamins or IV components)","type":"text","required":false},{"name":"previous_iv","label":"Have you had IV therapy before?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Improves skin radiance from within','Evens skin tone','Delivers antioxidants directly to bloodstream','Enhances hydration','Supports overall skin vitality']::text[],
  'Brighter, more radiant skin - visible results after first session'
),

(
  'Weightloss IV Therapy',
  'weightloss-iv-therapy',
  'Medical-grade, result driven Intravenous Therapy designed to support metabolism and fat burning while providing essential nutrients and hydration. Boosts energy levels, supports body detoxification, and complements a healthy diet and lifestyle for weight management.',
  20000, 0, 120, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"medical_conditions","label":"Do you have any of the following conditions?","type":"multiselect","options":["Diabetes","Heart Condition","Kidney Disease","High Blood Pressure","Thyroid Condition","None of the above"],"required":true},{"name":"current_medications","label":"Current medications","type":"textarea","required":false},{"name":"known_allergies","label":"Known allergies","type":"text","required":false},{"name":"previous_iv","label":"Have you had IV therapy before?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Supports metabolism and fat burning','Boosts energy levels','Promotes body detoxification','Essential nutrient replenishment','Complements healthy diet and lifestyle']::text[],
  NULL
),

(
  'Detox IV Therapy',
  'detox-iv-therapy',
  'Medical-grade, result driven Intravenous Therapy infused with fluids, vitamins and antioxidants designed to support hydration, replenish nutrient levels and promote overall wellness.',
  20000, 0, 120, ARRAY[]::text[], 'Regenerative Therapy', true,
  '[{"name":"medical_conditions","label":"Do you have any of the following conditions?","type":"multiselect","options":["Diabetes","Heart Condition","Kidney Disease","High Blood Pressure","G6PD Deficiency","None of the above"],"required":true},{"name":"current_medications","label":"Current medications","type":"textarea","required":false},{"name":"known_allergies","label":"Known allergies","type":"text","required":false},{"name":"previous_iv","label":"Have you had IV therapy before?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Supports deep hydration','Replenishes vitamins and antioxidants','Promotes body detoxification','Enhances overall wellness','Medical-grade formulation']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 6 - SKIN TREATMENTS
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Skin Tag Removal',
  'skin-tag-removal',
  'Safe and precise removal of benign skin growths, designed to restore smooth, healthy-looking skin with minimal discomfort.',
  0, 0, 45, ARRAY[]::text[], 'Skin Treatments', false,
  '[{"name":"lesion_location","label":"Location of skin tag(s)","type":"text","required":true},{"name":"lesion_count","label":"Approximate number of skin tags","type":"select","options":["1","2-3","4-5","6 or more"],"required":true},{"name":"blood_thinners","label":"Are you on blood thinners?","type":"radio","options":["Yes","No"],"required":true},{"name":"keloid_history","label":"History of keloid scarring?","type":"radio","options":["Yes","No"],"required":true},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Safe and precise removal','Minimal discomfort','Smooth, clear skin results','Fast 45-minute procedure']::text[],
  NULL
),

(
  'Microdermabrasion',
  'microdermabrasion',
  'Non-invasive treatment that exfoliates dead skin cells, improving texture and promoting a smoother, radiant complexion.',
  0, 0, 45, ARRAY[]::text[], 'Skin Treatments', false,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"skin_concerns","label":"Primary concerns","type":"multiselect","options":["Rough Texture","Dullness","Fine Lines","Large Pores","Mild Hyperpigmentation","Uneven Tone"],"required":true},{"name":"active_conditions","label":"Active rosacea, eczema or open lesions in treatment area?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Non-invasive exfoliation','Removes dead skin cells','Improves texture and radiance','No downtime']::text[],
  NULL
),

(
  'Dermaplaning',
  'dermaplaning',
  'A safe, non-invasive exfoliation treatment performed to effectively eliminate dull surface buildup and fine facial hair, promoting a radiant complexion and a more refined skin texture.',
  2000, 0, 30, ARRAY[]::text[], 'Skin Treatments', true,
  '[{"name":"skin_type","label":"Skin type","type":"select","options":["Normal","Dry","Oily","Combination","Sensitive"],"required":true},{"name":"active_acne","label":"Do you have active acne or inflamed breakouts?","type":"radio","options":["Yes","No"],"required":true},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Removes fine facial hair (peach fuzz)','Eliminates dull surface buildup','Radiant, smooth complexion','Enhances product absorption','No downtime']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 7 - ACNE PROGRAM
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Acne Program - Level 1 (Comedonal)',
  'acne-program-level-1-comedonal',
  'Targeted multi-session program for comedonal acne (whiteheads and blackheads). Sessions: 2x Clarifying Facial with LED, 2x Clarifying Peel with LED, 1x Microneedling with Concentrate and LED. Includes complimentary progress skin analysis on every return visit.',
  50000, 30, 0, ARRAY[]::text[], 'Acne Program', true,
  '[{"name":"acne_type","label":"Describe your acne","type":"multiselect","options":["Whiteheads","Blackheads","Congestion","Clogged Pores"],"required":true},{"name":"acne_duration","label":"How long have you had acne?","type":"select","options":["Less than 6 months","6 months - 1 year","1-2 years","More than 2 years"],"required":true},{"name":"previous_treatments","label":"Previous acne treatments tried","type":"textarea","required":false},{"name":"current_medications","label":"Current medications (including topicals)","type":"textarea","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets whiteheads and blackheads','LED therapy included','5-session program for lasting results','Complimentary skin analysis on every visit']::text[],
  'Clearer skin in 5 sessions - complete comedonal acne program'
),

(
  'Acne Program - Level 2 (Papular)',
  'acne-program-level-2-papular',
  'Targeted multi-session program for papular acne (red inflamed raised bumps, no visible pus). Sessions: 2x Clarifying Facial, 3x Clarifying Peel, 1x Microneedling with Concentrate, 3x IV Gut Health Drip. Includes complimentary progress skin analysis on every return visit.',
  107000, 30, 0, ARRAY[]::text[], 'Acne Program', true,
  '[{"name":"acne_type","label":"Describe your acne","type":"multiselect","options":["Red Inflamed Bumps","Papules","Post-Acne Marks","No Visible Pus"],"required":true},{"name":"acne_duration","label":"How long have you had this type of acne?","type":"select","options":["Less than 6 months","6 months - 1 year","1-2 years","More than 2 years"],"required":true},{"name":"previous_treatments","label":"Previous acne treatments tried","type":"textarea","required":false},{"name":"current_medications","label":"Current medications","type":"textarea","required":false},{"name":"digestive_concerns","label":"Any digestive or gut health concerns?","type":"radio","options":["Yes","No"],"required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets papular inflammatory acne','Includes IV gut health support','9-session protocol for lasting clearance','Addresses internal and external factors']::text[],
  NULL
),

(
  'Acne Program - Level 3 (Pustular)',
  'acne-program-level-3-pustular',
  'Targeted multi-session program for pustular acne (pus-filled lesions with red base, inflamed papules with surrounding redness). Sessions: 3x Clarifying Facial, 3x Clarifying Peel, 1x Microneedling with Concentrate, 5x IV Gut Health Drip. Includes complimentary progress skin analysis.',
  142500, 30, 0, ARRAY[]::text[], 'Acne Program', true,
  '[{"name":"acne_type","label":"Describe your acne","type":"multiselect","options":["Pus-Filled Lesions","Inflamed Papules","Surrounding Redness","Post-Acne Scarring"],"required":true},{"name":"acne_duration","label":"How long have you had this type of acne?","type":"select","options":["Less than 6 months","6 months - 1 year","1-2 years","More than 2 years"],"required":true},{"name":"previous_treatments","label":"Previous treatments tried","type":"textarea","required":false},{"name":"current_medications","label":"Current medications","type":"textarea","required":false},{"name":"digestive_concerns","label":"Any digestive or gut health concerns?","type":"radio","options":["Yes","No"],"required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Treats pustular and inflammatory acne','12-session comprehensive protocol','Includes IV gut health support','Targets root causes of acne']::text[],
  NULL
),

(
  'Acne Program - Level 4 (Cystic)',
  'acne-program-level-4-cystic',
  'Comprehensive program for cystic acne (deep nodules and pus-filled cysts). Sessions: Medical Management with Calming Facials over 3 months, 4x Clarifying Facial, 3x Clarifying Peel, 2x Microneedling with Concentrate, 5x IV Gut Health Drip. Add-ons: LED Therapy, complimentary skin analysis on every return visit.',
  163000, 30, 0, ARRAY[]::text[], 'Acne Program', true,
  '[{"name":"acne_type","label":"Describe your acne","type":"multiselect","options":["Deep Nodules","Cysts (pus-filled)","Painful Lesions","Scarring","Post-Inflammatory Marks"],"required":true},{"name":"acne_duration","label":"How long have you had cystic acne?","type":"select","options":["Less than 6 months","6 months - 1 year","1-2 years","More than 2 years"],"required":true},{"name":"previous_treatments","label":"Previous treatments tried (including Accutane / isotretinoin)","type":"textarea","required":true},{"name":"current_medications","label":"Current medications","type":"textarea","required":false},{"name":"hormone_related","label":"Do you suspect a hormonal component to your acne?","type":"radio","options":["Yes","No","Unsure"],"required":false},{"name":"digestive_concerns","label":"Any digestive or gut health concerns?","type":"radio","options":["Yes","No"],"required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Medical management component included','Comprehensive cystic acne protocol','Calming and restorative treatments','IV gut health support','Microneedling for post-acne scars']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 8 - HYPERPIGMENTATION PROGRAM
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Hyperpigmentation Program - Level 1 (Mild PIH)',
  'hyperpigmentation-program-level-1-mild',
  'Program for mild post-inflammatory hyperpigmentation (light brown scattered spots, mild sunburn, sharp edges, uneven skin tone). Sessions: 1x Clarifying Facial, 2x Brightening Facial, 1x Brightening Peel, 1x Clarifying Peel, 1x Microneedling with Concentrate. Includes complimentary progress skin analysis.',
  55500, 30, 0, ARRAY[]::text[], 'Hyperpigmentation Program', true,
  '[{"name":"pigmentation_type","label":"Describe your hyperpigmentation","type":"multiselect","options":["Post-Acne Marks (PIH)","Sun Spots","Mild Sunburn","Freckles","Uneven Skin Tone"],"required":true},{"name":"pigmentation_duration","label":"How long have you had this concern?","type":"select","options":["Less than 3 months","3-6 months","6 months - 1 year","More than 1 year"],"required":true},{"name":"sun_protection","label":"Do you use daily SPF?","type":"radio","options":["Yes","No","Sometimes"],"required":true},{"name":"current_medications","label":"Current medications","type":"text","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets mild PIH and sun spots','6-session comprehensive program','Combines peels, facials and microneedling','Complimentary progress skin analysis']::text[],
  NULL
),

(
  'Hyperpigmentation Program - Level 2 (Moderate)',
  'hyperpigmentation-program-level-2-moderate',
  'Program for moderate hyperpigmentation (dark brown near-black spots, large areas, slightly blurred edges). Sessions: 1x Clarifying Facial, 2x Brightening Facial, 1x Clarifying Peel, 2x Brightening Peel, 2x Microneedling with Concentrate. Includes complimentary progress skin analysis.',
  82500, 30, 0, ARRAY[]::text[], 'Hyperpigmentation Program', true,
  '[{"name":"pigmentation_type","label":"Describe your hyperpigmentation","type":"multiselect","options":["Dark Brown Spots","Near-Black Spots","Large Patches","Post-Inflammatory Marks","Uneven Tone"],"required":true},{"name":"pigmentation_duration","label":"How long have you had this concern?","type":"select","options":["Less than 6 months","6 months - 1 year","1-2 years","More than 2 years"],"required":true},{"name":"sun_protection","label":"Do you use daily SPF?","type":"radio","options":["Yes","No","Sometimes"],"required":true},{"name":"previous_treatments","label":"Previous treatments tried","type":"textarea","required":false},{"name":"current_medications","label":"Current medications","type":"text","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Treats moderate to dark PIH','8-session intensive protocol','Combines brightening peels and microneedling','Complimentary progress tracking']::text[],
  NULL
),

(
  'Hyperpigmentation Program - Level 3 (Severe PIH)',
  'hyperpigmentation-program-level-3-severe',
  'Program for severe post-inflammatory hyperpigmentation (mixed light and dark patches, large and persistent areas). Sessions: 1x Clarifying Facial, 2x Brightening Facial, 1x Clarifying Peel, 2x Brightening Peel, 2x Microneedling with Concentrate, 1x Microneedling with GFC. Includes complimentary progress skin analysis.',
  110500, 30, 0, ARRAY[]::text[], 'Hyperpigmentation Program', true,
  '[{"name":"pigmentation_type","label":"Describe your hyperpigmentation","type":"multiselect","options":["Mixed Light and Dark Patches","Large Areas","Persistent Marks","Stubborn PIH","Possible Melasma Component"],"required":true},{"name":"pigmentation_duration","label":"How long have you had this concern?","type":"select","options":["Less than 1 year","1-2 years","More than 2 years"],"required":true},{"name":"sun_protection","label":"Do you use daily SPF?","type":"radio","options":["Yes","No","Sometimes"],"required":true},{"name":"previous_treatments","label":"Previous treatments tried","type":"textarea","required":true},{"name":"current_medications","label":"Current medications","type":"text","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Advanced protocol for severe PIH','GFC microneedling for stubborn pigmentation','9-session comprehensive program','Addresses mixed light and dark patches']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------
-- STEP 9 - MELASMA
-- -----------------------------------------------------------------------

INSERT INTO public.services
  (name, slug, description, base_price, deposit_percentage, duration_minutes,
   images, category, is_active, form_fields, benefits, results_stat)
VALUES

(
  'Melasma - Level 1 (Epidermal)',
  'melasma-level-1-epidermal',
  'Treatment for epidermal melasma (light brown patches, small areas, clearly defined borders). Sessions: 1x Clarifying Facial, 2x Brightening Facial, 3x Brightening Peel, 2x Microneedling with Tranexamic Concentrate. Includes complimentary progress skin analysis on every return visit.',
  82500, 30, 0, ARRAY[]::text[], 'Melasma', true,
  '[{"name":"melasma_appearance","label":"Describe your melasma","type":"multiselect","options":["Light Brown Patches","Small Areas","Clearly Defined Borders","Symmetrical Pattern","Face Only"],"required":true},{"name":"melasma_duration","label":"How long have you had melasma?","type":"select","options":["Less than 6 months","6 months - 1 year","1-2 years","More than 2 years"],"required":true},{"name":"hormonal_trigger","label":"Was onset related to pregnancy, contraception or hormone therapy?","type":"radio","options":["Yes","No","Unsure"],"required":true},{"name":"sun_protection","label":"Do you use daily SPF?","type":"radio","options":["Yes","No","Sometimes"],"required":true},{"name":"previous_treatments","label":"Previous melasma treatments tried","type":"textarea","required":false},{"name":"current_medications","label":"Current medications","type":"text","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Targets epidermal melasma','Tranexamic Concentrate microneedling','8-session program','Brightening peels and facials combined']::text[],
  NULL
),

(
  'Melasma - Level 2 (Dermal)',
  'melasma-level-2-dermal',
  'Treatment for dermal melasma (dark patches, blurred borders, large areas). Sessions: 1x Clarifying Facial, 2x Brightening Facial, 4x Brightening Peel, 4x Microneedling with Tranexamic Concentrate, 1x Microneedling with GFC. Includes complimentary progress skin analysis.',
  122500, 30, 0, ARRAY[]::text[], 'Melasma', true,
  '[{"name":"melasma_appearance","label":"Describe your melasma","type":"multiselect","options":["Dark Patches","Blurred Borders","Large Areas","Deep Pigmentation","Hormonally Driven"],"required":true},{"name":"melasma_duration","label":"How long have you had melasma?","type":"select","options":["Less than 1 year","1-2 years","More than 2 years"],"required":true},{"name":"hormonal_trigger","label":"Was onset related to pregnancy, contraception or hormone therapy?","type":"radio","options":["Yes","No","Unsure"],"required":true},{"name":"sun_protection","label":"Do you use daily SPF?","type":"radio","options":["Yes","No","Sometimes"],"required":true},{"name":"previous_treatments","label":"Previous melasma treatments tried","type":"textarea","required":true},{"name":"current_medications","label":"Current medications","type":"text","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Treats deep dermal melasma','GFC microneedling for advanced results','12-session intensive protocol','Addresses stubborn dark patches']::text[],
  NULL
),

(
  'Melasma - Level 3 (Mixed)',
  'melasma-level-3-mixed',
  'Treatment for mixed melasma (both epidermal and dermal - light and dark patches, blurred and defined borders, large areas). Sessions: 1x Clarifying Facial, 2x Brightening Facial, 5x Brightening Peel, 3x Microneedling with Tranexamic Concentrate, 2x Microneedling with GFC. Includes complimentary progress skin analysis.',
  165500, 30, 0, ARRAY[]::text[], 'Melasma', true,
  '[{"name":"melasma_appearance","label":"Describe your melasma","type":"multiselect","options":["Light and Dark Patches","Blurred and Defined Borders","Large Areas","Mixed Epidermal and Dermal","Hormonal Component"],"required":true},{"name":"melasma_duration","label":"How long have you had melasma?","type":"select","options":["Less than 1 year","1-2 years","More than 2 years","Recurring / Chronic"],"required":true},{"name":"hormonal_trigger","label":"Was onset related to pregnancy, contraception or hormone therapy?","type":"radio","options":["Yes","No","Unsure"],"required":true},{"name":"sun_protection","label":"Do you use daily SPF?","type":"radio","options":["Yes","No","Sometimes"],"required":true},{"name":"previous_treatments","label":"Previous melasma treatments tried","type":"textarea","required":true},{"name":"current_medications","label":"Current medications","type":"text","required":false},{"name":"known_allergies","label":"Known allergies or sensitivities","type":"text","required":false},{"name":"pregnant_or_breastfeeding","label":"Are you currently pregnant or breastfeeding?","type":"radio","options":["Yes","No"],"required":true}]'::jsonb,
  ARRAY['Most comprehensive melasma protocol','Targets both epidermal and dermal melasma','GFC and Tranexamic microneedling combined','13-session program for mixed melasma']::text[],
  NULL
)

ON CONFLICT (slug) DO NOTHING;
