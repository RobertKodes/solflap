# solflap

Live Solana mainnet as a mechanical **split-flap arrivals board**.

Programs land like flights. Delay = fee pressure. Cancelled = failed txs.
Not an explorer. Not a newspaper. Not a dashboard.

**Live:** https://robertkodes.github.io/solflap/

Click **Open** first. Flaps stay shut until the board is armed — same gesture as Hearslot / vfdrack.

## Design tokens

Late-night terminal hall. Matte chassis, cream/amber tiles, one cancel slam.

| Token | Hex | Role |
| --- | --- | --- |
| void | `#0a0a0b` | Hall / page field |
| chassis | `#141210` | Board body |
| tile | `#1b1813` | Flap face |
| cream | `#ead8b6` | Flap type, mast |
| amber | `#d39a46` | Clock, slot, delayed, live jewel |
| cancel | `#c24a28` | CANCELLED slam |

**Type**

- Display — **Barlow Condensed** (mast, flap glyphs, Open). Industrial, tight, station-board.
- Mono — **IBM Plex Mono** (column labels, weather strip, error copy). Codes and the desk.

No Inter. No purple. No hero stack.

## Columns

Each row is a flight. Older rows sit at the top and roll off when the board is full (~12 rows).

| Column | Meaning |
| --- | --- |
| **FLT** | `SF` + last four of the signature |
| **DESTINATION** | Known program nickname (JUPITER, RAYDIUM, TOKEN…) or a short id |
| **SLOT** | Confirmed slot for that signature |
| **REMARKS** | `ON TIME` · `DELAYED` · `CANCELLED` |

- **ON TIME** — confirmed, window is calm.
- **DELAYED** — recent priority fees / congestion samples are elevated for that poll window (fee p90, fee pressure, or TPS).
- **CANCELLED** — signature `err` is set. Those tiles slam shut in red/ochre.

Footer is one weather line: current slot, CLEAR / HAZY / STORM / HOLD, sample TPS, fee calm/warm/heavy. Not a chart.

`prefers-reduced-motion` skips the flip and settles the character instantly.

## Run

```bash
npm i
npm run dev
```

Open the `/solflap/` path Vite prints (`base` is set for GitHub Pages).

```bash
npm run build
npm run preview
npm test
```

## RPC

Default is `https://solana-rpc.publicnode.com`. Official `api.mainnet-beta.solana.com` often 403s browser Origins (this Pages site, localhost), so the board starts on PublicNode and hops if an endpoint blocks us. It also backs off on 429s.

Human copy on 403 / 429 — no JSON dumps.

If you have a Helius / Triton / etc URL:

```bash
cp .env.example .env
# edit VITE_RPC_URL
```

No wallets. No seeds. No trading.

## Pages

`vite.config.ts` has `base: '/solflap/'`. The `gh-pages` branch is the built `dist/` (includes `.nojekyll`). Repo Settings → Pages → Deploy from branch → `gh-pages` / root.
