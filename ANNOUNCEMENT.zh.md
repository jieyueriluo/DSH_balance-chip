# 插件分享：dsh-cost-balance-chip — 输入框右侧的对话费用与余额

做了一个 DSH Web 小插件：把**本次对话的预估花费**和**账户可用余额**放在输入框右侧，点击可以看 Token 与费用明细。

```text
● 本次   ¥15.93
  余额   ¥13.35
```

## 安装

```sh
dsh plugin --profile <profile> add dsh-cost-balance-chip
```

安装后刷新 DSH 页面（或让 profile 的 HMR 重载）。

## 功能

- 位置在 `conversation.input.right`，模型选择器左侧。
- **本次花费**：读取 `tokenUsage` 投影，按输入 / 输出 / 缓存命中 / 缓存写入四类 Token 估算。
- **余额**：通过 `remote.account` 读取充值余额 + 赠金余额；挂载时、每 30 秒、每轮对话结束后刷新。
- 点击卡片查看：当前模型、Token 用量、缓存命中率、费用构成、充值 / 赠金钱包、最后刷新时间。
- 支持 `zh` / `en`，跟随 DSH 主题。
- 余额读取失败时显示 `—`，不会伪造 0；面板里可以重试。

## 说明

- 费用是**估算值**，实际扣费以 DeepSeek 平台账单为准。
- 默认参考单价（元 / 百万 Token）：`deepseek-flash` 输入 2 / 缓存 0.2 / 输出 3；`deepseek-v4-pro` 输入 4 / 缓存 0.4 / 输出 12。可在 `client.js` 里调整。
- 会话中途切换模型时，目前会把全部 Token 按最新模型单价估算；这是已知限制。
- 插件不读取或上传任何凭据，余额请求走 DSH 自己的 `remote.account` 代理。

## 链接

- npm：<https://www.npmjs.com/package/dsh-cost-balance-chip>
- GitHub：<https://github.com/jieyueriluo/DSH_balance-chip>

欢迎试用和反馈；如果发现计费规则或 UI 适配问题，可以直接在仓库开 issue。
