# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 溝通與協作規範（必讀）

- **必須使用繁體中文與使用者溝通。**
- 程式碼**註解**使用繁體中文；程式碼內的**命名**、**git commit 訊息**維持英文（符合業界慣例）。
- 每次新增或修改程式碼時，**必須同步撰寫或更新對應的測試代碼**。
- 每次完成功能新增、修改或刪除後，**必須比對並更新 `README.md`**。
- 每次完成功能新增、修改或刪除後，**必須將內容推進 git commit**。

## 專案概要

AliceZero 是一支 Discord 機器人（discord.js v14），功能分為音樂播放、mykirito 攻略組資料查詢、TRPG 骰子與說明系統。

## 常用指令

```powershell
npm install          # 安裝相依套件（Node >= 18.17，實測版本 18.17.1）
npm start            # 等同 node alice.js，直接啟動 bot
npm test             # 執行 test/ 下所有測試
.\1_build.bat        # docker build -t smile0301/my-alice .
.\2_save.bat         # docker save -o my-alice.tar smile0301/my-alice

node --test test/BaseDiscordBot.test.js                    # 只跑單一測試檔
node --test --test-name-pattern "按鈕" test/*.test.js       # 只跑名稱符合的測試
```

測試用 Node 內建的 `node:test` + `node:assert/strict`，**不引入任何測試框架相依套件**。沒有 lint 設定。

`test/BaseDiscordBot.test.js` 是重點：因為 `BaseDiscordBot.js` 是唯一接觸 discord.js 的介面層，測試的目標是「discord.js 改版時能立刻定位到哪個介面壞了」，作法有兩種 —— 餵假的 discord 物件驗證取值路徑，以及呼叫真正的 builder 後比對 `toJSON()` 的欄位名與列舉值（型別代號 3/4/5…、ButtonStyle 1~5、`icon_url`、`custom_id` 這類由 Discord API 規格決定的東西）。新增介面方法時請照同一套寫測試。

測試不會對外連線：攻略組測試用 `node:test` 的 `mock.method(axios, "get", ...)` 攔截 api。

Dockerfile 會直接把本機的 `node_modules/` COPY 進映像檔，所以改動相依套件後要先在本機 `npm install` 再 build。

### .env（未進版控）

啟動至少需要 `TOKEN`、`BOT_ID`、`MASTER_ID`。攻略組功能需要經典服的 2 個 Google Apps Script 端點：`GASURL_NEW_SKILLS`、`GASURL_NEW_BOSSES` — 任一缺少時 `myKiritoC.CheckData()` 回 false，攻略組功能整組停用（`global.isMykirito` 維持 false），bot 其餘功能照常運作。舊版的 `GASURL_LEVELS` / `GASURL_SKILLS` / `GASURL_BOSSES` 已不再使用（改讀本地 json）。`HOME_PAGE`、`PORT` 只給目前已註解掉的自我喚醒（`CronTask`）與健康檢查（`HealthCheck`）使用。

## 架構

### M / C 命名慣例（見 README）

- `xxxM.js` = Manager：事件入口、指令路由、動態載入 commands。
- `xxxC.js` = Controller：實際行為邏輯。
- 每個功能領域一個 `manager/xxxManager/` 資料夾。

### BaseDiscordBot.js 是唯一的 discord.js 介面層

`baseJS/BaseDiscordBot.js`（約 1300 行）把 discord.js 完整包起來，其餘程式碼**不直接 require discord.js**。exports 依前綴分區，新增時沿用同一套：

| 前綴 | 範圍 |
| --- | --- |
| `C` | client / command Collection（`CSetSlashCommand`、`CGetCommand`、`CSetStatus`…） |
| `M` | 一般訊息（`MSend`、`MContent`、`MGetAuthorId`…） |
| `S` / `B` / `SM` | 斜線 / 按鈕 / 選單的 builder 與取值 |
| `I` | interaction 共用（`ISend`、`IIsSlash`、`IIsBot`…） |
| `E` | Embed builder |
| `Mu` | 語音與音訊播放 |

`CInitCommand(n)` / `CGetCommand(n)` 的 n 是 command 種類：0 = slash、1 = selectMenu、2 = button。

錯誤與日誌一律走 `baseJS/CatchF.js` 的 `ErrorDo` / `LogDo`，不要直接 console。

### 啟動流程

`alice.js` 是入口：`BDB.Login(TOKEN)` → 用 `BDB.On(client, <event>, handler)` 綁定 `ready` / `message` / `slash` / `button` / `selectMenu` 五個事件（`On` 內部把 discord.js 的 InteractionCreate 分派成這幾個邏輯事件）。`ready` 時 `DiscordReady()` 依序：initGlobal → 註冊斜線 → 刪除特定伺服器舊斜線 → 綁定選單 / 按鈕 → 下載攻略組資料 → 設定狀態訊息。

`alice.js` 另外 export `ResetGlobal(client)`，由 `~reset` 指令（僅 `MASTER_ID` 可用）重跑整個 `DiscordReady`，用來線上重載攻略組資料。注意 `messageC.js` require 回 `alice.js` 形成循環依賴，這是刻意的。

### 全域狀態

音樂狀態存在 `global` 的 Map，key 一律是 guildId：`isPlaying`、`songList`、`connection`、`dispatcher`。攻略組資料存在 `global.mkLevel` / `mkSkill` / `mkBoss`（舊服）與 `newMkSkill` / `newMkBoss`（經典服），以及旗標 `global.isMykirito`。新增全域狀態時要同步加進 `alice.js` 的宣告區與 `initGlobal()`，否則 `~reset` 不會清乾淨。

### 訊息指令路由（前綴制）

`messageM.Start` 用 `manager/messageManager/messagePrefix.json` 比對前綴決定路由：`~` → messageC（基本）、`!` → musicM、`攻略組` → myKiritoM、`T` → trpgM。

兩道過濾在路由前生效：

1. `findPowerFromConstant` 讀 `messageConstant.js` 的 power 表（硬編碼 GroupID / ChannelID + `Power` 字串），命中即封鎖該前綴；頻道層級設定優先於伺服器層級。
2. `DeleteTempIfHaveEx` 對含 `@` 或 `:` 的訊息一律擋掉（音樂前綴 `1` 例外，因為網址含 `:`）。

### 動態載入的三種 command 契約

Manager 啟動時 `readdirSync` 掃自己的 `commands/` 資料夾，每種介面要求的模組形狀不同：

- **slash**（`slashManager/commands/*.js`）：需 `data`（`SNewSlashCommand` 產生的 builder）與 `execute`；有子指令時放在 `subcommand: { <name>: { data, execute } }`，`slashM` 會先看 `SGetOptionValue(interaction, "subcommand")` 再分派。`data.toJSON()` 會送去 REST 註冊。
- **button**（`buttonManager/commands/*.js`）：需 `data`（`BNewButton(customId, label)`）與 `execute`，以 `data.data.custom_id` 當 key。
- **selectMenu**（`selectMenuManager/commands/*.js`）：`data` 是含 select menu 的 ActionRow，key 取 `data.components[0].data.custom_id`；每個選項值是模組上的一個屬性（如 `music: { execute }`），由選中的 value 決定執行哪個。

新增指令只要在對應 `commands/` 放檔案，不需改 manager。

### 攻略組（mykirito）子系統

`mykiritoManager/requests/*.js` 是同時兼任「資料來源宣告」與「查詢指令」的模組，欄位：`data.name`（中文指令名，如「樓層」）、`url`、`ver`（`"old"` 或 `"new"`）、`callback(data)`（啟動時把資料塞進對應的 global）、`execute(msg, cmd, args)`（查詢時讀 global 回覆）。

**`ver` 同時決定資料來源與查詢分流**，這是這個子系統的核心：

- `ver: "old"`（mykirito 本服，已關服停更）：`url` 是 `myKiritoData/` 內的**本地 json 檔名**，`DownloadData` 用 `fs.readFileSync` 讀取，不打 api。
- `ver: "new"`（經典服）：`url` 是 .env 的 GAS api 位址，需要 `method`，由 axios 下載。

`myKiritoC.Start` 依 guildId / channelId 決定要跑 `ver: "old"` 還是 `"new"` 的模組（允許清單硬編碼在 `checkChannel` / `checkChannelForNewMyKirito`，這兩個函式必須維持同步，寫成 async 會讓判斷式恆為 true）；不在名單內的頻道回覆關服訊息。

新增查詢類型 = 在 `requests/` 加一個檔；若是經典服類型再加 .env URL 並更新 `CheckData()`。

### 回覆內容的組裝鏈

`manager/componentManager/componentM.js` 是各功能取得回覆訊息的統一入口，內部呼叫 `embedC.js` 組 Embed、`selectMenuC.js` / `buttonC.js` 組互動元件，回傳可直接餵給 `BDB.MSend` / `BDB.ISend` 的物件。要改文案或版面就改這兩層，不要在功能模組裡自組 Embed。

### 音樂系統

`musicM.DoMStart(msg, cmd, args, type)` 與 `DoSStart(interaction, ...)` 分別對應訊息指令與斜線指令，`type` 參數（0 = message、1 = interaction）會一路傳進 `BDB.Mu*` 系列，讓同一份邏輯處理兩種來源物件。串流由 `play-dl` 提供；`libs/play-dl/` 保留了本地化版本，但目前 `musicC.js` require 的是 node_modules 的套件（見 commit b02a81b：Node 18.17.1 下暫不使用自訂路徑）。

## 程式碼慣例

- 縮排用 tab，檔案以 `//#region import` / `//#endregion` 分段。
- 大量使用 optional chaining，並用 try/catch 包住每個入口，避免單一指令錯誤讓 bot 掛掉。
- 版本號有兩處：`package.json` 的 `version` 與 `baseJS/Config.json` 的 `version` / `status`（`status` 就是 bot 在 Discord 顯示的狀態文字），發版時兩邊都要更新。
