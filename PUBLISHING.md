# 发布与社区分享清单

这个目录已经是可发布的 npm bundle。当前机器没有 npm/GitHub 登录，因此下面是需要你在有凭据的环境里执行的步骤。

## 先说明官方渠道

DSH 官方目前**没有插件市场“上架”接口**。官方文档明确说 DSH 不自带任何索引源，用户需要自己添加索引 URL：

- 官方插件索引说明：<https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/user/guide/plugin-market.zh.md>
- 官方社区入口：GitHub Discussions <https://github.com/deepseek-ai/deepseek-harness/discussions>
- 官方 README 建议给插件仓库加 `dsh-plugin` topic，方便被发现。
- 官方 README 也提供 Discord 社区入口。

因此“发布到官方社区”实际由三部分组成：**npm 包 + 带 `dsh-plugin` topic 的公开仓库 + 官方 Discussions 分享帖**。没有可调用的一键上架 API。

## 0. 预检

```powershell
cd C:\Users\jieyu\Documents\deepseek-harness\default-workspace\dsh-cost-balance-chip
pnpm test
pnpm pack
```

`prepack` 会自动跑 `tests/package.test.mjs`，检查包名、loader 行、Client bundle id、market index 和公开文件是否一致。

## 1. 发布 npm 包

包名 `dsh-cost-balance-chip` 目前未被占用（`dsh-session-cost-meter` 已被另一个插件占用，不能用）。

先登录 npm（需要 publish 权限）：

```sh
npm login --registry=https://registry.npmjs.org/
```

如果机器上没有 npm，可以在 `%USERPROFILE%\.npmrc` 写入 granular access token：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

然后设置 `NPM_TOKEN` 环境变量，避免把 token 写进仓库。

发布：

```sh
pnpm publish --access public --registry=https://registry.npmjs.org/
```

发布后确认：

```sh
pnpm view dsh-cost-balance-chip version
```

## 2. 创建公开仓库并加 topic

```sh
git init
git add .
git commit -m "feat: publish dsh-cost-balance-chip"
git branch -M main
git remote add origin https://github.com/<owner>/dsh-cost-balance-chip.git
git push -u origin main
```

在 GitHub 仓库设置里添加 topic：`dsh-plugin`。

建议同时补充：

- `package.json` 的 `repository`、`bugs`、`homepage`
- `market/index.json` 里的 `repository`
- README 顶部的 npm / GitHub 徽章

补充后把版本升到 `1.0.1` 再发布一次，避免 npm 上 1.0.0 的元数据缺少仓库链接。

## 3. 在官方 Discussions 发分享帖

打开 <https://github.com/deepseek-ai/deepseek-harness/discussions>，选择最接近 **Show and tell / 分享** 的分类，粘贴 `ANNOUNCEMENT.zh.md`（或 `ANNOUNCEMENT.en.md`）的内容，替换其中的仓库链接。

建议帖子标题：

```text
插件分享：dsh-cost-balance-chip — 输入框右侧的对话费用与余额
```

## 4. 可选：托管自己的 Discover 索引

DSH 的 Discover 读取用户手动添加的 `index.json`。本目录已带两份相同的索引：

```text
market/index.json          # 包内参考副本
docs/market/index.json     # GitHub Pages 用
docs/market/icon.svg
```

GitHub Pages 选择 `main` 分支的 `/docs` 目录后，索引地址是：

```text
https://jieyueriluo.github.io/DSH_balance-chip/market/index.json
```

然后在 DSH：

1. 启用 **Experimental plugins → Custom plugin indexes**
2. 打开 **Plugins → Discover → Add index source**
3. 填入上面的索引地址

索引里的 `icon` 是相对路径，因此 `index.json` 和 `icon.svg` 必须放在同一目录；如果改目录结构，同步改 `icon`。

## 5. 可选：dshbase / dshmarket 等社区目录

这些是第三方社区目录，不是官方渠道。提交前确认它们当前的收录规则；一般需要：

- 公开仓库
- 根 `package.json` 声明 `dsh.bundle`
- 可解析的 README
- 固定 commit 证据（部分目录要求）
- 通过它们的 GitHub Issue 模板提交

dshbase 的提交入口：<https://github.com/Ericwong5021/deepseek-plugin-store/issues/new?template=plugin-submission.yml>

## 6. 发布后自检

```sh
dsh plugin --profile <profile> add dsh-cost-balance-chip
```

确认：

- 输入框右侧出现 `本次 / 余额` 卡片；
- 点击卡片能打开明细；
- 余额能正常读取；
- 浏览器控制台没有插件自己的异常。

## 注意

- 不要在仓库里提交 `.npmrc`、npm token、DSH 凭据或带账户余额的截图。
- 插件读取余额依赖 DSH 的 `remote.account`，不会直接访问平台凭据。
- 费用是估算值，README 和帖子都要保留“以平台账单为准”的说明。
