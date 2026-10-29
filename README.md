# dsh-cost-balance-chip

A DeepSeek Harness (DSH) Web plugin that puts **this conversation's estimated spend** and the **account balance** beside the message composer.

```text
┌─────────────────────────────┐
│ ● 本次   ¥15.93            │
│   余额   ¥13.35            │
└─────────────────────────────┘
```

A community plugin, not an official DeepSeek package. The spend figure is an estimate; the platform bill remains authoritative.

Repository: <https://github.com/jieyueriluo/DSH_balance-chip> · npm: <https://www.npmjs.com/package/dsh-cost-balance-chip>

## What it does

- Adds a compact two-line chip to `conversation.input.right`, the right-hand control cluster inside the composer card, immediately before the model selector.
- **本次 / This chat** — estimated spend for the current Session, computed from the durable `tokenUsage` projection and the selected model's reference unit prices.
- **余额 / Balance** — the account's available balance (topped-up wallet + granted wallet). Refreshes on mount, every 30 seconds, when the page becomes visible, and shortly after each usage settlement.
- Click the chip for a detail panel:
  - model and cache-hit rate;
  - input, output, cache-read, and cache-write token counts;
  - the cost contributed by each bucket;
  - topped-up and granted wallets, last refresh time, and a manual refresh control.
- The leading dot pulses while the Session is running.
- Follows the DSH UI language (`zh` / `en`) and the active light/dark theme.
- If the balance cannot be read, the chip shows `—` instead of inventing a zero; the panel states the reason and offers a retry.

## Install

From npm, into any DSH profile:

```sh
dsh plugin --profile <profile> add dsh-cost-balance-chip
```

Or from this checkout:

```sh
dsh plugin --profile <profile> add <absolute-path-to-this-directory>
```

The bundle patch inserts the `cost-balance-chip` row. Restart or let the profile's HMR reload the Web page after installing.

## Pricing

The client has no billing API, so spend is estimated from provider-reported token buckets. Reference unit prices are CNY per one million tokens:

```js
const DEFAULT_PRICING = { input: 2, cacheRead: 0.2, cacheWrite: 2, output: 3 }
const MODEL_PRICING = {
  'deepseek-flash': DEFAULT_PRICING,
  'deepseek-v4-pro': { input: 4, cacheRead: 0.4, cacheWrite: 4, output: 12 },
}
```

- `input` — uncached input tokens.
- `cacheRead` — cache-hit tokens.
- `cacheWrite` — cache-write tokens.
- `output` — output tokens.

Edit `client.js` and reload the page if your account's price list differs. The panel shows the rates in force.

**Limitation:** when a Session switches models, all of its tokens are currently priced at the latest selected model. A per-request split would require reading the full Session log and segmenting by request header.

## How it works

- Spend: `useProjection('tokenUsage')` from `@deepseek-ai/dsh-token-meter`, which folds the complete durable Session log into four disjoint buckets.
- Model: `useProjection('modelSelection')`, using `next.model` and falling back to `lastUsed.model`.
- Balance: `ctx.remote.account.getBalance(clientMetadata)`, with the plugin explicitly injecting the `remote.account` namespace.
- Running state: the Session standard hook; it only drives the pulse animation.
- No Host half is needed: `index.js` exports an empty `apply()`.

The plugin never reads or uploads credentials. The balance request goes through DSH's own `remote.account` proxy.

## Compatibility

- DSH `>=0.2.1-rc.3` (declared in `engines.dsh`).
- Web Client only; no model-facing tools or prompts are registered.
- No React or DSH Client package imports beyond the platform's `react` / `react-dom` seed modules.

## Files

```text
dsh-cost-balance-chip/
├── client.js          # chip, detail panel, balance polling
├── index.js           # empty Host half
├── cordis.patch.yml   # inserts the loader row
├── package.json       # bundle / client declaration
├── icon.svg
├── locale/{zh,en}.json
├── market/index.json  # optional self-hosted DSH market index
├── docs/market/       # the same index served by GitHub Pages
├── tests/package.test.mjs
├── PUBLISHING.md      # release and community-posting checklist
└── ANNOUNCEMENT.*.md  # ready-to-post community announcement drafts
```

## English summary

A composer chip for DSH showing the current conversation's estimated cost and the account's available balance, with a click-through token/cost breakdown. Costs are estimated from the `tokenUsage` projection and reference prices; the balance is read through DSH's account Remote. MIT licensed, no credentials touched.

## License

MIT. See [LICENSE](LICENSE).
