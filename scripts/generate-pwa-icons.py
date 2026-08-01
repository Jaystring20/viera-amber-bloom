"""
Generate Viera Amber PWA icon set.

The mark is the ∧ vertex from the VIERA∧AMBER wordmark — the same device the
Hero uses to mark where one creative current forks into five arms — sitting
above five dots in the five ecosystem accent colours. It reads as the brand at
512px and still resolves as a distinct silhouette at favicon size.

Run:  python scripts/generate-pwa-icons.py
Out:  public/icons/*.png, public/favicon.ico
"""
from PIL import Image, ImageDraw
from pathlib import Path

INK = (10, 10, 10, 255)
GOLD = (217, 119, 6, 255)
ARM_COLORS = [
    (217, 119, 6, 255),   # Illustrations
    (98, 1, 127, 255),    # VAGIN
    (110, 0, 37, 255),    # VIVA
    (136, 136, 136, 255), # VAM
    (11, 123, 140, 255),  # VASH
]

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

SS = 4  # supersample factor for clean anti-aliased edges


def draw_mark(size: int, inset: float, with_dots: bool = True) -> Image.Image:
    """inset = fraction of the canvas kept clear at the edges (maskable safe zone)."""
    c = size * SS
    img = Image.new("RGBA", (c, c), INK)
    d = ImageDraw.Draw(img)

    cx = c / 2
    content = c * (1 - inset * 2)
    top = c * inset

    # ── the ∧ vertex ──────────────────────────────────────────────────────
    apex_y = top + content * 0.16
    arm_y = top + content * 0.50
    half_w = content * 0.30
    stroke = max(2, int(content * 0.085))

    d.line([(cx - half_w, arm_y), (cx, apex_y)], fill=GOLD, width=stroke, joint="curve")
    d.line([(cx, apex_y), (cx + half_w, arm_y)], fill=GOLD, width=stroke, joint="curve")
    # round the caps and the joint by hand — PIL has no round linecap
    r = stroke / 2
    for pt in [(cx - half_w, arm_y), (cx, apex_y), (cx + half_w, arm_y)]:
        d.ellipse([pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r], fill=GOLD)

    # ── five arm dots ─────────────────────────────────────────────────────
    if with_dots:
        dot_y = top + content * 0.79
        dot_r = content * 0.052
        spread = content * 0.33
        for i, col in enumerate(ARM_COLORS):
            t = (i - 2) / 2  # -1 .. 1
            dx = cx + t * spread
            d.ellipse([dx - dot_r, dot_y - dot_r, dx + dot_r, dot_y + dot_r], fill=col)

    return img.resize((size, size), Image.LANCZOS)


def save(img: Image.Image, name: str) -> None:
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    print(f"  {name}  {img.size[0]}x{img.size[1]}")


print("Generating PWA icons...")
# Standard "any" icons — mark fills the tile
save(draw_mark(192, inset=0.14), "icon-192.png")
save(draw_mark(512, inset=0.14), "icon-512.png")

# Maskable — Android crops to a circle/squircle, so keep the mark inside the
# inner 80% safe zone or it gets clipped.
save(draw_mark(512, inset=0.24), "icon-maskable-512.png")

# iOS home screen — no transparency, no auto-mask, slightly tighter crop
save(draw_mark(180, inset=0.16), "apple-touch-icon.png")

# Favicon — dots vanish at 16px, so ship the vertex alone
fav = draw_mark(64, inset=0.12, with_dots=False)
ico_path = OUT.parent / "favicon.ico"
fav.save(ico_path, sizes=[(16, 16), (32, 32), (48, 48)])
print(f"  favicon.ico  16/32/48")
save(fav, "icon-64.png")

print("Done.")
