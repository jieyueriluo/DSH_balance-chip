# Plugin: dsh-cost-balance-chip — conversation cost and balance beside the composer

A small DSH Web plugin that puts **this conversation's estimated spend** and the **account's available balance** beside the message composer. Click it for the token and cost breakdown.

```text
● This chat   ¥15.93
  Balance     ¥13.35
```

## Install

```sh
dsh plugin --profile <profile> add dsh-cost-balance-chip
```

Refresh the DSH page (or let the profile's HMR reload) after installation.

## Features

- Registers in `conversation.input.right`, just before the model selector.
- **Spend** is estimated from the durable `tokenUsage` projection across input, output, cache-read, and cache-write buckets.
- **Balance** is read through `remote.account` (topped-up + granted wallets) on mount, every 30 seconds, after each usage settlement, and when the page becomes visible again.
- Click through for the model, token counts, cache-hit rate, cost per bucket, both wallets, and the last refresh time.
- Localized in Chinese and English; follows the active DSH theme.
- If the balance cannot be read, the chip shows `—` rather than a fabricated zero, and the panel offers a retry.

## Notes

- Spend is an **estimate**; the platform bill remains authoritative.
- Default reference prices (CNY per 1M tokens): `deepseek-flash` input 2 / cache 0.2 / output 3; `deepseek-v4-pro` input 4 / cache 0.4 / output 12. Adjust them in `client.js`.
- When a Session switches models, all tokens are currently priced at the latest model. This is a known limitation.
- The plugin never reads or uploads credentials; balance requests go through DSH's own `remote.account` proxy.

## Links

- npm: <https://www.npmjs.com/package/dsh-cost-balance-chip>
- GitHub: <https://github.com/jieyueriluo/DSH_balance-chip>

Feedback and issue reports are welcome.
