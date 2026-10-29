# 发布记录与重新发布清单

## 已发布

- npm: <https://www.npmjs.com/package/dsh-cost-balance-chip> (`1.0.0`)
- GitHub: <https://github.com/jieyueriluo/DSH_balance-chip>
- Release: <https://github.com/jieyueriluo/DSH_balance-chip/releases/tag/v1.0.0>
- Discover 索引: <https://jieyueriluo.github.io/DSH_balance-chip/market/index.json>
- 官方 Discussions: <https://github.com/deepseek-ai/deepseek-harness/discussions/11450>（Show Your Plugins!）

首次发布走的是 npm **staged publishing**：`pnpm stage publish` 创建 staged 版本，维护者批准后 `1.0.0` 进入 registry 并成为 `latest`。

## 官方渠道说明

DSH 官方目前**没有插件市场“上架”接口**。官方文档明确说 DSH 不自带任何索引源，用户需要自己添加索引 URL：

- 官方插件索引说明：<https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/user/guide/plugin-market.zh.md>
- 官方社区入口：GitHub Discussions <https://github.com/deepseek-ai/deepseek-harness/discussions>
- 官方 README 建议给插件仓库加 `dsh-plugin` topic，方便被发现。
- 官方 README 也提供 Discord 社区入口。

因此“发布到官方社区”由三部分组成：**npm 包 + 带 `dsh-plugin` topic 的公开仓库 + 官方 Discussions 分享帖**。没有可调用的一键上架接口。

## 重新发布新版本

1. 修改 `package.json` 的 `version`（例如 `1.0.1`）。
2. 同步 `market/index.json` 和 `docs/market/index.json` 的 `versions` / `publishTimestamp`。
3. 运行测试和打包：

```sh
pnpm test
pnpm pack
```

4. 登录 npm（有 2FA 时用验证器或 Automation token）。
5. 直接发布，或走 staged publishing：

```sh
pnpm publish --access public --registry=https://registry.npmjs.org/
# 或
pnpm stage publish --access public --registry=https://registry.npmjs.org/
pnpm stage approve <stage-id> --registry=https://registry.npmjs.org/
```

6. 更新 GitHub 仓库并打新 tag / release。
7. 如果是重要版本，在官方 Discussions 原帖回复更新，而不是重复开新帖。

## Discover 索引

GitHub Pages 选择 `main` 分支的 `/docs` 目录，索引地址：

```text
https://jieyueriluo.github.io/DSH_balance-chip/market/index.json
```

在 DSH：

1. 启用 **Experimental plugins → Custom plugin indexes**
2. 打开 **Plugins → Discover → Add index source**
3. 填入上面的索引地址

索引里的 `icon` 是相对路径，因此 `docs/market/index.json` 和 `docs/market/icon.svg` 必须在同一目录。

## 可选：第三方社区目录

dshbase / dshmarket 等是第三方社区目录，不是官方渠道。提交前确认它们当前的收录规则；一般需要公开仓库、根 `package.json` 声明 `dsh.bundle`、可解析的 README 和固定 commit 证据。

dshbase 的提交入口：<https://github.com/Ericwong5021/deepseek-plugin-store/issues/new?template=plugin-submission.yml>

## 注意

- 不要把 `.npmrc`、npm token、GitHub token、DSH 凭据或带账户余额的截图提交到仓库。
- 插件读取余额依赖 DSH 的 `remote.account`，不会直接访问平台凭据。
- 费用是估算值，README 和帖子都要保留“以平台账单为准”的说明。
