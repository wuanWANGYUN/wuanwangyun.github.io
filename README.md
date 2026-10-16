# 个人空间

一个深色科技风的个人名片网站，使用原生 HTML、CSS、JavaScript 和本地 SVG，无安装、构建或后端依赖。

当前为占位演示内容；昵称、简介、兴趣和联系方式需要按实际情况补齐。

## 本地查看

保留整个文件夹，双击 `index.html` 即可。

## 修改内容

- `index.html`：昵称、自我介绍、兴趣和公开联系方式。只替换标签之间的文字。
- `styles.css`：配色、布局和动画。
- `script.js`：手机导航和当前区域提示。
- `assets/`：本地 SVG 素材。
- `.nojekyll`：GitHub Pages 的纯静态文件标记。

联系方式当前为禁用按钮。补齐真实地址后，将对应 `<button disabled>` 替换为带真实 `href` 的 `<a class="social-link">`，并更新占位提示。

## GitHub Pages

将本目录中的文件放在仓库根目录，让 `index.html` 与 `README.md` 位于同一层。

在仓库 **Settings → Pages** 中选择 **Deploy from a branch**，发布分支为 `main`、目录为 `/(root)`，保存后等待部署成功。

修改本地文件不会自动更新线上网站；将改动提交到 GitHub 的发布分支后才会触发更新。

[GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
