# AliceZero

M - Manager 角色動點的管理  
C - Controller 行為的管理

## 開發

| 指令                                                | 說明                                     |
| --------------------------------------------------- | ---------------------------------------- |
| `npm start`                                           | 啟動 bot                                 |
| `npm test`                                            | 執行所有測試(使用 node 內建的 node:test) |
| `node --test test/BaseDiscordBot.test.js`             | 只跑單一測試檔                           |
| `node --test --test-name-pattern "按鈕" test/*.test.js` | 只跑名稱符合的測試                       |

測試主力放在 `baseJS/BaseDiscordBot.js`：它是全專案唯一直接接觸 discord.js 的介面層，
測試比對的是 builder 產出的 json 欄位與列舉值，discord.js 改版時可以直接定位到壞掉的介面。

## 音樂系統

音訊由 **yt-dlp** 取得，需要另外安裝：

- Windows：到 [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases/latest) 下載 `yt-dlp.exe`，放進 PATH，或在 `.env` 用 `YTDLP_PATH` 指定完整路徑。
- Docker：映像檔內已經裝好，不用額外處理。
- 非 opus 音源會用 ffmpeg 轉檔(選用，映像檔內已內建)。

youtube 的規則會不定期變動，純 JS 的抓取套件(play-dl、ytdl-core、youtubei.js)目前都拿不到音訊網址，
所以來源相依集中在 `manager/musicManager/musicSourceC.js`，之後要換工具只需要改這一支。
yt-dlp 更新很勤，播不出來時先更新它：`yt-dlp -U`。

## 攻略組資料來源

- 舊版(`ver: "old"`)：mykirito 已關服，資料不再更新，直接讀 `manager/mykiritoManager/myKiritoData/` 內的本地 json。
- 經典服(`ver: "new"`)：仍向 `.env` 內的 GAS api 下載。

兩者都由 `myKiritoC.DownloadData()` 統一處理，request 模組的 `url` 欄位對舊版而言是本地檔名、對經典服而言是 api 位址。

## 攻略組查詢方式

| 輸入                 | 反應                                                     |
| -------------------- | -------------------------------------------------------- |
| `攻略組`             | 用菜單列出這個頻道可以查的指令                           |
| `攻略組 {指令}`      | 顯示該指令的效果，並用菜單列出所有可查詢的目標(自動分頁) |
| `攻略組 {指令} {目標}` | 直接輸出 embed(與原本相同)                               |

菜單選完之後一樣輸出原本的 embed，找不到目標時也會改用菜單詢問。

## 更新履歷

---

<details>
<summary>未發布</summary>
<pre>

- [x] 修復音樂系統，改用 yt-dlp 取得音訊(play-dl 已無法取得 youtube 音源)
- [x] 攻略組改用菜單查詢，不用再重打一次文字指令
- [x] 修正情報 embed 上的技能 / 能力 / 稱號按鈕固定拿舊服資料的問題，改成跟著頻道版本走
- [x] 攻略組舊版資料改讀本地 json，不再依賴 api
- [x] 補上 BaseDiscordBot 介面層、菜單系統與攻略組的測試(npm test)
- [x] 修正 embed 的 ESetAuthor / ESetUrl 對不上 discord.js v14 的欄位與方法名
- [x] 修正經典服頻道判斷恆為 true，導致頻道白名單失效的問題

</pre>
</details>

<details>
<summary>v1.0.0</summary>
<pre>
正式將 discord.js@14 版(v14.11.0) 推進正式版

- [x] 穩定的音樂系統
- [x] mykirito 資料查詢
- [x] 幫助文檔全面翻新
- [x] 支援 斜線指令 / 選單 / 按鈕
- [x] 隱藏功能(2 項)

預計添加

- [ ] 歌單系統
- [ ] AI 模組
- [ ] more..

</pre>
</details>
