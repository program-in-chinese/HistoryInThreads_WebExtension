# HistoryInThreads_WebExtension
基于WebExtension的HistoryInThreads. 按主题显示浏览历史, 支持关键词搜索

演示:
![screen shot 2017-08-25 at 8 56 14 pm](https://user-images.githubusercontent.com/392497/29738482-31530328-89d8-11e7-9718-5877ed7cb986.png)

## 开发笔记
用[web-ext](https://github.com/mozilla/web-ext)发布包命令:

$ web-ext build --ignore-files="screenshot" README.md "*.komodoproject" "sidebar/test" --overwrite-dest
