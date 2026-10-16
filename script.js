"use strict";

// 没有 JavaScript 时仍显示完整导航；加载成功后增强手机菜单。
const menuButton = document.querySelector(".nav-toggle");
const navigation = document.querySelector(".site-nav");

if (menuButton && navigation) {
  document.documentElement.classList.add("js");
  const desktop = window.matchMedia("(min-width: 701px)");

  const closeMenu = (restoreFocus = false) => {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "打开导航菜单");
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "关闭导航菜单" : "打开导航菜单");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  desktop.addEventListener("change", () => closeMenu());
}

// 提示当前浏览的区域，不改变原生锚点导航行为。
if (navigation) {
  const links = Array.from(navigation.querySelectorAll("a"));
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  const updateCurrentSection = () => {
    const marker = window.innerHeight * 0.42;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) current = section;
    }
    // 最后一个区域可能无法滚到判定线；确实到达页底时仍应标记它。
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 1 && window.scrollY >= maxScroll - 2) current = sections.at(-1);
    for (const link of links) {
      if (current && link.getAttribute("href") === `#${current.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  let updateScheduled = false;
  const requestUpdate = () => {
    if (updateScheduled) return;
    updateScheduled = true;
    window.requestAnimationFrame(() => {
      updateCurrentSection();
      updateScheduled = false;
    });
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateCurrentSection();
}
