"""
Generate the Viera Amber Open Graph / Twitter share card.

Replaces the inherited Lovable preview screenshot, which was a stale
third-party R2 URL that would eventually 404 and never looked like the brand.

The card is a compressed restatement of the Hero: the warm amber field, the
real wordmark, the motto, and the ∧ vertex forking into the five ecosystem
arms. Someone who sees this in a WhatsApp or X preview and then lands on the
site meets the same composition twice.

Type note: Playfair Display is not installed locally, so the motto is set in
Georgia italic — which is the site's own declared fallback in the CSS stack
("Playfair Display", Georgia, serif), not an arbitrary substitute.

Run:  python scripts/generate-og-image.py
Out:  public/og-image.png  (1200x630)
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 630
SS = 2  # supersample for clean edges

PAPER = (250, 250, 250, 255)
INK = (10, 10, 10, 255)
GOLD_INK = (217, 119, 6, 255)
CHAMPAGNE = (200, 169, 110)

ARM_COLORS = [
    (217, 119, 6, 255),    # Illustrations
    (98, 1, 127, 255),     # VAGIN
    (110, 0, 37, 255),     # VIVA
    (136, 136, 136, 255),  # VAM
    (11, 123, 140, 255),   # VASH
]

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("C:/Windows/Fonts")


def load_font(name: str, size: int):
    try:
        return ImageFont.truetype(str(FONTS / name), size)
    except OSError:
        return ImageFont.load_default()


def radial(size, cx, cy, rx, ry, color, max_alpha):
    """Soft radial wash, drawn as concentric ellipses."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 90
    for i in range(steps, 0, -1):
        t = i / steps
        a = int(max_alpha * (1 - t) ** 1.7)
        if a <= 0:
            continue
        d.ellipse(
            [cx - rx * t, cy - ry * t, cx + rx * t, cy + ry * t],
            fill=(*color, a),
        )
    return layer


c = (W * SS, H * SS)
img = Image.new("RGBA", c, PAPER)

# ── Amber field ───────────────────────────────────────────────────────────
img.alpha_composite(radial(c, W * SS * 0.24, H * SS * 0.46, W * SS * 0.58, H * SS * 0.78, CHAMPAGNE, 88))
img.alpha_composite(radial(c, W * SS * 0.80, H * SS * 0.26, W * SS * 0.34, H * SS * 0.44, (232, 210, 168), 70))

d = ImageDraw.Draw(img)

# ── Wordmark — the real asset, inked ──────────────────────────────────────
logo = Image.open(ROOT / "src" / "assets" / "viera-amber-logo.png").convert("RGBA")
target_w = int(W * SS * 0.42)
logo = logo.resize((target_w, int(logo.height * target_w / logo.width)), Image.LANCZOS)

# The asset is a light outline; recolour its opaque pixels to ink.
inked = Image.new("RGBA", logo.size, INK)
inked.putalpha(logo.getchannel("A"))

logo_x = int(W * SS * 0.075)
logo_y = int(H * SS * 0.30)
img.alpha_composite(inked, (logo_x, logo_y))

# ── Motto ─────────────────────────────────────────────────────────────────
motto_font = load_font("georgiaz.ttf", int(52 * SS))
motto_y = logo_y + inked.height + int(34 * SS)
d.text((logo_x, motto_y), "For her, by her", font=motto_font, fill=INK)
mw = d.textlength("For her, by her", font=motto_font)
d.text((logo_x + mw, motto_y), ".", font=motto_font, fill=GOLD_INK)

# ── Strapline ─────────────────────────────────────────────────────────────
sub_font = load_font("segoeui.ttf", int(21 * SS))
d.text(
    (logo_x + 3, motto_y + int(82 * SS)),
    "A creative ecosystem built for feminine empowerment.",
    font=sub_font,
    fill=(10, 10, 10, 165),
)

# ── The current: ∧ vertex forking into five arms ──────────────────────────
fx, fy = W * SS * 0.795, H * SS * 0.44
stroke = int(5 * SS)

# trunk descending into the vertex
d.line([(fx, fy - 150 * SS), (fx, fy - 26 * SS)], fill=(*INK[:3], 215), width=stroke)

# the ∧
arm = 26 * SS
d.line([(fx - arm, fy + 10 * SS), (fx, fy - 20 * SS)], fill=GOLD_INK, width=int(6 * SS))
d.line([(fx, fy - 20 * SS), (fx + arm, fy + 10 * SS)], fill=GOLD_INK, width=int(6 * SS))
r = 3 * SS
for pt in [(fx - arm, fy + 10 * SS), (fx, fy - 20 * SS), (fx + arm, fy + 10 * SS)]:
    d.ellipse([pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r], fill=GOLD_INK)

# five threads + plates
spread = 128 * SS
plate = 30 * SS
plate_y = fy + 138 * SS
for i, col in enumerate(ARM_COLORS):
    t = (i - 2) / 2
    px = fx + t * spread
    d.line([(fx, fy + 4 * SS), (px, plate_y - plate / 2)], fill=col, width=int(4 * SS))
    d.rounded_rectangle(
        [px - plate / 2, plate_y - plate / 2, px + plate / 2, plate_y + plate / 2],
        radius=int(7 * SS),
        fill=col,
    )

out = img.convert("RGB").resize((W, H), Image.LANCZOS)
dest = ROOT / "public" / "og-image.png"
out.save(dest, "PNG", optimize=True)
print(f"Wrote {dest}  ({W}x{H}, {dest.stat().st_size // 1024} KB)")
