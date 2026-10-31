# Merca Stay: an unofficial redesign concept

An unofficial redesign concept of [merca-stay-apartments.com](https://www.merca-stay-apartments.com/), made by Jordi. It is not the official Merca Stay website, it is not affiliated with Merca Stay SLU and it implies no endorsement. To book a flat, use the official site or contact Merca Stay directly.

Live page: https://georgestam.github.io/merca-stay-unofficial/

## What's here

- The site, at the root: the home page, a page for each of the six flats, and Book, Services, Sustainability, House rules, Owners, Guide, Reviews, Contact, Privacy, Sources and a 404 page. It is static HTML, CSS and one small script, with no analytics, cookies or remote scripts. The fonts are self-hosted.
- `film/`: "But wait, there's more!", an 82 second infomercial concept film (1920 × 1080, 30 frames a second) with the captions built into the picture, a poster, and a full transcript under the player on the home page. It is a concept made for this redesign, not a Merca Stay production. It plays only when a visitor presses play.
- `v2/`: the previous page, "Six Keys", kept as it was, with its two films.
- `v1/`: the first version, kept as it was.

## Forms

The availability and enquiry forms send nothing from this site and store nothing. They write the message for the visitor, who sends it to Marc themselves by WhatsApp or email. The contact details are the ones on the official site.

## Credits

- **Photos:** © Merca Stay, from its official website, with its watermarks as published. Two street photos on the 2 de Mayo page have the passers-by's faces softened, and the flamenco photo is cropped to the dancer's hand and shawl.
- **Cartoons of the host:** AI-generated illustrations. The host's real face appears nowhere on the site or in the film.
- **Film voices:** the ElevenLabs voices Bill (the announcer) and Alice (the small print).
- **Film music and sound effects:** generated with ElevenLabs Music and Sound Effects through fal.ai.
- **Fonts:** Instrument Sans and Instrument Serif, under the SIL Open Font License.
- **The previous versions** keep their own credits in `v2/` and `v1/`.
- **Made by** Jordi.

## Local preview

Run `python3 -m http.server 48731 --bind 127.0.0.1` in this folder, then open http://127.0.0.1:48731/.
