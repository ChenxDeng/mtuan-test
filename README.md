# OPEN WINDOW

情绪日记的窗边交互预览。静态 HTML、CSS、JavaScript，无构建依赖。

## 本地预览

运行 `python3 -m http.server 8734 --bind 127.0.0.1`，打开 http://localhost:8734 。

粉色飞机、蓝色飞机、信纸与钢笔组合分别是独立图层，悬浮或键盘聚焦时会轻轻抬升、倾转，并出现阴影和提示。两个纸飞机的尖端以不同角度朝向室内。动效使用阻尼弹簧，响应鼠标在物件上的位置，移开后自然归位。

窗外的三朵原图云是独立图层，分别缓慢飘动，在窗框、树木和屋顶处被遮挡。云与悬浮都支持系统减少动态效果设置。

本轮只实现「别人的烦恼」「我的回信」「写下烦恼」三个悬浮提示，不包含点击后的业务行为。

## 素材

- `assets/city-scene-clean.png`：基于用户提供的城市窗景，由内置 imagegen 移除飞机、信纸、钢笔和云后修复的背景。
- `assets/city-scene-original.png`：调整飞机后的新底图；原始参考图仍保留在项目根目录。
- `assets/parts/city-*.png`：透明拆件。两个飞机、信纸钢笔组合、三朵云，共六层。
- `assets/parts/city-*.svg`：保留原图像素的裁切源文件；轮廓及蓝色飞机朝向变换见 `scripts/build-parts.mjs`，坐标见 `assets/city-parts.json`。构建脚本用 Sharp 将 SVG 导出为透明 PNG，网页本身无需依赖。
- `assets/city-generation-prompts.txt`：背景修复与飞机修改的完整 imagegen 提示词。
- `assets/fonts/AmaticaSC-Regular.ttf`：本地加载的 Amatica SC Regular；标题是 HTML 文本。
- 字体来源：https://github.com/hafontia-zz/Amatica-sc ，许可见 `assets/fonts/OFL.txt`。

所有资源均本地加载，无数据采集或上传。
