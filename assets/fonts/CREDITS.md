# 網頁圓體字型

本遊戲使用兩套免費開源字型，皆採 SIL Open Font License 1.1，隨附原授權全文。網頁使用的 WOFF2 是依遊戲目前文案製作的精簡字集版本，以專案名稱 Guardian Text／Guardian Round 區別衍生版本。

## 內文：Huninn 粉圓

- 作者：The Huninn Project Authors / justfont
- 官方專案：https://github.com/justfont/Huninn
- 下載來源：https://github.com/google/fonts/tree/main/ofl/huninn
- 原檔：Huninn-Regular.ttf
- 遊戲檔案：guardian-text.woff2
- 授權全文：Huninn-OFL.txt

## 標題、按鈕、積分：源泉圓體 GenSen Rounded 2 TW

- 作者／專案：ButTaiwan/gensen-font；衍生自 Source Han Sans / Genki Gothic，完整權利聲明見原字型與授權。
- 官方專案：https://github.com/ButTaiwan/gensen-font
- 原檔：GenSenRounded2TW-B.otf、GenSenRounded2TW-H.otf
- 遊戲檔案：guardian-round-bold.woff2、guardian-round-heavy.woff2
- 授權全文：GenSen-OFL.txt

字型均存放在本機，可離線使用。後續新增遊戲文案時，請重新執行 tools/build-fonts.py，確保新字包含在精簡字集中。若從 ZIP 解壓後重新建立字型，先執行 tools/download-fonts.py 取得原字型，並在 Python 環境安裝 fonttools、brotli。海報道具卡裡的文字屬於原始圖片，維持原圖樣式。
