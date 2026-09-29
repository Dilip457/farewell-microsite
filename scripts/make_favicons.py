"""Generate the favicon set into public/ from scripts/orb-source.png.

The orb source is a 69x69 grayscale crop of a dotted 3D sphere (dark
background, white dots). This script re-renders it crisply at every
favicon size on the site's near-black tile with a subtle blue-violet
glow. The deploy workflow runs it before `npm run build`.

Requires: Pillow (pip install pillow).
"""
import io
import os
import struct

from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PUB = os.path.join(REPO, "public")

ORIG_LO, ORIG_HI = 32.0, 215.0  # source grayscale range mapped to alpha


def orb_alpha():
    """Lift the dotted sphere as an alpha mask (white dots, dark bg)."""
    im = Image.open(os.path.join(HERE, "orb-source.png")).convert("L")

    def to_alpha(v):
        t = min(max((v - ORIG_LO) / (ORIG_HI - ORIG_LO), 0.0), 1.0)
        return int(255 * (t ** 0.85))

    return im.point(to_alpha)


def make_tile(size, orb_frac, boost, glow_alpha, ring_w=0, ring_alpha=140, base=None):
    """Render the orb on a dark cinematic tile at `size` px."""
    S = size * 4  # supersample for smooth antialiasing
    tile = Image.new("RGB", (S, S), (5, 5, 7))

    # subtle blue-violet radial glow, echoing the site atmosphere
    glow = Image.new("L", (S, S), 0)
    gd = ImageDraw.Draw(glow)
    half = S / 2
    for i in range(int(half), 0, -max(2, S // 96)):
        a = int(glow_alpha * (1 - i / half) ** 1.7)
        gd.ellipse([half - i, half - i, half + i, half + i], fill=a)
    glow = glow.filter(ImageFilter.GaussianBlur(S // 40))
    tile = Image.composite(Image.new("RGB", (S, S), (110, 160, 255)), tile, glow)
    g2 = glow.point(lambda v: v // 3)
    tile = Image.composite(Image.new("RGB", (S, S), (150, 120, 255)), tile, g2)

    # the orb: upscale the alpha mask smoothly into white dots
    target = int(S * orb_frac)
    a = (base if base is not None else orb_alpha()).resize((target, target), Image.LANCZOS)
    a = a.point(lambda v: int(min(255, v * boost)))
    fa = Image.new("L", (S, S), 0)
    ox = (S - target) // 2
    fa.paste(a, (ox, ox))
    if ring_w:  # thin luminous ring for edge definition at tiny sizes
        rd = ImageDraw.Draw(fa)
        rd.ellipse([ox, ox, ox + target, ox + target], outline=ring_alpha, width=ring_w)
    dots = Image.new("RGBA", (S, S), (250, 252, 255, 255))
    dots.putalpha(fa)

    out = tile.convert("RGBA")
    out.alpha_composite(dots)
    return out.resize((size, size), Image.LANCZOS)


def png_bytes(img):
    b = io.BytesIO()
    img.save(b, "PNG")
    return b.getvalue()


def main():
    os.makedirs(PUB, exist_ok=True)
    base = orb_alpha()
    # small sizes get contrast boost + an edge ring so they stay readable
    i16 = make_tile(16, 0.82, 2.6, 55, ring_w=8, ring_alpha=150, base=base)
    i32 = make_tile(32, 0.82, 2.2, 50, ring_w=6, ring_alpha=110, base=base)
    i48 = make_tile(48, 0.76, 1.8, 48, base=base)
    i180 = make_tile(180, 0.74, 1.25, 48, base=base)
    i192 = make_tile(192, 0.74, 1.25, 48, base=base)

    # multi-resolution .ico built by hand (clean 16/32/48 entries)
    frames = [(16, png_bytes(i16)), (32, png_bytes(i32)), (48, png_bytes(i48))]
    header = struct.pack("<HHH", 0, 1, len(frames))
    entries = b""
    data = b""
    offset = 6 + 16 * len(frames)
    for size, blob in frames:
        entries += struct.pack(
            "<BBBBHHII", size % 256, size % 256, 0, 0, 32, 0, len(blob), offset
        )
        data += blob
        offset += len(blob)
    with open(os.path.join(PUB, "favicon.ico"), "wb") as f:
        f.write(header + entries + data)

    i32.save(os.path.join(PUB, "favicon-32.png"))
    i192.save(os.path.join(PUB, "favicon-192.png"))
    i180.save(os.path.join(PUB, "apple-touch-icon.png"))
    print("favicon assets written to", PUB)


if __name__ == "__main__":
    main()
