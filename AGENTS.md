# 项目说明

## 给 Codex 的沟通要求

- 用户叫 zz。
- zz 是 Vibe Coding 新手，解释问题时要用大白话，少说黑话。
- 遇到报错、构建失败、代码改动原因时，要把“发生了什么”和“为什么这样改”讲清楚。

## 项目是什么

这是一个宠物洗护 / 宠物美容门店展示页，页面内容围绕 Pet Spa 门店展开。

页面主要包含：

- 顶部导航和品牌区。
- 首屏轮播图，展示狗狗洗护和猫咪护理。
- 门店亮点条，例如消毒、交付时间、敏感宠物安抚、评分。
- 洗护服务卡片。
- 家长评价轮播。
- 门店地址、营业时间、预约电话和地图图。
- 护理流程说明。
- 预约表单。

## 技术栈

- Vite：负责本地开发服务器和打包。
- React 19：页面组件写在 `src/main.jsx`。
- React DOM：把 React 页面挂载到 `index.html` 里的 `#root`。
- lucide-react：图标库，页面里的爪印、定位、星星、日历等图标都来自这里。
- CSS：全局样式写在 `src/styles.css`，没有使用 Tailwind 或 CSS Modules。

## 常用命令

```bash
npm run dev
```

启动本地开发服务器。`package.json` 里配置了 `--host 127.0.0.1`，适合本机预览。

```bash
npm run build
```

构建生产版本，输出到 `dist/`。

```bash
npm run preview
```

预览构建后的 `dist/` 内容。

## 目录和文件

- `index.html`：网页入口，包含 `#root` 节点，并加载 `/src/main.jsx`。
- `src/main.jsx`：React 主文件。服务数据、轮播数据、评价数据、页面结构和交互状态都在这里。
- `src/styles.css`：整站样式。包含首屏、卡片、评价轮播、门店地图、预约表单、移动端响应式等样式。
- `src/assets/hero-dog-spa.png`：狗狗洗护首屏图。
- `src/assets/hero-cat-care.png`：猫咪护理首屏图。
- `src/assets/store-map-yichuan.png`：门店地图图。
- `src/assets/store-location-cute.png`：当前代码里没有引用到，可能是备用图片。
- `dist/`：构建产物，可以重新生成，不要手动维护。
- `node_modules/`：依赖安装目录，不要手动修改。

## 代码结构重点

`src/main.jsx` 里有几个主要数据数组：

- `services`：服务卡片数据。
- `heroSlides`：首屏轮播图数据。
- `process`：护理流程。
- `reviews`：评价列表。
- `reviewPages`：把评价按每 3 条分成一页。

`App` 组件里有两个轮播状态：

- `activeSlide`：控制首屏轮播当前显示哪一张。
- `activeReviewPage`：控制评价轮播当前显示哪一页。

两个 `useEffect` 分别负责自动轮播：

- 首屏图每 5600ms 切换一次。
- 评价每 4800ms 切换一次。

## 样式和设计特点

- 整体是温暖、干净的宠物护理门店风格。
- 主色大概是暖橙红 `#e05a47` 和墨绿色 `#0c6b64`。
- 卡片圆角大多是 8px。
- 移动端在 `@media (max-width: 860px)` 里处理，会把多列布局改成单列，并隐藏顶部导航。
- 页面使用固定顶部导航，首屏是大图背景加文字覆盖。

## 当前注意事项

- 项目当前可以成功执行 `npm run build`。
- 终端里读取文件时，中文可能显示成乱码；这通常是编码显示问题，不一定代表构建失败。
- `src/main.jsx` 的大量页面文案目前看起来像乱码，如果以后要做内容维护，建议优先把这些中文文案恢复成正常中文。
- `index.html` 的 `<title>` 也显示异常，后续可以改成正常标题，例如“爪爪焕新 Pet Spa”。
- 预约表单现在只是静态表单，提交按钮是 `type="button"`，没有真正提交数据或连接后端。
- `feature-band` 里有一张 Unsplash 远程图片，离线或网络差时可能加载不出来。

## 给后续修改者的小提醒

- 改页面内容时，优先改 `src/main.jsx` 里的数据数组。
- 改视觉样式时，优先改 `src/styles.css`。
- 不要直接改 `dist/`，它是构建后生成的。
- 如果要加新图片，放进 `src/assets/`，再在 `src/main.jsx` 里 `import` 使用。
- 每次较大改动后，至少跑一次 `npm run build` 确认没有把项目改坏。
