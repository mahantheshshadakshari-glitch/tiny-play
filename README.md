# Tiny Play — toddler learning games (ages 2–5)

20 mini-games inspired by "Preschool Games for Toddler 2+", "Toddler Learning Games for 2+" and "Ocean Preschool",
with Ollie the octopus as an animated guide who talks, cheers and dances.
Pure HTML/CSS/JS — no build step, no dependencies, no audio or image files (art is SVG + emoji,
sounds are synthesized with Web Audio, voice uses the device's speech synthesis).

| Game | Skill |
|---|---|
| 🚌 Color Bus | sort by color |
| 🔺 Shape Sorter | match shapes to outlines |
| 🐶 Feed Animals | logic — which food for which animal |
| 🎈 Balloon Pop | tapping, counting to 10 |
| 🐘 Big & Small | sort by size |
| 🍲 Counting Pot | counting 1–5 |
| 🔢 Number Baskets | sort by quantity, levels up to 20, tap to count |
| 🧺 Memory | memory pairs |
| 🧸 Tidy Up | categories (toys/clothes, fruit/veg, sea/farm, fly/drive) |
| ⭐ Find Shapes | visual search |
| 🦒 Shadow Match | match object to silhouette |
| 🥚 Surprise Egg | tap to crack — cause & effect |
| 🧪 Potion Mix | color mixing |
| 🐮 Farm Friends | animal names & sounds |
| 🪥 Brush Teeth | scrubbing, fine motor |
| 🐠 Ocean Stickers | free-play sticker scene |
| 🎨 Pixel Art | color by dots |
| 🚂 Pattern Train | patterns AB → ABC |
| 🎁 Gift Wrap | sort by color & pattern |
| 🔤 Letter Bubbles | letters A–Z |

## Run
- Quick: open `index.html` in a browser.
- On iPad/phone (offline + full-screen): serve the folder, e.g. `python3 -m http.server 8080`,
  open `http://<your-mac-ip>:8080` in Safari → Share → **Add to Home Screen**.

## Add a game
Create `js/games/<id>.js` (and optional `css/games/<id>.css`) calling `Games.register({ id, title, icon, bg, start(stage) })`,
add a `<script>` tag in `index.html` and the file to `sw.js`. Use `Drag.make`, `Reward.round`,
`Engine.prompt`, `Sound.*`, `Fx.*` from `js/engine.js`.
