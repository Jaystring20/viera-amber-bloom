-- ═══════════════════════════════════════════════════════════════════════════
-- VAGIN — dedicated image slot for the Mission panel
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WHY
--
-- The photo beside "Health, dignity and rights for every girl."
-- (VAGIN.tsx, MISSION section) was rendering slot `vagin_team_02`. That slot
-- is not the Mission panel's own — it is shared by four separate places on
-- the page:
--
--   1. the Mission panel                    ("VAGIN community outreach")
--   2. the hero photo cluster               ("Community outreach")
--   3. the infinite carousel / photo reel   ("... Two women ...", tagged Nigeria)
--   4. Meet the Team                        ("Community outreach: VAGIN team")
--
-- So swapping the Mission photo in the admin silently swapped the other
-- three, and three of the four alt texts would then describe a picture that
-- was no longer there. This gives the Mission panel a slot of its own, so it
-- can be changed without touching the hero cluster, the reel, or the team
-- grid.
--
-- THIS FILE IS OPTIONAL
--
-- The Malawi photo already ships as a static file at
-- public/vagin-images/vagin_mission_01.webp. useVaginImages resolves a slot as:
--
--     rows.find(r => r.slot === slot)?.image_url ?? `/vagin-images/${slot}.webp`
--
-- so with no row present the fallback lands on exactly that file and the
-- panel renders the right picture already. Nothing here is needed to make the
-- page correct.
--
-- What this DOES add is admin control: creating the row makes the slot appear
-- in the dashboard under its own "Mission panel" section, so the photo can be
-- swapped later without a code change. image_url is seeded to the static file
-- so running this is a no-op visually.
--
-- AFTER RUNNING THIS
--
--   Admin → VAGIN Images → section "Mission panel" → upload to swap the photo.
--   Only the Mission panel changes; the hero cluster, the carousel and Meet
--   the Team keep vagin_team_02 and their own picture.
--
-- Safe to re-run: idempotent on the slot key.
-- ═══════════════════════════════════════════════════════════════════════════

insert into va_vagin_images (slot, label, section, image_url, sort_order)
values (
  'vagin_mission_01',
  'Mission panel — Health, dignity and rights',
  'Mission panel',
  '/vagin-images/vagin_mission_01.webp',
  20
)
on conflict (slot) do update
  set label      = excluded.label,
      section    = excluded.section,
      sort_order = excluded.sort_order;
      -- image_url deliberately NOT overwritten on conflict: re-running this
      -- must never revert an image the admin has since uploaded.


-- ── Verify ───────────────────────────────────────────────────────────────────
-- Expect one row, section 'Mission panel'.

select slot, label, section, image_url, sort_order
from va_vagin_images
where slot = 'vagin_mission_01';
