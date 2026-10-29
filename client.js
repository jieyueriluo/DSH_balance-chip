window.__ModuleLoader__.load({
  id: 'dsh-cost-balance-chip',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement

    const NS = 'dsh-cost-balance-chip'
    const BALANCE_REFRESH_MS = 30_000
    const POST_USAGE_REFRESH_MS = 2_500

    /**
     * Reference unit prices in CNY per one million tokens.
     *
     * The platform does not expose a per-session billing record to the client,
     * so this card estimates spend from the durable `tokenUsage` projection.
     * Adjust these numbers when the account's price list changes.
     */
    const DEFAULT_PRICING = { input: 2, cacheRead: 0.2, cacheWrite: 2, output: 3 }
    const MODEL_PRICING = {
      'deepseek-flash': DEFAULT_PRICING,
      'deepseek-v4-pro': { input: 4, cacheRead: 0.4, cacheWrite: 4, output: 12 },
    }
    const CURRENCY_SYMBOL = '¥'

    const DICTS = {
      zh: {
        'chip.session': '本次',
        'chip.balance': '余额',
        'chip.aria': '本次对话预估花费',
        'chip.ariaMid': '，',
        'chip.ariaEnd': '，点击查看 Token 与余额明细',
        'chip.loading': '读取中',
        'chip.empty': '未获取',
        'panel.title': '本次对话费用与余额',
        'panel.eyebrow': '本次对话预估花费',
        'panel.model': '模型',
        'panel.modelUnknown': '尚未选择',
        'panel.running': '运行中',
        'panel.tokens': 'Token 用量',
        'panel.input': '输入',
        'panel.output': '输出',
        'panel.cacheRead': '缓存命中',
        'panel.cacheWrite': '缓存写入',
        'panel.totalTokens': '合计',
        'panel.cacheHit': '缓存命中率',
        'panel.cost': '费用构成',
        'panel.costInput': '输入',
        'panel.costCacheRead': '缓存命中',
        'panel.costCacheWrite': '缓存写入',
        'panel.costOutput': '输出',
        'panel.rate': '参考单价（元 / 百万 Token）',
        'panel.rateSep': '：',
        'panel.rateValue': '输入 {input} · 缓存 {cache} · 输出 {output}',
        'panel.balance': '账户余额',
        'panel.wallet': '充值余额',
        'panel.bonus': '赠送余额',
        'panel.balanceEmpty': '未获取到余额',
        'panel.balanceUnavailable': '当前账户或连接不可用',
        'panel.updated': '更新于',
        'panel.error': '余额读取失败，可点击刷新重试',
        'panel.refresh': '刷新余额',
        'panel.note': '费用按 Token 用量与参考单价估算，实际扣费以平台账单为准。余额每 30 秒及每轮对话结束后刷新。',
      },
      en: {
        'chip.session': 'This chat',
        'chip.balance': 'Balance',
        'chip.aria': 'Estimated spend for this conversation',
        'chip.ariaMid': '. ',
        'chip.ariaEnd': '. Click for the token and balance breakdown.',
        'chip.loading': 'Loading',
        'chip.empty': 'Unavailable',
        'panel.title': 'Conversation cost and balance',
        'panel.eyebrow': 'Estimated spend for this conversation',
        'panel.model': 'Model',
        'panel.modelUnknown': 'Not selected',
        'panel.running': 'Running',
        'panel.tokens': 'Token usage',
        'panel.input': 'Input',
        'panel.output': 'Output',
        'panel.cacheRead': 'Cache read',
        'panel.cacheWrite': 'Cache write',
        'panel.totalTokens': 'Total',
        'panel.cacheHit': 'Cache hit rate',
        'panel.cost': 'Cost breakdown',
        'panel.costInput': 'Input',
        'panel.costCacheRead': 'Cache read',
        'panel.costCacheWrite': 'Cache write',
        'panel.costOutput': 'Output',
        'panel.rate': 'Reference price (CNY / 1M tokens)',
        'panel.rateSep': ': ',
        'panel.rateValue': 'input {input} · cache {cache} · output {output}',
        'panel.balance': 'Account balance',
        'panel.wallet': 'Topped-up balance',
        'panel.bonus': 'Granted balance',
        'panel.balanceEmpty': 'No balance available',
        'panel.balanceUnavailable': 'Account or connection unavailable',
        'panel.updated': 'Updated',
        'panel.error': 'Could not read the balance; click refresh to retry',
        'panel.refresh': 'Refresh balance',
        'panel.note': 'Spend is estimated from token usage and reference prices; the platform bill remains authoritative. The balance refreshes every 30 seconds and after each turn.',
      },
    }

    const CSS = `
      .dsh-cm-trigger {
        box-sizing: border-box;
        appearance: none;
        display: inline-grid;
        grid-template-columns: auto auto;
        grid-auto-rows: 12px;
        align-items: center;
        column-gap: 6px;
        height: 28px;
        padding: 1px 9px;
        border: 0.5px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.24));
        border-radius: 999px;
        background: var(--dsw-specific-selector, transparent);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 10px;
        line-height: 12px;
        white-space: nowrap;
        cursor: pointer;
        flex: none;
        transition: background-color 0.12s ease, border-color 0.12s ease;
      }
      .dsh-cm-trigger:hover {
        background: var(--dsw-alias-interactive-bg-hover);
        border-color: var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.4));
      }
      .dsh-cm-trigger:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsh-cm-label {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 9.5px;
        letter-spacing: 0.02em;
      }
      .dsh-cm-value {
        justify-self: end;
        color: var(--dsw-alias-label-primary);
        font-size: 11px;
        font-variant-numeric: tabular-nums;
      }
      .dsh-cm-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--dsw-alias-state-business-primary);
        opacity: 0.35;
      }
      .dsh-cm-trigger[data-running="true"] .dsh-cm-dot {
        opacity: 1;
        animation: dsh-cm-pulse 1.4s ease-in-out infinite;
      }
      @keyframes dsh-cm-pulse {
        0%, 100% { transform: scale(1); opacity: 0.45; }
        50% { transform: scale(1.35); opacity: 1; }
      }
      .dsh-cm-panel {
        position: fixed;
        z-index: 1200;
        box-sizing: border-box;
        padding: 14px;
        border: 0.5px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22));
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1, var(--dsw-alias-bg-base, #fff));
        box-shadow: var(--dsw-elevation-panel, 0 12px 32px rgba(0, 0, 0, 0.18));
        -webkit-backdrop-filter: var(--dsw-menu-backdrop-filter, blur(18px));
        backdrop-filter: var(--dsw-menu-backdrop-filter, blur(18px));
        color: var(--dsw-alias-label-primary);
        font-size: 12px;
        line-height: 1.5;
        max-height: min(460px, calc(100vh - 96px));
        overflow-y: auto;
        overscroll-behavior: contain;
        animation: dsh-cm-in 0.12s ease-out;
      }
      @keyframes dsh-cm-in {
        from { opacity: 0; transform: translateY(4px) scale(0.99); }
        to { opacity: 1; transform: none; }
      }
      .dsh-cm-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .dsh-cm-eyebrow {
        color: var(--dsw-alias-label-tertiary);
        font-size: 10px;
        letter-spacing: 0.04em;
      }
      .dsh-cm-total {
        margin-top: 2px;
        color: var(--dsw-alias-label-primary);
        font-size: 23px;
        font-weight: 600;
        line-height: 1.15;
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
      }
      .dsh-cm-sub {
        margin-top: 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-cm-sub-running {
        color: var(--dsw-alias-state-business-primary);
      }
      .dsh-cm-icon-btn {
        appearance: none;
        display: grid;
        place-items: center;
        flex: none;
        width: 26px;
        height: 26px;
        padding: 0;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--dsw-alias-label-tertiary);
        cursor: pointer;
      }
      .dsh-cm-icon-btn:hover:not(:disabled) {
        background: var(--dsw-alias-interactive-bg-hover);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-cm-icon-btn:disabled { cursor: default; opacity: 0.6; }
      .dsh-cm-icon-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsh-cm-refresh[data-busy="true"] { animation: dsh-cm-spin 0.9s linear infinite; }
      @keyframes dsh-cm-spin { to { transform: rotate(360deg); } }
      .dsh-cm-section {
        margin-top: 12px;
        padding-top: 10px;
        border-top: 0.5px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.2));
      }
      .dsh-cm-section-title {
        margin-bottom: 6px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 10px;
        letter-spacing: 0.04em;
      }
      .dsh-cm-rows {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin: 0;
      }
      .dsh-cm-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin: 0;
      }
      .dsh-cm-row dt {
        color: var(--dsw-alias-label-tertiary);
        font-weight: 400;
      }
      .dsh-cm-row dd {
        margin: 0;
        color: var(--dsw-alias-label-primary);
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .dsh-cm-row-strong dt {
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-cm-row-strong dd {
        font-weight: 600;
      }
      .dsh-cm-updated {
        margin-top: 6px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 10px;
      }
      .dsh-cm-error {
        margin-top: 6px;
        color: var(--dsw-alias-state-error-primary, #d33);
        font-size: 10px;
      }
      .dsh-cm-note {
        margin: 12px 0 0;
        padding-top: 10px;
        border-top: 0.5px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.2));
        color: var(--dsw-alias-label-tertiary);
        font-size: 10px;
        line-height: 1.55;
      }
      @media (prefers-reduced-motion: reduce) {
        .dsh-cm-trigger[data-running="true"] .dsh-cm-dot { animation: none; opacity: 1; }
        .dsh-cm-panel { animation: none; }
        .dsh-cm-refresh[data-busy="true"] { animation: none; }
      }
    `

    function installCss() {
      const tagId = 'dsh-cost-balance-chip/meter.css'
      if (document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') !== null) return
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-cost-balance-chip'
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    function asTokenCount(value) {
      const number = Number(value)
      return Number.isFinite(number) && number > 0 ? number : 0
    }

    function formatTokens(value) {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(asTokenCount(value))
    }

    function formatMoney(value, symbol = CURRENCY_SYMBOL) {
      const number = Number(value)
      if (!Number.isFinite(number)) return symbol + '—'
      const absolute = Math.abs(number)
      const digits = absolute === 0 ? 2 : absolute < 0.01 ? 6 : absolute < 1 ? 4 : 2
      return symbol + number.toFixed(digits)
    }

    function formatRate(value) {
      const number = Number(value)
      return Number.isFinite(number) ? String(number) : '—'
    }

    function walletSymbol(currency) {
      return currency === 'USD' ? '$' : CURRENCY_SYMBOL
    }

    function walletMoney(wallet) {
      return formatMoney(Number(wallet?.balance), walletSymbol(wallet?.currency))
    }

    function pricingFor(model) {
      const key = typeof model === 'string' ? model.toLowerCase() : ''
      if (MODEL_PRICING[key] !== undefined) return MODEL_PRICING[key]
      if (key.includes('pro')) return MODEL_PRICING['deepseek-v4-pro']
      return DEFAULT_PRICING
    }

    function estimateCost(usage, pricing) {
      const inputTokens = asTokenCount(usage?.uncachedInputTokens)
      const outputTokens = asTokenCount(usage?.outputTokens)
      const cacheReadTokens = asTokenCount(usage?.cacheReadTokens)
      const cacheWriteTokens = asTokenCount(usage?.cacheWriteTokens)
      const input = (inputTokens * pricing.input) / 1_000_000
      const cacheRead = (cacheReadTokens * pricing.cacheRead) / 1_000_000
      const cacheWrite = (cacheWriteTokens * pricing.cacheWrite) / 1_000_000
      const output = (outputTokens * pricing.output) / 1_000_000
      return {
        inputTokens,
        outputTokens,
        cacheReadTokens,
        cacheWriteTokens,
        totalTokens: inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens,
        input,
        cacheRead,
        cacheWrite,
        output,
        total: input + cacheRead + cacheWrite + output,
      }
    }

    function accountClientMetadata(locale) {
      const release = globalThis.__DSH_BOOT__ && globalThis.__DSH_BOOT__.release
      const version = release && typeof release.version === 'string' && release.version !== ''
        ? release.version
        : '0.2.1-rc.3'
      return {
        version,
        locale,
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      }
    }

    function RefreshIcon({ busy }) {
      return h('svg', {
        className: 'dsh-cm-refresh',
        'data-busy': busy ? 'true' : 'false',
        width: 14,
        height: 14,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
      },
        h('path', {
          d: 'M13.1 5.8A5.4 5.4 0 1 0 13.4 10',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M13.1 2.9v3.2H9.9',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.account'],
      apply(ctx) {
        installCss()

        ctx.effect(function () {
          const offChinese = ctx.locale.register(NS, 'zh', DICTS.zh)
          const offEnglish = ctx.locale.register(NS, 'en', DICTS.en)
          return function () {
            offChinese()
            offEnglish()
          }
        }, 'dsh-cost-balance-chip: dictionaries')

        const t = ctx.locale.bind(NS)

        function useTranslate() {
          const force = React.useReducer(function (tick) { return tick + 1 }, 0)[1]
          React.useEffect(function () {
            return ctx.locale.subscribe(force)
          }, [])
          return t
        }

        function useBalance() {
          const [state, setState] = React.useState({
            status: 'loading',
            wallets: [],
            bonusWallets: [],
            updatedAt: 0,
          })
          const [refreshing, setRefreshing] = React.useState(false)
          const sequence = React.useRef(0)

          const load = React.useCallback(function (manual) {
            if (manual) setRefreshing(true)
            const current = ++sequence.current
            setState(function (previous) {
              return previous.status === 'ready' ? previous : { ...previous, status: 'loading' }
            })

            let account
            try {
              account = ctx.remote && ctx.remote.account
            } catch (error) {
              account = undefined
            }
            if (account === undefined || typeof account.getBalance !== 'function') {
              if (current === sequence.current) {
                setState(function (previous) { return { ...previous, status: 'unavailable' } })
                setRefreshing(false)
              }
              return
            }

            let request
            try {
              request = account.getBalance(accountClientMetadata(ctx.locale.getSnapshot().active))
            } catch (error) {
              request = Promise.reject(error)
            }

            Promise.resolve(request).then(function (result) {
              if (current !== sequence.current) return
              const value = result && result.ok ? result.value : null
              if (value === null || value === undefined) {
                setState({ status: 'empty', wallets: [], bonusWallets: [], updatedAt: Date.now() })
                return
              }
              if (value.status === 'ready') {
                setState({
                  status: 'ready',
                  wallets: Array.isArray(value.value) ? value.value : [],
                  bonusWallets: Array.isArray(value.bonusWallets) ? value.bonusWallets : [],
                  updatedAt: Date.now(),
                })
                return
              }
              setState(function (previous) { return { ...previous, status: 'error' } })
            }).catch(function () {
              if (current !== sequence.current) return
              setState(function (previous) { return { ...previous, status: 'error' } })
            }).finally(function () {
              if (current === sequence.current) setRefreshing(false)
            })
          }, [])

          React.useEffect(function () {
            let stopped = false
            load(false)
            const timer = window.setInterval(function () {
              if (!stopped && document.visibilityState === 'visible') load(false)
            }, BALANCE_REFRESH_MS)
            const onVisibilityChange = function () {
              if (document.visibilityState === 'visible') load(false)
            }
            document.addEventListener('visibilitychange', onVisibilityChange)
            return function () {
              stopped = true
              window.clearInterval(timer)
              document.removeEventListener('visibilitychange', onVisibilityChange)
              sequence.current += 1
            }
          }, [load])

          return { state, refreshing, refresh: function () { load(true) } }
        }

        function CostMeter({ useProjection, useSession }) {
          const translate = useTranslate()
          const usage = useProjection('tokenUsage')
          const modelSelection = useProjection('modelSelection')
          const running = useSession(function (session) { return session?.running === true })
          const balance = useBalance()

          const [open, setOpen] = React.useState(false)
          const [panelPosition, setPanelPosition] = React.useState(null)
          const triggerRef = React.useRef(null)
          const panelRef = React.useRef(null)
          const panelId = React.useId()

          const model = modelSelection?.next?.model ?? modelSelection?.lastUsed?.model ?? ''
          const pricing = pricingFor(model)
          const cost = React.useMemo(function () {
            return estimateCost(usage, pricing)
          }, [usage, pricing])

          const lastUsageKey = React.useRef(null)
          const usageKey = usage
            ? [cost.inputTokens, cost.outputTokens, cost.cacheReadTokens, cost.cacheWriteTokens].join(':')
            : ''
          React.useEffect(function () {
            if (usageKey === '') return
            const previous = lastUsageKey.current
            lastUsageKey.current = usageKey
            if (previous === null || previous === usageKey) return
            const timer = window.setTimeout(function () { balance.refresh() }, POST_USAGE_REFRESH_MS)
            return function () { window.clearTimeout(timer) }
          }, [usageKey])

          const placePanel = React.useCallback(function () {
            const trigger = triggerRef.current
            if (trigger === null) return
            const rect = trigger.getBoundingClientRect()
            const margin = 12
            const width = Math.min(320, Math.max(248, window.innerWidth - margin * 2))
            const maxRight = Math.max(margin, window.innerWidth - width - margin)
            const right = Math.min(Math.max(margin, window.innerWidth - rect.right), maxRight)
            const bottom = Math.max(margin, window.innerHeight - rect.top + 8)
            const maxHeight = Math.min(460, Math.max(180, rect.top - margin * 2))
            setPanelPosition({ right, bottom, width, maxHeight })
          }, [])

          React.useLayoutEffect(function () {
            if (!open) {
              setPanelPosition(null)
              return
            }
            placePanel()
            window.addEventListener('resize', placePanel)
            window.addEventListener('scroll', placePanel, true)
            return function () {
              window.removeEventListener('resize', placePanel)
              window.removeEventListener('scroll', placePanel, true)
            }
          }, [open, placePanel])

          React.useEffect(function () {
            if (!open) return
            const onPointerDown = function (event) {
              const target = event.target
              if (!(target instanceof Node)) return
              if (triggerRef.current?.contains(target) === true) return
              if (panelRef.current?.contains(target) === true) return
              setOpen(false)
            }
            const onKeyDown = function (event) {
              if (event.key !== 'Escape') return
              setOpen(false)
              triggerRef.current?.focus()
            }
            document.addEventListener('pointerdown', onPointerDown, true)
            document.addEventListener('keydown', onKeyDown)
            return function () {
              document.removeEventListener('pointerdown', onPointerDown, true)
              document.removeEventListener('keydown', onKeyDown)
            }
          }, [open])

          const wallets = balance.state.wallets.filter(function (wallet) {
            return wallet !== null && typeof wallet === 'object' && typeof wallet.balance === 'string'
          })
          const bonusWallets = balance.state.bonusWallets.filter(function (wallet) {
            return wallet !== null && typeof wallet === 'object' && Number(wallet.balance) > 0
          })
          const totalsByCurrency = new Map()
          for (const wallet of [...wallets, ...bonusWallets]) {
            const amount = Number(wallet.balance)
            if (!Number.isFinite(amount)) continue
            totalsByCurrency.set(wallet.currency, (totalsByCurrency.get(wallet.currency) ?? 0) + amount)
          }
          const primaryTotal = totalsByCurrency.has('CNY')
            ? { currency: 'CNY', amount: totalsByCurrency.get('CNY') }
            : [...totalsByCurrency].map(function ([currency, amount]) { return { currency, amount } })[0]
          const balanceText = balance.state.status === 'loading'
            ? '…'
            : primaryTotal === undefined
              ? '—'
              : formatMoney(primaryTotal.amount, walletSymbol(primaryTotal.currency))
          const balanceDescription = balance.state.status === 'loading'
            ? translate('chip.loading')
            : primaryTotal === undefined
              ? translate('chip.empty')
              : formatMoney(primaryTotal.amount, walletSymbol(primaryTotal.currency))
          const cacheHitRate = cost.inputTokens + cost.cacheReadTokens + cost.cacheWriteTokens > 0
            ? (cost.cacheReadTokens / (cost.inputTokens + cost.cacheReadTokens + cost.cacheWriteTokens)) * 100
            : undefined
          const updatedText = balance.state.updatedAt === 0
            ? ''
            : new Date(balance.state.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
          const triggerLabel = translate('chip.aria') + ' ' + formatMoney(cost.total) + translate('chip.ariaMid') +
            translate('chip.balance') + ' ' + balanceDescription + translate('chip.ariaEnd')

          const tokenRows = [
            [translate('panel.input'), formatTokens(cost.inputTokens)],
            [translate('panel.output'), formatTokens(cost.outputTokens)],
          ]
          if (cost.cacheReadTokens > 0) tokenRows.push([translate('panel.cacheRead'), formatTokens(cost.cacheReadTokens)])
          if (cost.cacheWriteTokens > 0) tokenRows.push([translate('panel.cacheWrite'), formatTokens(cost.cacheWriteTokens)])
          tokenRows.push([translate('panel.totalTokens'), formatTokens(cost.totalTokens)])

          const costRows = [
            [translate('panel.costInput'), formatMoney(cost.input)],
            [translate('panel.costCacheRead'), formatMoney(cost.cacheRead)],
            [translate('panel.costOutput'), formatMoney(cost.output)],
          ]
          if (cost.cacheWriteTokens > 0) costRows.splice(2, 0, [translate('panel.costCacheWrite'), formatMoney(cost.cacheWrite)])

          const panel = open && panelPosition !== null && typeof document !== 'undefined'
            ? ReactDOM.createPortal(
              h('div', {
                ref: panelRef,
                id: panelId,
                className: 'dsh-cm-panel',
                'data-dsh-cost-panel': '',
                style: {
                  right: panelPosition.right + 'px',
                  bottom: panelPosition.bottom + 'px',
                  width: panelPosition.width + 'px',
                  maxHeight: panelPosition.maxHeight + 'px',
                },
                role: 'dialog',
                'aria-label': translate('panel.title'),
              },
                h('div', { className: 'dsh-cm-head' },
                  h('div', null,
                    h('div', { className: 'dsh-cm-eyebrow' }, translate('panel.eyebrow')),
                    h('div', { className: 'dsh-cm-total' }, formatMoney(cost.total)),
                    h('div', { className: 'dsh-cm-sub' },
                      translate('panel.model') + ' · ' + (model === '' ? translate('panel.modelUnknown') : model),
                      running ? h('span', { className: 'dsh-cm-sub-running' }, '  ·  ' + translate('panel.running')) : null,
                    ),
                  ),
                  h('button', {
                    type: 'button',
                    className: 'dsh-cm-icon-btn',
                    onClick: function () { balance.refresh() },
                    disabled: balance.refreshing,
                    'aria-label': translate('panel.refresh'),
                    title: translate('panel.refresh'),
                  }, h(RefreshIcon, { busy: balance.refreshing })),
                ),
                h('div', { className: 'dsh-cm-section' },
                  h('div', { className: 'dsh-cm-section-title' }, translate('panel.tokens')),
                  h('dl', { className: 'dsh-cm-rows' },
                    tokenRows.map(function (entry) {
                      return h('div', { className: 'dsh-cm-row', key: 'token:' + entry[0] },
                        h('dt', null, entry[0]),
                        h('dd', null, entry[1]),
                      )
                    }),
                    cacheHitRate === undefined ? null : h('div', { className: 'dsh-cm-row', key: 'cache-hit' },
                      h('dt', null, translate('panel.cacheHit')),
                      h('dd', null, cacheHitRate.toFixed(1) + '%'),
                    ),
                  ),
                ),
                h('div', { className: 'dsh-cm-section' },
                  h('div', { className: 'dsh-cm-section-title' }, translate('panel.cost')),
                  h('dl', { className: 'dsh-cm-rows' },
                    costRows.map(function (entry) {
                      return h('div', { className: 'dsh-cm-row', key: 'cost:' + entry[0] },
                        h('dt', null, entry[0]),
                        h('dd', null, entry[1]),
                      )
                    }),
                  ),
                  h('div', { className: 'dsh-cm-updated' },
                    translate('panel.rate') + translate('panel.rateSep') + translate('panel.rateValue')
                      .replace('{input}', formatRate(pricing.input))
                      .replace('{cache}', formatRate(pricing.cacheRead))
                      .replace('{output}', formatRate(pricing.output)),
                  ),
                ),
                h('div', { className: 'dsh-cm-section' },
                  h('div', { className: 'dsh-cm-section-title' }, translate('panel.balance')),
                  h('dl', { className: 'dsh-cm-rows' },
                    wallets.length === 0
                      ? h('div', { className: 'dsh-cm-row', key: 'wallet-empty' },
                        h('dt', null, translate('panel.balance')),
                        h('dd', null, balance.state.status === 'loading' ? translate('chip.loading') : translate('panel.balanceEmpty')),
                      )
                      : wallets.map(function (wallet, index) {
                        const label = wallets.length > 1 ? translate('panel.wallet') + ' (' + wallet.currency + ')' : translate('panel.wallet')
                        return h('div', { className: 'dsh-cm-row dsh-cm-row-strong', key: 'wallet:' + wallet.currency + ':' + index },
                          h('dt', null, label),
                          h('dd', null, walletMoney(wallet)),
                        )
                      }),
                    bonusWallets.map(function (wallet, index) {
                      const label = bonusWallets.length > 1 ? translate('panel.bonus') + ' (' + wallet.currency + ')' : translate('panel.bonus')
                      return h('div', { className: 'dsh-cm-row', key: 'bonus:' + wallet.currency + ':' + index },
                        h('dt', null, label),
                        h('dd', null, walletMoney(wallet)),
                      )
                    }),
                  ),
                  updatedText === '' ? null : h('div', { className: 'dsh-cm-updated' }, translate('panel.updated') + ' ' + updatedText),
                  balance.state.status === 'error' ? h('div', { className: 'dsh-cm-error' }, translate('panel.error')) : null,
                  balance.state.status === 'unavailable' ? h('div', { className: 'dsh-cm-error' }, translate('panel.balanceUnavailable')) : null,
                ),
                h('p', { className: 'dsh-cm-note' }, translate('panel.note')),
              ),
              document.body,
            )
            : null

          return h(React.Fragment, null,
            h('button', {
              ref: triggerRef,
              type: 'button',
              className: 'dsh-cm-trigger',
              'data-dsh-session-cost': '',
              'data-running': running ? 'true' : 'false',
              'aria-haspopup': 'dialog',
              'aria-expanded': open,
              'aria-controls': open ? panelId : undefined,
              'aria-label': triggerLabel,
              title: triggerLabel,
              onClick: function () { setOpen(function (value) { return !value }) },
            },
              h('span', { className: 'dsh-cm-label' },
                h('span', { className: 'dsh-cm-dot', 'aria-hidden': 'true' }),
                translate('chip.session'),
              ),
              h('span', { className: 'dsh-cm-value' }, formatMoney(cost.total)),
              h('span', { className: 'dsh-cm-label' }, translate('chip.balance')),
              h('span', { className: 'dsh-cm-value' }, balanceText),
            ),
            panel,
          )
        }

        ctx.slots.inject('conversation.input.right', function () {
          return ctx.slots.register({
            name: 'conversation.input.right',
            id: 'cost-balance-chip',
            order: 10,
            locale: NS,
          }, CostMeter)
        })
      },
    }
  },
})
