# twitch 翻译脚本

适用于 Microsoft Edge 的 Twitch 聊天翻译扩展。无需脚本猫或篡改猴，只使用 Google 翻译，默认翻译为简体中文。

## 原始来源与致谢

本项目根据 **MrSelenix** 创作的 **TwitchTranslate 1.0.11** 改编：

- 原作者：MrSelenix
- 原始脚本：[TwitchTranslate - Greasy Fork](https://greasyfork.org/en/scripts/523571-twitchtranslate)
- 原始源码：[Greasy Fork 源码页面](https://greasyfork.org/en/scripts/523571-twitchtranslate/code)
- 原始许可证：MIT License

当前版本将原 Userscript 重构为独立的 Edge Manifest V3 扩展，并移除了 DeepL、DeepSeek 及所有 API Key 接口。感谢 MrSelenix 提供原始设计与实现基础。

## 安装

1. 下载并解压 Release 中的 ZIP。
2. 在 Edge 地址栏打开 `edge://extensions/`。
3. 开启“开发人员模式”。
4. 点击“加载解压缩的扩展”。
5. 选择解压后的扩展文件夹。
6. 打开或刷新 Twitch 页面。

点击 Edge 工具栏中的扩展图标，可以开关翻译、选择目标语言和译文颜色。

## 权限

- `storage`：保存扩展设置。
- `twitch.tv`：读取聊天文字并显示译文。
- `translate.googleapis.com`：调用 Google 翻译。

扩展没有 DeepSeek、DeepL 或其他需要 API Key 的接口。

## 注意

- 请停用脚本猫/篡改猴中的旧版，避免重复翻译。
- Google 接口不需要密钥，但可能受到访问频率限制。

## 许可证

本项目按照 MIT License 发布。原始作品的版权和许可声明见 [NOTICE.md](NOTICE.md) 与 [LICENSE](LICENSE)。
