(() => {
  'use strict';
  const base = new URL('./', document.currentScript.src);
  const mediaBase = new URL('media/', base);
  const allowed = new Set('P H1 H2 H3 H4 H5 H6 STRONG B EM I U S DEL BR HR BLOCKQUOTE UL OL LI PRE CODE A IMG TABLE THEAD TBODY TFOOT TR TH TD'.split(' '));
  const drop = new Set('SCRIPT STYLE IFRAME OBJECT EMBED SVG MATH TEMPLATE FORM INPUT BUTTON TEXTAREA SELECT VIDEO AUDIO LINK META BASE'.split(' '));
  const text = value => typeof value === 'string' ? value : '';
  function node(tag, className, value) {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (value !== undefined) result.textContent = value;
    return result;
  }

  function imageURL(value) {
    if (!text(value)) return null;
    try {
      const url = new URL(value, base);
      const decoded = decodeURIComponent(url.pathname);
      if (url.origin !== base.origin || !url.pathname.startsWith(mediaBase.pathname) || !decoded.startsWith(decodeURIComponent(mediaBase.pathname))) return null;
      if (decoded.split('/').some(part => part === '..' || part === '.') || decoded.includes('\\')) return null;
      if (!/\.(png|jpe?g|webp|gif|avif)$/i.test(decoded)) return null;
      if (url.username || url.password) return null;
      return url.href;
    } catch { return null; }
  }

  function safeLink(value) {
    try {
      const url = new URL(value, base);
      return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  // Parse into an inert template, then rebuild permitted elements and attributes.
  // Never attach the source markup or its attributes to the live document.
  function richText(html) {
    const template = document.createElement('template');
    template.innerHTML = text(html);
    function rebuild(source, target) {
      for (const child of source.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) { target.append(document.createTextNode(child.textContent)); continue; }
        if (child.nodeType !== Node.ELEMENT_NODE || drop.has(child.tagName)) continue;
        if (!allowed.has(child.tagName)) { rebuild(child, target); continue; }
        const tag = child.tagName === 'H1' ? 'h2' : child.tagName.toLowerCase();
        const clean = node(tag);
        if (tag === 'img') {
          const src = imageURL(child.getAttribute('src'));
          if (!src) continue;
          clean.src = src;
          clean.alt = child.getAttribute('alt') || '';
          clean.loading = 'lazy'; clean.decoding = 'async';
        } else if (tag === 'a') {
          const href = safeLink(child.getAttribute('href') || '');
          if (href) { clean.href = href; clean.rel = 'noopener noreferrer'; clean.target = '_blank'; }
        } else if (['td', 'th'].includes(tag)) {
          for (const attribute of ['colspan', 'rowspan']) {
            const value = Number(child.getAttribute(attribute));
            if (Number.isInteger(value) && value > 0 && value <= 20) clean.setAttribute(attribute, String(value));
          }
        }
        rebuild(child, clean);
        if (tag === 'table') { const wrapper = node('div', 'table-scroll'); wrapper.append(clean); target.append(wrapper); }
        else target.append(clean);
      }
    }
    const fragment = document.createDocumentFragment();
    rebuild(template.content, fragment);
    return fragment;
  }

  async function readEntries(file) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(new URL(`content/${file}.json`, base), { cache: 'no-cache', signal: controller.signal });
      if (!response.ok) throw new Error('Content request failed');
      const data = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid content');
      const entries = data.entries ?? [];
      if (!Array.isArray(entries) || entries.some(entry => !entry || typeof entry !== 'object' || Array.isArray(entry))) throw new Error('Invalid content');
      return entries;
    } finally { clearTimeout(timeout); }
  }

  async function readPosts() {
    const entries = await readEntries('posts');
    const ids = new Set();
    for (const post of entries) {
      if (!text(post.id) || !text(post.title) || !text(post.body) || ids.has(post.id)) throw new Error('Invalid article');
      ids.add(post.id);
    }
    return entries.sort((a, b) => text(b.date).localeCompare(text(a.date)));
  }

  function empty(target, heading, description) {
    const box = node('div', 'empty-state');
    const symbol = node('span', 'empty-symbol', '✧'); symbol.setAttribute('aria-hidden', 'true');
    box.append(symbol, node('h3', '', heading), node('p', '', description));
    target.replaceChildren(box);
  }

  function failed(target, retry) {
    const box = node('div', 'error-state'); box.setAttribute('role', 'alert');
    box.append(node('p', '', '内容暂时未能加载，请稍后重试。'));
    const button = node('button', 'retry-button', '重试'); button.type = 'button';
    button.addEventListener('click', retry);
    box.append(button); target.replaceChildren(box);
  }

  function postCard(post) {
    const article = node('article', 'post-card');
    const link = node('a'); link.href = new URL(`article.html?id=${encodeURIComponent(post.id)}`, base).href;
    const cover = imageURL(post.cover);
    if (cover) { const img = node('img', 'post-cover'); img.src = cover; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; link.append(img); }
    const copy = node('div', 'post-copy');
    const date = node('time', 'post-date', text(post.date).slice(0, 10));
    if (/^\d{4}-\d{2}-\d{2}$/.test(text(post.date))) date.dateTime = post.date;
    const excerpt = text(post.summary) || richText(post.body).textContent.replace(/\s+/g, ' ').trim().slice(0, 130);
    copy.append(date, node('h3', '', post.title), node('p', 'post-summary', excerpt), node('span', 'post-footer', '阅读全文 ↗'));
    link.append(copy); article.append(link); return article;
  }

  async function loadList(target) {
    target.replaceChildren(node('p', 'loading-state', '正在翻开文章……'));
    try {
      const posts = await readPosts();
      if (!posts.length) return empty(target, '文字正在酝酿。', '第一篇文章发布后，会出现在这里。');
      const limit = Number(target.dataset.limit) || posts.length;
      target.replaceChildren(...posts.slice(0, limit).map(postCard));
    } catch { failed(target, () => loadList(target)); }
  }

  async function loadReader(target) {
    target.replaceChildren(node('p', 'loading-state', '正在翻开文章……'));
    const id = new URLSearchParams(location.search).get('id');
    if (!id) {
      const heading = node('h1', '', '文字与思考');
      const intro = node('p', 'admin-intro', '把好奇、感受与思考，慢慢写下来。');
      const list = node('div', 'post-grid'); list.id = 'posts-list';
      target.replaceChildren(heading, intro, list); await loadList(list); return;
    }
    try {
      const post = (await readPosts()).find(item => item.id === id);
      const back = node('a', 'text-link', '返回文章列表'); back.href = './article.html';
      if (!post) {
        document.title = '文章未找到 · 王允';
        target.replaceChildren(node('h1', '', '这篇文章暂时找不到了。'), node('p', 'admin-intro', '它可能已经被移除，去看看其他文字吧。'), back); return;
      }
      document.title = `${post.title} · 王允`;
      const title = node('h1', '', post.title); title.id = 'article-title';
      const meta = node('p', 'article-meta', `${text(post.date).slice(0, 10)} · 王允`);
      target.replaceChildren(back, title, meta);
      const cover = imageURL(post.cover);
      if (cover) { const img = node('img', 'article-cover'); img.src = cover; img.alt = `${post.title}的封面`; target.append(img); }
      const body = node('div', 'article-body'); body.append(richText(post.body)); target.append(body);
      const end = node('div', 'article-end'); end.append(back.cloneNode(true)); target.append(end);
    } catch { failed(target, () => loadReader(target)); }
  }

  const dialog = document.querySelector('#photo-dialog');
  let photos = [];
  let currentPhoto = 0;
  function showPhoto(index) {
    currentPhoto = index;
    const entry = photos[index];
    const image = document.querySelector('#photo-full'); image.src = imageURL(entry.image); image.alt = text(entry.caption);
    document.querySelector('#photo-caption').textContent = text(entry.caption);
    document.querySelector('#photo-count').textContent = `${index + 1} / ${photos.length}`;
    document.querySelector('#photo-prev').disabled = index === 0;
    document.querySelector('#photo-next').disabled = index === photos.length - 1;
    if (!dialog.open) dialog.showModal();
  }
  if (dialog) {
    document.querySelector('#photo-close').addEventListener('click', () => dialog.close());
    document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
    document.querySelector('#photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' && currentPhoto > 0) { event.preventDefault(); showPhoto(currentPhoto - 1); }
      if (event.key === 'ArrowRight' && currentPhoto < photos.length - 1) { event.preventDefault(); showPhoto(currentPhoto + 1); }
    });
  }

  async function loadGallery(target) {
    target.replaceChildren(node('p', 'loading-state', '正在展开相册……'));
    try {
      photos = await readEntries('gallery');
      if (photos.some(entry => !imageURL(entry.image) || !text(entry.caption))) throw new Error('Invalid photo');
      if (!photos.length) return empty(target, '光影，慢慢收集。', '还没有发布图片。未来的片刻，会在这里相遇。');
      target.replaceChildren(...photos.map((entry, index) => {
        const figure = node('figure', 'photo-item');
        const button = node('button', 'photo-button'); button.type = 'button'; button.setAttribute('aria-label', `放大查看：${entry.caption}`);
        const img = node('img'); img.src = imageURL(entry.image); img.alt = entry.caption; img.loading = 'lazy'; img.decoding = 'async';
        button.append(img); button.addEventListener('click', () => showPhoto(index));
        figure.append(button, node('figcaption', '', entry.caption)); return figure;
      }));
    } catch { failed(target, () => loadGallery(target)); }
  }

  document.querySelectorAll('[data-posts]').forEach(loadList);
  const reader = document.querySelector('#article-view'); if (reader) loadReader(reader);
  const gallery = document.querySelector('#gallery-grid'); if (gallery) loadGallery(gallery);
})();
