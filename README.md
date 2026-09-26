# Tiny Play — toddler learning games (ages 2–5)

11 mini-games in the style of "Preschool Games for Toddler 2+" / "Toddler Learning Games for 2+".
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
| 🔢 Number Baskets | sort by quantity |
| 🧺 Memory | memory pairs |
| 🧸 Tidy Up | categories (toys/clothes, fruit/veg, sea/farm, fly/drive) |
| ⭐ Find Shapes | visual search |
| 🦒 Shadow Match | match object to silhouette |

## Run
- Quick: open `index.html` in a browser.
- On iPad/phone (offline + full-screen): serve the folder, e.g. `python3 -m http.server 8080`,
  open `http://<your-mac-ip>:8080` in Safari → Share → **Add to Home Screen**.

## Add a game
Create `js/games/<id>.js` calling `Games.register({ id, title, icon, bg, start(stage) })`,
add a `<script>` tag in `index.html` and the file to `sw.js`. Use `Drag.make`, `Reward.round`,
`Engine.prompt`, `Sound.*`, `Fx.*` from `js/engine.js`.
