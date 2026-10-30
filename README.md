# Merca Stay: the unofficial Holiday Department

An affectionate personal parody made for Jordi. This is not the official Merca Stay website and does not imply Marc's or the company's endorsement.

## What's here

- A responsive static page with original vector artwork and a local holiday-excuse generator.
- An original 60-second 1920 × 1080, 30 fps motion-graphics film, with a synthesised instrumental soundtrack.
- Timed English visual descriptions and a readable transcript. Playback is visitor-initiated.
- The complete [adapted creative prompt and storyboard](showreel-prompt.md).
- Reproducible animation and music source in `film/`.

No booking form, analytics, cookies, remote scripts or private source materials. The fictional department, job titles and jokes are clearly labelled. Artwork depicts imaginary architecture, not actual properties. The film does not use anyone's likeness or voice.

## Public factual sources

- [Merca Stay Apartments](https://www.merca-stay-apartments.com/): names of its Barcelona and Sitges apartments.
- [Marc Mercadé Soler](https://es.linkedin.com/in/marc-mercad%C3%A9-soler-4b096513): public professional identity.

Checked 30 October 2026. For current facilities, availability and bookings, use the real business's website. No guest quotes, ratings, prices or service promises have been invented.

## Local preview

Run `python3 -m http.server 48731 --bind 127.0.0.1` from this folder, then open `http://127.0.0.1:48731/`.

## Rebuild the film

Prerequisites: Node.js, the pinned Playwright dependency with Chromium installed, Python 3 with numpy, and ffmpeg. The renderer permits localhost requests only. It closes its isolated browser when complete.

1. Start the local preview server.
2. Run `RENDER_DIR=render npm run render`.
3. Run `python3 film/music.py render/music.wav`.
4. Assemble the picture and original music:

```sh
ffmpeg -y -f concat -safe 0 -i render/concat.txt -i render/music.wav \
  -c:v copy -c:a aac -ar 48000 -b:a 160k -af loudnorm=I=-19:TP=-2:LRA=8 \
  -t 60 -movflags +faststart assets/merca-stay-showreel.mp4
```

The shipped website needs no build step. GitHub Pages can serve the repository root on `main`.

## Creative credits

Concept commissioned by Jordi. Original copy, vector artwork, motion code and synthesised score produced for this tribute. The format adapts Jordi's earlier minimalist motion-design showreel brief. No original company footage, music or internal documents are included.
