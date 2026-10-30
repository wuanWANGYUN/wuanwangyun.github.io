# 王允的个人网站

深蓝星空主题的中文个人网站。内容包括个人介绍、文学与科技兴趣、文章与相册，适配手机和电脑。

## 本地查看

推荐使用已发布的网址 https://wuanwangyun.github.io/wangyun/ 。双击 `index.html` 可以预览原有静态介绍；文章和相册通过 JSON 加载，需要 HTTP/HTTPS 环境。网站无需构建或安装运行时依赖。

## 文件

- `index.html`：文字、页面结构、装饰性轨道图。
- `styles.css`：排版、颜色、响应式布局。
- `script.js`：星空动效、暂停和恢复、浏览器减少动态效果偏好支持。
- `favicon.svg`：网站图标。
- `article.html`：全部文章与单篇阅读页，文章使用稳定 ID 链接。
- `admin.html`：Pages CMS 入口及中文使用说明。
- `content.js`、`content.css`：文章和相册的数据加载、安全展示、图片查看及排版。
- `content/posts.json`、`content/gallery.json`：后台管理的文章和图片说明。
- `media/`：后台上传的图片。

## 修改与发布

修改个人资料时编辑 `index.html`。所有资源均为相对路径，无外部字体、图片或脚本依赖。

上传到 `wuanWANGYUN/wuanwangyun.github.io` 的 `main` 分支 `wangyun/` 目录。保留仓库根目录已有主页和 `.nojekyll`。等 GitHub Pages 部署成功后访问 `/wangyun/`。

仓库根目录的 `.pages.yml` 配置 Pages CMS（源码包中与 `wangyun/` 同级）。首次打开 `admin.html`，按页面指引完成 GitHub 登录、选择网站仓库和 `main` 分支，即可在「文章管理」「相册管理」内添加、修改或删除条目。编辑后点击保存，等待 GitHub Pages 部署。内容配置仅提供本网站的文章和相册字段，但 GitHub App 的权限范围是整个所选仓库，非目录级权限。

正文使用 HTML 富文本，由网页白名单重建格式，不执行脚本或保留任意 HTML 属性。图片仅显示本网站 `media/` 内的 JPG/PNG/WebP/GIF/AVIF 文件；正文插图应通过后台上传。文章日期只用于排序和展示，不是定时发布。仓库为公开仓库，不提供私密草稿。

前端初始文章与相册均为空。测试内容不上传到公开仓库。真实 Pages CMS 登录、上传和保存需账号所有者完成首次授权后实测。

动效设置只存储在访问者自己的浏览器中；不收集资料，不使用分析服务。系统启用“减少动态效果”时默认暂停，访问者仍可手动开启星点动效。
