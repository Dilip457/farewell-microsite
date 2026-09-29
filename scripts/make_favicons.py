"""Generate the static favicon set into public/ from scripts/orb-source.png.

The orb source is a 69x69 grayscale crop of a dotted 3D sphere (dark
background, white dots). This script re-renders it crisply at every
favicon size on a TRANSPARENT background (no dark tile), tinted the
site's light orbital blue so it reads on both dark and light tabs.
Small sizes add a thin ring for a clear silhouette. The deploy workflow
runs it before `npm run build`. The browser-side spinningFavicon module
animates the tab icon at runtime; these files are the initial icon and
the fallback.

Requires: Pillow (pip install pillow).
"""
import io
import os
import struct

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PUB = os.path.join(REPO, "public")

ORIG_LO, ORIG_HI = 32.0, 215.0  # source grayscale range mapped to alpha
# depth tint: back dots deep blue (visible on light tabs), front dots bright
DOT_DEEP = (58, 128, 242)
DOT_LIGHT = (160, 200, 255)


def orb_alpha():
    """Lift the dotted sphere as an alpha mask (white dots, dark bg)."""
    im = Image.open(os.path.join(HERE, "orb-source.png")).convert("L")

    def to_alpha(v):
        t = min(max((v - ORIG_LO) / (ORIG_HI - ORIG_LO), 0.0), 1.0)
        return int(255 * (t ** 0.85))

    return im.point(to_alpha)


def make_orb(size, orb_frac, boost, ring_w=0, ring_alpha=150):
    """Render the dotted orb filling the icon on a transparent tile."""
    S = size * 4  # supersample for smooth antialiasing
    target = int(S * orb_frac)
    a = orb_alpha().resize((target, target), Image.LANCZOS)
    a = a.point(lambda v: int(min(255, v * boost)))
    fa = Image.new("L", (S, S), 0)
    ox = (S - target) // 2
    fa.paste(a, (ox, ox))
    if ring_w:  # thin ring so tiny sizes keep a clear silhouette
        rd = ImageDraw.Draw(fa)
        rd.ellipse([ox, ox, ox + target, ox + target], outline=ring_alpha, width=ring_w)
    # two depth layers: deep blue base + bright overlay on the front dots
    deep = Image.new("RGBA", (S, S), (*DOT_DEEP, 255))
    deep.putalpha(fa)
    bright = Image.new("RGBA", (S, S), (*DOT_LIGHT, 255))
    bright.putalpha(fa.point(lambda v: (v * v * v) // 65025))
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    out.alpha_composite(deep)
    out.alpha_composite(bright)
    return out.resize((size, size), Image.LANCZOS)


def png_bytes(img):
    b = io.BytesIO()
    img.save(b, "PNG")
    return b.getvalue()


def main():
    os.makedirs(PUB, exist_ok=True)
    # small sizes: bigger fill + boost + ring; large sizes: near-full fill
    i16 = make_orb(16, 0.96, 2.6, ring_w=8, ring_alpha=210)
    i32 = make_orb(32, 0.94, 2.3, ring_w=6, ring_alpha=160)
    i48 = make_orb(48, 0.92, 1.9)
    i180 = make_orb(180, 0.90, 1.55)
    i192 = make_orb(192, 0.90, 1.55)

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
