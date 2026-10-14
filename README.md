# Chess-Sweeper

Minesweeper played on a famous chess position. The pieces are the mines, and the numbers count attackers instead of neighbours.

Live (once published): https://chess-sweeper.jor.dev

## Rules

- A random famous position is hidden under fog. Its name stays secret until the game ends. All 36 positions are sparse, with 4 to 13 pieces: endings from famous games, fortress, stalemate and zugzwang classics, and endgame studies and problems.
- Tap a square to reveal it. If a piece stands there, it is captured and you lose. Each game starts with a random square with no attackers already opened, so it starts with an open area. The opening always leaves at least 5 safe squares to find.
- An empty square shows how many pieces, of both colours, attack it. A square nobody attacks opens its neighbours automatically.
- Mark a hidden square with the exact piece you think stands there, such as a black knight: right-click, long-press on touch, or turn on **Mark mode** and tap, then choose the piece in the small picker (or **Clear**). On the keyboard, press **M** on the focused square. The picker highlights the last piece you chose, so repeat marks are quick. A marked square cannot be revealed until you clear its mark. The ♟︎ counter shows hidden pieces minus marks placed.
- When the game ends every mark is graded: green tick for the exact piece, amber outline for a square that holds a different piece, red ✗ for an empty square. The result panel sums them up.
- Reveal every empty square to win. The result panel below the board then tells you which position it was.
- Every game uses a new position. **New game**, changing the mode or difficulty, and **New random position** in the result panel always pick a position different from the current one.

## Modes

- **One side shown** (default): White's or Black's pieces, picked at random each game, are visible from the start and cannot be clicked.
- **Both sides hidden**: nothing is shown.

## Difficulty

New positions are drawn from a pool filtered by piece count. The choice is remembered between visits.

- **All** (default): any position.
- **Easy**: 5 pieces or fewer.
- **Medium**: 6 to 8 pieces.
- **Hard**: 9 pieces or more.

## Run locally

ES modules need an HTTP server, so `file://` will not work.

```sh
nvm use 26
npm install
npm run serve
```

Then open http://localhost:6767.

Dev URL parameters: `?pos=<id>` forces the first position, `?fen=<placement>` loads an ad-hoc board for the first game, and `?mode=one|hidden` preselects the mode. Later games are random again.

## Adding a position

1. Add an entry to `src/positions.js` (`id`, `kind`, `name`, `white`, `black`, `event`, `year`, `result`, `moveNote`, `blurb`, `link`, plus either a `pgn` with optional `ply`, or a direct `fen`). See `scripts/build-positions.js` for the field order. Keep it to about 12 pieces or fewer; crowded boards are too hard. `npm run positions` rejects a position unless at least one square with no attackers opens an area that still leaves 5 or more safe squares to find; `npm run stats` shows how many squares each possible opening leaves.
2. Run `npm run positions` to replay any PGNs, validate every FEN with chess.js and rewrite the file.
3. Run `npm run stats` and check that the new position has enough zero squares to be fun. The `openings` column counts the zero-attack squares that make a fair start, meaning their cascade still leaves at least 5 safe squares to find, and `leftAfter` gives the range of safe squares those openings leave hidden.

## Hosting

The site is plain static files with relative paths, so it works on GitHub Pages at a custom domain or under a `/repo/` path.

- `favicon.svg`, `favicon.ico` and `apple-touch-icon.png` are the jor.dev icon set, copied to the root by the brand install script, and the 1200x630 `og-image.png` social preview sits next to them. The Open Graph tags and canonical link in `index.html` use absolute `https://chess-sweeper.jor.dev/` URLs.
- The shared jor.dev footer at the end of the page explains the game and credits Wikipedia and the GitHub source. `robots.txt` and `sitemap.xml` point crawlers at the canonical URL.
- `CNAME` contains `chess-sweeper.jor.dev` and `.nojekyll` disables Jekyll.
- Add a DNS CNAME record `chess-sweeper` pointing to `<user>.github.io`.
- In the repository settings, enable Pages from the `main` branch, root folder.

## Credits

The favicon, the wordmark and the fonts come from my jor.dev brand kit in `brand/`: the logo is set in Space Mono and the text in Montserrat, both under the SIL Open Font License 1.1 (see `brand/fonts/SpaceMono-OFL.txt`). The piece glyphs are whatever chess symbol font your system has.
