"""
Generates placeholder assets for 21 TAPES.

  python3 scripts/generate-placeholders.py

- public/audio/tape-01.m4a … tape-21.m4a, for-you.m4a  (soft tonal placeholders)
- public/photos/tape-XX.jpg                          (film-like placeholder snaps)
- public/textures/walnut.jpg, paper.jpg, grain.png     (environment textures)

Replace the audio and photos with the real ones whenever you're ready.
The textures are part of the design and can stay.
Requires numpy, Pillow and ffmpeg.
"""
import os
import subprocess
import tempfile
import wave

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
RNG = np.random.default_rng(21)


# ---------------------------------------------------------------- noise utils
def fractal_noise(h, w, octaves=5, seed=0):
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        sh, sw = max(2, h >> (octaves - o)), max(2, w >> (octaves - o))
        layer = rng.random((sh, sw)).astype(np.float32)
        img = Image.fromarray((layer * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(img, np.float32) / 255.0)
        total += amp
        amp *= 0.55
    return out / total


# ------------------------------------------------------------------- textures
def walnut():
    h, w = 1400, 2000
    # anisotropic noise: stretched along the grain (x)
    n = np.asarray(Image.fromarray((fractal_noise(h, w // 10, 5, seed=3) * 255).astype(np.uint8))
                   .resize((w, h), Image.BICUBIC), np.float32) / 255.0
    n2 = np.asarray(Image.fromarray((fractal_noise(h, w // 30, 4, seed=5) * 255).astype(np.uint8))
                    .resize((w, h), Image.BICUBIC), np.float32) / 255.0
    y = np.linspace(0, 1, h)[:, None]
    x = np.linspace(0, 1, w)[None, :]
    # long horizontal grain, gently warped
    grain = np.sin((y * 34 + n * 3.2 + np.sin(x * 2.3 + 0.7) * 0.35) * np.pi)
    fine = np.sin((y * 410 + n2 * 22) * np.pi) * 0.5
    t = 0.5 + 0.2 * grain + 0.08 * fine + 0.35 * (n2 - 0.5)
    t = np.clip(t, 0, 1)
    dark = np.array([30, 21, 17], np.float32)
    mid = np.array([58, 40, 31], np.float32)
    light = np.array([86, 60, 45], np.float32)
    t3 = t[..., None]
    col = np.where(t3 < 0.5, dark + (mid - dark) * (t3 * 2), mid + (light - mid) * ((t3 - 0.5) * 2))
    col += (RNG.random((h, w, 1)) - 0.5) * 6
    img = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    img.save(os.path.join(PUB, "textures", "walnut.jpg"), quality=82, optimize=True, progressive=True)


def paper():
    h, w = 900, 900
    n = fractal_noise(h, w, 6, seed=9)
    fibres = fractal_noise(h, w, 3, seed=11)
    base = np.array([237, 227, 210], np.float32)
    v = (n - 0.5) * 14 + (fibres - 0.5) * 6 + (RNG.random((h, w)) - 0.5) * 7
    col = base[None, None, :] + v[..., None] * np.array([1.0, 0.97, 0.9])
    tile = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).crop((0, 0, 450, 450))
    # mirror four ways so it repeats without a seam
    img = Image.new("RGB", (900, 900))
    img.paste(tile, (0, 0))
    img.paste(tile.transpose(Image.FLIP_LEFT_RIGHT), (450, 0))
    img.paste(img.crop((0, 0, 900, 450)).transpose(Image.FLIP_TOP_BOTTOM), (0, 450))
    img.save(os.path.join(PUB, "textures", "paper.jpg"), quality=84, optimize=True)


def grain():
    s = 256
    g = RNG.normal(128, 38, (s, s)).clip(0, 255).astype(np.uint8)
    alpha = np.full((s, s), 255, np.uint8)
    img = Image.merge("LA", (Image.fromarray(g), Image.fromarray(alpha)))
    img.save(os.path.join(PUB, "textures", "grain.png"), optimize=True)


# --------------------------------------------------------------------- photos
PALETTES = [
    [(214, 160, 102), (120, 74, 52), (232, 210, 170), (70, 52, 46)],   # late sun
    [(160, 178, 170), (82, 98, 96), (226, 214, 190), (44, 50, 52)],    # beach grey
    [(196, 112, 86), (98, 46, 40), (240, 196, 150), (40, 28, 26)],     # bar light
    [(150, 168, 120), (70, 88, 60), (222, 220, 188), (36, 40, 30)],    # garden
    [(120, 140, 176), (52, 60, 92), (220, 206, 196), (28, 30, 46)],    # dusk
    [(222, 186, 132), (150, 98, 64), (248, 232, 204), (88, 60, 44)],   # kitchen
]


def photo(path, seed):
    rng = np.random.default_rng(seed)
    w, h = 800, 800
    pal = PALETTES[seed % len(PALETTES)]
    img = Image.new("RGB", (w, h), pal[3])
    arr = np.asarray(img, np.float32).copy()
    yy, xx = np.mgrid[0:h, 0:w]
    # horizon split
    horizon = rng.uniform(0.35, 0.65) * h
    top = np.array(pal[2], np.float32)
    bot = np.array(pal[1], np.float32)
    t = np.clip((yy - horizon) / (h * 0.25) + 0.5, 0, 1)[..., None]
    arr = top * (1 - t) + bot * t
    # out-of-focus figures / shapes
    for _ in range(rng.integers(3, 7)):
        cx, cy = rng.uniform(0.1, 0.9) * w, rng.uniform(0.3, 0.95) * h
        rx, ry = rng.uniform(60, 190), rng.uniform(90, 260)
        c = np.array(pal[rng.integers(0, 4)], np.float32)
        d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
        m = np.clip(1.2 - d, 0, 1)[..., None] ** 1.5
        arr = arr * (1 - m * 0.85) + c * m * 0.85
    im = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(22))
    arr = np.asarray(im, np.float32)
    # light leak
    lx = rng.choice([0, w])
    leak = np.exp(-(((xx - lx) / (w * 0.35)) ** 2)) [..., None] * np.array([255, 150, 70], np.float32)
    arr = arr + leak * rng.uniform(0.15, 0.35)
    # fade + warm film curve
    arr = arr * 0.86 + 22
    arr[..., 2] *= 0.92
    # vignette
    v = 1 - 0.45 * (((xx - w / 2) / (w * 0.75)) ** 2 + ((yy - h / 2) / (h * 0.75)) ** 2)
    arr *= v[..., None]
    arr += rng.normal(0, 9, (h, w, 1))
    Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(path, quality=80, optimize=True, progressive=True)


# ---------------------------------------------------------------------- audio
SR = 44100
NOTES = {"C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0,
         "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99, "A3": 220.0,
         "F3": 174.61, "G3": 196.0, "E3": 164.81}


def tone(freq, dur, amp=0.18):
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, t / 0.012) * np.exp(-t * 2.4)
    w = (np.sin(2 * np.pi * freq * t) + 0.32 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 4)
         + 0.08 * np.sin(6 * np.pi * freq * t) * np.exp(-t * 6))
    return amp * env * w


def placeholder_track(seed, seconds):
    rng = np.random.default_rng(seed)
    out = np.zeros(int(SR * seconds), np.float32)
    keys = list(NOTES.values())
    pos = 0.6
    while pos < seconds - 2.5:
        chord = rng.choice(keys, size=rng.integers(1, 3), replace=False)
        for f in chord:
            seg = tone(f, 2.6, 0.14 / len(chord))
            i = int(pos * SR)
            out[i:i + len(seg)] += seg[: len(out) - i]
        pos += rng.choice([0.6, 0.9, 1.2, 1.5])
    # faint room tone so it reads like a real recording
    out += np.convolve(rng.normal(0, 0.004, len(out)), np.ones(30) / 30, "same")
    fade = np.minimum(1, np.minimum(np.arange(len(out)), len(out) - np.arange(len(out))) / (SR * 0.4))
    return (out * fade).astype(np.float32)


def write_m4a(samples, path):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    with wave.open(tmp, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((np.clip(samples, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-c:a", "aac", "-b:a", "64k",
                    "-movflags", "+faststart", path], check=True)
    os.remove(tmp)


if __name__ == "__main__":
    for d in ("audio", "photos", "textures"):
        os.makedirs(os.path.join(PUB, d), exist_ok=True)
    walnut(); paper(); grain()
    print("textures done")
    photo_ids = range(1, 22)
    for i in photo_ids:
        photo(os.path.join(PUB, "photos", f"tape-{i:02d}.jpg"), i)
    print("photos done")
    for i in range(1, 22):
        secs = float(np.random.default_rng(i).integers(14, 34))
        write_m4a(placeholder_track(i, secs), os.path.join(PUB, "audio", f"tape-{i:02d}.m4a"))
    write_m4a(placeholder_track(99, 30), os.path.join(PUB, "audio", "for-you.m4a"))
    print("audio done")
