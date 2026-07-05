# Changelog

All notable changes to Cookie-share will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.2] - 2026-07-05

Backend/admin-page only — no userscript release for this version.
仅后端/管理页面变更 — 此版本无油猴脚本发布。

### Changed

- Migrated admin page UI from Pico CSS to DaisyUI v5 + Tailwind CSS, with multi-theme support (Nord, Corporate, Cupcake, Emerald, Dark, Dracula)
- Added CLAUDE.md for Claude Code guidance
- 管理页面 UI 从 Pico CSS 迁移至 DaisyUI v5 + Tailwind CSS，支持多主题切换（Nord、Corporate、Cupcake、Emerald、Dark、Dracula）
- 新增 CLAUDE.md 文件为 Claude Code 提供项目指引

---

## [0.6.1] - 2026-06-19

### Security

- Public `DELETE /{PATH_SECRET}/delete` now requires an encrypted request body (proving `TRANSPORT_SECRET` knowledge); knowing `PATH_SECRET` alone can no longer delete data. **Breaking**: userscripts `< 0.6.1` sending `DELETE /delete?key=xxx` will get a 400 error and must be updated
- Worker `timingSafeEqual` no longer leaks password length via early return on mismatched lengths
- 公开的 `DELETE /{PATH_SECRET}/delete` 端点现在要求加密请求体（证明持有 `TRANSPORT_SECRET`），仅知道 `PATH_SECRET` 不再能删除数据。**破坏性变更**：`< 0.6.1` 的旧脚本发送 `DELETE /delete?key=xxx` 将收到 400 错误，需升级脚本
- Worker 的 `timingSafeEqual` 不再因长度不匹配提前返回而泄露密码长度

### Fixed

- Server admin page `base64UrlEncode` had a double-escaped regex (`/\\+/` matching backslashes instead of `/\+/` matching `+`), breaking all admin page encrypted operations
- Admin page template rendering switched from single `.replace()` to `split/join` for reliable global replacement
- Userscript `t()` regex `\s` inside a template literal silently became a literal `s`; fixed to `\\s`
- `.gitignore` no longer ignores itself
- 服务器管理页面 `base64UrlEncode` 的正则被双重转义（`/\\+/` 匹配反斜杠而非 `/\+/` 匹配 `+`），导致管理页所有加密操作失效
- 管理页模板渲染从单次 `.replace()` 改为 `split/join`，确保全局替换可靠
- 油猴脚本 `t()` 中模板字面量里的正则 `\s` 被静默转义为字面 `s`，已修正为 `\\s`
- `.gitignore` 不再忽略它自己

### Changed

- Worker `ensureSchema` runs once per isolate instead of every request
- Bulk import uses D1 `batch()` in the Worker and SQLite transactions in the Node server
- Removed unused `listCookieRecords()` from Worker and store
- Worker 的 `ensureSchema` 每个 isolate 只执行一次，不再每个请求都执行
- 批量导入在 Worker 中使用 D1 `batch()`，在 Node 服务器中使用 SQLite 事务
- 移除 Worker 和 store 中未使用的 `listCookieRecords()`

---

## [0.6.0] - 2026-06-19

### Added

- Floating button drag & edge docking: draggable via Pointer Events (mouse + touch), drag to left/right edge to auto-dock with a visible strip, click docked strip to open the panel directly
- Position and dock state persisted via `GM_setValue`; window resize clamps position and preserves dock side
- GitHub Actions workflow for auto-release when a new userscript `@version` is pushed to `main`
- 悬浮按钮拖拽与边缘停靠：基于 Pointer Events 支持鼠标和触摸拖动，拖至左/右边缘自动停靠并保留可见条带，点击停靠条带可直接打开面板
- 位置与停靠状态通过 `GM_setValue` 持久化；窗口缩放时自动约束位置并保持停靠侧
- 新增 GitHub Actions 工作流，当新的脚本 `@version` 推送到 `main` 时自动创建 Release

### Changed

- Default floating button position changed to bottom-right
- 悬浮按钮默认位置改为右下角

---

## [0.5.2]

### Fixed

- Refactored `initShadowDOM` into `ensureShadowDOM` with idempotent re-attachment and readiness guards
- Added graceful fallback when `document.body` is not yet available at script injection time
- Used `DOMContentLoaded` and `requestAnimationFrame` to defer UI init on slow-loading pages
- Added null-safety checks in `showModal`, `createModal`, and `showCookieList` to prevent crashes
- Styles are now injected only once via `stylesInjected` flag, avoiding duplicate style elements
- 将 `initShadowDOM` 重构为 `ensureShadowDOM`，支持幂等重连与就绪状态守卫
- 添加 `document.body` 尚未可用时的优雅回退逻辑，避免脚本注入时机过早导致失败
- 使用 `DOMContentLoaded` 和 `requestAnimationFrame` 在页面加载较慢时延迟初始化 UI
- 在 `showModal`、`createModal`、`showCookieList` 中添加空值安全检查，防止运行时崩溃
- 通过 `stylesInjected` 标志确保样式仅注入一次，避免重复样式元素

---

## [0.5.1]

### Changed

- Migrated all UI elements into a Shadow DOM container to prevent CSS style conflicts with host pages
- Styles are now injected into the shadow root instead of `document.body`, ensuring complete style isolation
- Theme attributes are applied to the shadow wrapper instead of `document.body`
- All DOM queries now scoped to the shadow root for correct element lookups
- Added `pointer-events: auto` to overlay and notification elements within shadow DOM
- 将所有 UI 元素迁移至 Shadow DOM 容器，彻底防止与宿主页面 CSS 样式冲突
- 样式注入到 Shadow Root 而非 `document.body`，实现完整的样式隔离
- 主题属性应用于 Shadow 包装元素，不再污染 `document.body`
- 所有 DOM 查询限定在 Shadow Root 内部，确保元素查找正确
- 为 Shadow DOM 内的遮罩层和通知元素添加 `pointer-events: auto`

---

## [0.5.0]

### Added

- "Add Account" button: one-click send current cookies, clear page cookies, and reload for new account login
- Embedded `/server` TypeScript Node.js backend (requires Node.js 22.5.0+, built-in `node:sqlite`) with the same encrypted API contract as the Cloudflare Worker
- Automated integration tests for the Node.js backend protocol
- FAQ section with collapsible answers in both English and Chinese READMEs
- "新增账号"按钮：一键发送当前 Cookie、清空本页 Cookie 并刷新页面以登录新账号
- 内置 `/server` TypeScript Node.js 后端（需要 Node.js 22.5.0+，使用内置 `node:sqlite`），与 Cloudflare Worker 加密 API 协议一致
- Node.js 后端的自动化集成测试
- 中英文 README 新增可折叠的常见问题（FAQ）章节

### Changed

- Restructured both README.md and README_CN.md with Quick Start guide, feature categories, and collapsible detail sections
- Node.js backend setup now uses the in-repo `server/` directory instead of the separate `cookie-share-server` repository
- Updated screenshots for the new UI layout
- 重构了中英文 README，新增快速上手指南、功能分类和可折叠详情
- Node.js 后端现使用仓库内置 `server/` 目录，不再需要独立的 `cookie-share-server` 仓库
- 更新了截图以匹配新 UI 布局

---

## [0.4.1]

### Breaking Changes

- **D1 migration**: Switched Cloudflare Worker storage from KV to D1 database. Data from older versions is NOT compatible and requires redeployment.

---

## [0.4.0]

### Added

- Dual theme system: Claude (warm light) and Dark (luxury gold accent) with one-click switching
- Rebuilt all UI styles with CSS custom properties for consistent theming across modal, inputs, buttons, and notifications
- Collapsed settings (floating button toggle, fullscreen auto-hide, local save, config transfer) behind a gear button

### Changed

- Moved GitHub icon inline next to the title text instead of absolute-positioned to the far right
- Increased padding, input height, and spacing throughout for a more comfortable layout
- Consolidated notification system and all style injections inside the IIFE for cleaner code

---

## [0.3.1]

### Added

- Userscript config export/import for script-only settings (backend URL, transport secret, language preference, UI toggles)
- Exported config is encoded as Base64 and copied to clipboard automatically
- Top-level Worker error handling so browser requests show a readable error page instead of `Error 1101`

### Changed

- Moved the userscript config transfer panel to the bottom of the main modal
- Replaced the external GitHub icon asset with an inline SVG
- Reduced Worker PBKDF2 iterations to `100000` for Cloudflare Workers compatibility

---

## [0.3.0]

### Added

- `TRANSPORT_SECRET` for encrypted Worker JSON API transport
- Encrypted `send/receive/admin` JSON request and response bodies with a shared secret envelope
- Full export/import support in the Worker admin page
- Userscript stores and uses `TRANSPORT_SECRET` for cloud operations

### Changed

- Switched the Worker admin UI to Pico CSS to reduce embedded style code
- Split credential usage: userscript only needs `TRANSPORT_SECRET`, admin page only needs `ADMIN_PASSWORD`
- Updated deployment docs, local dev defaults, and version metadata

---

## [0.2.0]

### Added

- `wrangler.jsonc`, D1 migrations, and standardized deploy scripts
- Localhost fallback defaults for `wrangler dev` when `.dev.vars` is missing

### Changed

- Reworked the Cloudflare Worker storage layer from KV to D1
- Updated Cloudflare deployment docs for D1 binding and one-click deployment flow

### Fixed

- Worker admin page rendering issues and stricter request validation
- Userscript empty-list crash; switched ID generation to Web Crypto

---

## [0.1.0]

### Added

- Local storage option checkbox — save cookies locally without backend
- Distinguished between local and cloud data in Cookie List
- Cookie List opening option in Tampermonkey plugin menu
- `updateURL` for automatic script updates
- Language selection (Chinese and English)

### Changed

- Improved the cloud data transmission flow

---

## Legacy Chrome Extension Versions

> The following versions predate the Tampermonkey script rewrite. They are kept here for historical reference.

### [0.3.8]

- Added clear all cookies button for multi-account scenarios (e.g. chatgpt.com)
- Changed floating button logic to wait for page load before rendering

### [0.3.7]

- Refactored worker code and page UI, updated icons
- Added floating button for quick account switching
- Attempted Firefox browser compatibility fixes

### [0.2.0]

- Major page refactoring
- Added admin redirect link
- Added list-cookies popup
- Attempted Firefox browser compatibility fixes

### [0.1.5]

- Modified worker code and admin authentication, adjusted cookie expiration time

### [0.1.4]

- Improved interface layout and design
- Added GitHub repository link
- Added version display, update check, and manual update check feature

### [0.1.3]

- Changed all UI text to English
- Removed "Save URL" button, switched to auto-save
- Added build script with version control

### [0.1.2]

- Added clear cookie confirmation prompt

### [0.1.1]

- Added custom URL save feature

### [0.1.0]

- Initial release

---

## Node.js Server

### [0.0.1]

- Standalone Node.js server implementation, now embedded in the main repository under `server/`
- Cookie encryption using `ADMIN_PASSWORD` for enhanced security
- SQLite database for persistent storage

---

## Tampermonkey Script

### [0.0.1]

- Reconstructed using Tampermonkey script for better compatibility and easier installation
- Added `PATH_SECRET` in `_worker.js` to prevent brute force attacks
