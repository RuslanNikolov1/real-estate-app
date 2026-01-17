-- Normalize neighborhood names to ensure consistent formatting
-- This fixes the case mismatch where neighborhoods are stored with lowercase "кв."
-- but search was formatting them with uppercase "Кв.", causing search failures

-- Normalize "кв." at the start of neighborhood names (handle various capitalizations)
-- Examples: "Кв. Сарафово" -> "кв. Сарафово", "КВ. Сарафово" -> "кв. Сарафово"
UPDATE public.properties
SET neighborhood = regexp_replace(
    neighborhood,
    '^[Кк][Вв]\.\s*',
    'кв. ',
    'g'
)
WHERE neighborhood IS NOT NULL
  AND neighborhood ~* '^[Кк][Вв]\.';

-- Normalize "кв." at the end of neighborhood names (handle various capitalizations)
-- Examples: "Емировски Кв." -> "Емировски кв.", "Емировски КВ." -> "Емировски кв."
UPDATE public.properties
SET neighborhood = regexp_replace(
    neighborhood,
    '\s+[Кк][Вв]\.$',
    ' кв.',
    'g'
)
WHERE neighborhood IS NOT NULL
  AND neighborhood ~* '\s+[Кк][Вв]\.$';

-- Normalize "кв." at the start of neighborhood names in pending_properties
UPDATE public.pending_properties
SET neighborhood = regexp_replace(
    neighborhood,
    '^[Кк][Вв]\.\s*',
    'кв. ',
    'g'
)
WHERE neighborhood IS NOT NULL
  AND neighborhood ~* '^[Кк][Вв]\.';

-- Normalize "кв." at the end of neighborhood names in pending_properties
UPDATE public.pending_properties
SET neighborhood = regexp_replace(
    neighborhood,
    '\s+[Кк][Вв]\.$',
    ' кв.',
    'g'
)
WHERE neighborhood IS NOT NULL
  AND neighborhood ~* '\s+[Кк][Вв]\.$';
