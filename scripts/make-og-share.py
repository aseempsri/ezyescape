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

    # Soft vignette + bottom shade so bottom-right copy stays readable
    shade = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for y in range(H):
        edge = min(y / 70, (H - y) / 90, 1.0)
        if edge < 1:
            sd.line([(0, y), (W, y)], fill=(0, 0, 0, int(45 * (1 - edge))))
    for y in range(int(H * 0.4), H):
        t = (y - H * 0.4) / (H * 0.6)
        sd.line([(0, y), (W, y)], fill=(8, 10, 16, int(150 * t)))
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

    def text_width(text, font):
        box = draw.textbbox((0, 0), text, font=font)
        return box[2] - box[0]

    def text_shadow_right(y, text, font, fill, shadow=(0, 0, 0, 170), offset=2):
        x = W - margin - text_width(text, font)
        draw.text((x + offset, y + offset), text, font=font, fill=shadow)
        draw.text((x, y), text, font=font, fill=fill)
        return x

    margin = 48
    line1 = 'Tourists book their stays'
    line2 = 'Travellers match their vibes'
    sub_lines = [
        'Discover authentic mountain homes hosted by local',
        'families — matched to how you actually travel.',
    ]

    h1 = draw.textbbox((0, 0), line1, font=sans_bold)[3]
    h2 = draw.textbbox((0, 0), line2, font=script)[3]
    h_sub = draw.textbbox((0, 0), sub_lines[0], font=sans)[3]
    gap12, gap2s, sub_gap = 10, 18, 8
    block_h = h1 + gap12 + h2 + gap2s + h_sub * len(sub_lines) + sub_gap * (len(sub_lines) - 1)
    y1 = H - margin - block_h

    accent_w = 44
    x_right = W - margin
    draw.line(
        [(x_right - accent_w, y1 - 16), (x_right, y1 - 16)],
        fill=(245, 166, 35, 255),
        width=3,
    )
    text_shadow_right(y1, line1, sans_bold, (245, 166, 35, 255))
    y2 = y1 + h1 + gap12
    text_shadow_right(y2, line2, script, (255, 255, 255, 255))
    y3 = y2 + h2 + gap2s
    for i, part in enumerate(sub_lines):
        text_shadow_right(
            y3 + i * (h_sub + sub_gap),
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
