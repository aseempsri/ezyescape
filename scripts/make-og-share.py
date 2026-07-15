#!/usr/bin/env python3
"""Compose WhatsApp / Open Graph share image from hero + logo (no CTAs)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1] / 'web' / 'public' / 'images'
W, H = 1200, 630


def load_font(candidates, size):
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def main():
    hero = Image.open(ROOT / 'ju.png').convert('RGB')
    logo = Image.open(ROOT / 'logo.png').convert('RGBA')

    src_w, src_h = hero.size
    scale = max(W / src_w, H / src_h)
    nw, nh = int(src_w * scale), int(src_h * scale)
    hero = hero.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = max(0, (nh - H) // 2 - 20)
    canvas = hero.crop((left, top, left + W, top + H))
    canvas = ImageEnhance.Contrast(canvas).enhance(1.06)
    canvas = ImageEnhance.Color(canvas).enhance(1.1)
    base = canvas.convert('RGBA')

    shade = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for x in range(W):
        t = max(0.0, 1.0 - (x / (W * 0.7)))
        sd.line([(x, 0), (x, H)], fill=(8, 10, 16, int(155 * t)))
    for y in range(H):
        edge = min(y / 70, (H - y) / 90, 1.0)
        if edge < 1:
            sd.line([(0, y), (W, y)], fill=(0, 0, 0, int(50 * (1 - edge))))
    base = Image.alpha_composite(base, shade)

    logo_w = 440
    logo_h = int(logo.height * (logo_w / logo.width))
    logo_r = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    lx = (W - logo_w) // 2
    ly = 34
    pad_x, pad_y = 28, 18
    plate = Image.new('RGBA', (logo_w + pad_x * 2, logo_h + pad_y * 2), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle(
        [0, 0, logo_w + pad_x * 2 - 1, logo_h + pad_y * 2 - 1],
        radius=(logo_h + pad_y * 2) // 2,
        fill=(0, 0, 0, 170),
    )
    glow = plate.filter(ImageFilter.GaussianBlur(12))
    base.paste(glow, (lx - pad_x - 4, ly - pad_y - 4), glow)
    base.paste(plate, (lx - pad_x, ly - pad_y), plate)
    base.paste(logo_r, (lx, ly), logo_r)

    draw = ImageDraw.Draw(base)
    sans_bold = load_font(['/System/Library/Fonts/Supplemental/Arial Bold.ttf'], 52)
    script = load_font([
        '/System/Library/Fonts/Supplemental/Snell Roundhand.ttc',
        '/System/Library/Fonts/Supplemental/Apple Chancery.ttf',
    ], 60)
    sans = load_font(['/System/Library/Fonts/Supplemental/Arial.ttf'], 23)

    def text_shadow(xy, text, font, fill, shadow=(0, 0, 0, 170), offset=2):
        x, y = xy
        draw.text((x + offset, y + offset), text, font=font, fill=shadow)
        draw.text((x, y), text, font=font, fill=fill)

    x_text = 52
    y1 = 230
    draw.line([(x_text, y1 - 16), (x_text + 44, y1 - 16)], fill=(245, 166, 35, 255), width=3)
    text_shadow((x_text, y1), 'Tourists book their stays', sans_bold, (245, 166, 35, 255))
    y2 = draw.textbbox((x_text, y1), 'Tourists book their stays', font=sans_bold)[3] + 10
    text_shadow((x_text, y2), 'Travellers match their vibes', script, (255, 255, 255, 255))
    y3 = draw.textbbox((x_text, y2), 'Travellers match their vibes', font=script)[3] + 20
    for i, part in enumerate([
        'Discover authentic mountain homes hosted by local',
        'families — matched to how you actually travel.',
    ]):
        text_shadow(
            (x_text, y3 + i * 28),
            part,
            sans,
            (235, 235, 235, 235),
            shadow=(0, 0, 0, 130),
            offset=1,
        )

    out = ROOT / 'og-share.jpg'
    base.convert('RGB').save(out, 'JPEG', quality=90, optimize=True)
    print(f'Wrote {out} ({out.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
