# OPEN WINDOW

情绪日记的窗边交互预览。静态 HTML、CSS、JavaScript，无构建依赖。

## 本地预览

运行 `python3 -m http.server 8734 --bind 127.0.0.1`，打开 http://localhost:8734 。

粉色飞机、蓝色飞机、信纸与钢笔组合分别是独立图层，悬浮或键盘聚焦时会轻轻抬升、倾转，并出现阴影和提示。两个纸飞机的尖端以不同角度朝向室内。动效使用阻尼弹簧，响应鼠标在物件上的位置，移开后自然归位。

窗外的三朵原图云是独立图层，分别缓慢飘动，在窗框、树木和屋顶处被遮挡。云与悬浮都支持系统减少动态效果设置。

三个物件各有点击行为，共用同一张信纸面板（页面右 1/3 展开）：

- **写下烦恼**：可输入信纸（引导语「把一天的烦心事写下来飞走吧」），点无边框的「折起来，让它飞走」后纸张对折一次变成纸飞机，飞机跟随鼠标（机头永远正立）。窗户右下角有呼吸投放区（弥散阴影 + 两行小字「拖动到这里 / 点击扔出」，飞机停驻时文字淡出），拖进去自动摆正为机头朝左上，点击即扔出：向左上出手、俯冲掠过街道、左侧回旋、再向右上没入远处楼群，按透视渐远渐小渐隐。飞完页面恢复初始，可再写。
- **我的回信**：只读回信案例（日期 + 烦恼原文 + 虚线分隔的匿名回复）。
- **别人的烦恼**：上半张为烦恼原文（日期 + 内容），虚线分隔的下半张为回信输入区（引导语「鼓励一下TA吧～」）。

三种模式均按 Esc 关闭，点击信纸以外区域也可关闭，全程不存储任何输入。

进场时桌上三个物件依次抬起再放下一次，示意可交互；用户持续 10 秒无操作时，钢笔信纸会自己抬一下发出邀请（面板打开或纸飞机在飞时不会打扰）。

字体约定：仅信纸内容（引导语与输入文字）用行楷（Xingkai SC），其余中文 UI 一律苹方（PingFang SC）。

验证脚本 `scripts/check-letter-flow.cjs`（Playwright）覆盖完整流程与正立检查，截图存至 `output/preview/flow-*.png`。

## 素材

- `assets/city-scene-clean.png`：基于用户提供的城市窗景，由内置 imagegen 移除飞机、信纸、钢笔和云后修复的背景。
- `assets/city-scene-original.png`：调整飞机后的新底图；原始参考图仍保留在项目根目录。
- `assets/parts/city-*.png`：透明拆件。两个飞机、信纸钢笔组合、三朵云，共六层。
- `assets/parts/city-*.svg`：保留原图像素的裁切源文件；轮廓及蓝色飞机朝向变换见 `scripts/build-parts.mjs`，坐标见 `assets/city-parts.json`。构建脚本用 Sharp 将 SVG 导出为透明 PNG，网页本身无需依赖。
- `assets/city-generation-prompts.txt`：背景修复与飞机修改的完整 imagegen 提示词。
- `assets/fonts/AmaticaSC-Regular.ttf`：本地加载的 Amatica SC Regular；标题是 HTML 文本。
- 字体来源：https://github.com/hafontia-zz/Amatica-sc ，许可见 `assets/fonts/OFL.txt`。

所有资源均本地加载，无数据采集或上传。
