/* =========================================================
   交互逻辑
   1) 状态与持久化        2) 渲染（资料 / 分栏 / 推文）
   3) 密码锁 + 编辑模式   4) 背景音乐
   5) 灯箱 · 夜间模式 · 时钟
   ========================================================= */

(function () {
  "use strict";

  const STORE_KEY = "wen-page-v1";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ---------------- 1. 状态 ---------------- */

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function merge(base, patch) {
    if (!patch || typeof patch !== "object") return base;
    Object.keys(patch).forEach((k) => {
      const v = patch[k];
      if (v && typeof v === "object" && !Array.isArray(v) &&
          base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
        merge(base[k], v);
      } else {
        base[k] = v;
      }
    });
    return base;
  }

  let state;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    state = raw ? merge(clone(PAGE), JSON.parse(raw)) : clone(PAGE);
  } catch (e) {
    state = clone(PAGE);
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
    }, 300);
  }

  function setPath(path, value) {
    const parts = path.split(".");
    let o = state;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = value;
  }

  /* ---------------- 2. 渲染 ---------------- */

  let activeTab = state.tabs[0].id;

  function renderProfile() {
    const p = state.profile;
    const nameNodes = $$("[data-edit='profile.name']");
    nameNodes.forEach((n) => { n.textContent = p.name; });

    $("#handle").textContent = p.handle;
    $("#topSub").textContent = p.title;
    $("#statFollowing").textContent = p.following;
    $("#statFollowers").textContent = p.followers;
    $("#bio").textContent = p.bio;
    $("#profileLocation").textContent = p.location;
    $("#profileTag").textContent = p.tag;
    $("#avatarImg").src = p.avatar;
    $(".banner img").src = p.banner;

    const pin = $("#pinLink");
    pin.href = state.site.pin.href || "#";
    $("#pinText").textContent = state.site.pin.text;
  }

  function renderTabs() {
    const box = $("#tabs");
    box.innerHTML = "";
    state.tabs.forEach((t) => {
      const b = el("div", "tab" + (t.id === activeTab ? " active" : ""), t.name);
      b.dataset.tab = t.id;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(t.id === activeTab));
      b.addEventListener("click", () => {
        if (activeTab === t.id) return;
        activeTab = t.id;
        renderTabs();
        renderFeed();
      });
      box.appendChild(b);
    });
  }

  function icon(kind) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    const paths = {
      reply: "M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.9 8.9 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z",
      repost: "M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H8a4 4 0 0 0-4 4v1M3 18h13a4 4 0 0 0 4-4v-1",
      like: "M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5z"
    };
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", paths[kind]);
    svg.appendChild(path);
    return svg;
  }

  function photoGrid(images) {
    const grid = el("div", "photo-grid");
    grid.dataset.n = images.length;
    images.forEach((src, i) => {
      const cell = el("div", "gcell");
      const img = el("img");
      img.src = src;
      img.alt = "配图 " + (i + 1);
      img.loading = "lazy";
      img.addEventListener("error", () => {
        cell.classList.add("missing");
        cell.dataset.name = src.replace(/^assets\//, "");
      });
      cell.appendChild(img);
      cell.addEventListener("click", () => openLightbox(images, i));
      grid.appendChild(cell);
    });
    return grid;
  }

  function renderFeed() {
    const feed = $("#feed");
    feed.innerHTML = "";

    const list = state.posts.filter((p) => p.tab === activeTab);
    $("#emptyState").hidden = list.length > 0;

    list.forEach((post) => {
      const art = el("article", "tweet");
      art.id = post.id;

      const head = el("div", "tweet-head");
      const av = el("div", "tweet-avatar");
      const avImg = el("img");
      avImg.src = state.profile.avatar;
      avImg.alt = state.profile.name;
      avImg.addEventListener("error", () => av.classList.add("missing"));
      av.appendChild(avImg);
      head.appendChild(av);
      head.appendChild(el("span", "t-name", state.profile.name));
      head.appendChild(el("span", "t-handle", state.profile.handle));
      art.appendChild(head);

      const body = el("div", "tweet-body", post.text);
      body.dataset.post = post.id;
      art.appendChild(body);

      if (post.images && post.images.length) art.appendChild(photoGrid(post.images));

      const meta = el("div", "tweet-meta");
      const views = el("div", "views");
      views.append(el("b", null, String(post.views)), document.createTextNode(" 次查看"));
      meta.appendChild(views);
      const ref = el("span", "ref-link");
      ref.append(document.createTextNode("查看引用 "), el("b", null, post.quotes ? String(post.quotes) : "›"));
      meta.appendChild(ref);
      art.appendChild(meta);

      const actions = el("div", "actions");
      [["reply", post.reply], ["repost", post.repost], ["like", post.like]].forEach(([kind, num]) => {
        const btn = el("button", "action");
        btn.type = "button";
        btn.appendChild(icon(kind));
        const n = el("span", "num", String(num));
        btn.appendChild(n);
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (kind === "like") {
            btn.classList.toggle("liked");
            const base = parseInt(String(num).replace(/\D/g, ""), 10) || 0;
            n.textContent = btn.classList.contains("liked") ? base + 1 : num;
          }
        });
        actions.appendChild(btn);
      });
      art.appendChild(actions);

      feed.appendChild(art);
    });

    applyEditable();
  }

  /* ---------------- 3. 密码锁 + 编辑 ---------------- */

  const lock = {
    mask: null, input: null, err: null, modal: null
  };

  function setEditing(on) {
    document.body.classList.toggle("editing", on);
    applyEditable();
    showHint(on ? "已解锁：可直接点击文字修改，改完点「锁定页面」" : "已锁定，页面恢复只读");
  }

  function applyEditable() {
    const on = document.body.classList.contains("editing");
    $$("[data-edit]").forEach((n) => n.setAttribute("contenteditable", on ? "true" : "false"));
    $$(".tweet-body").forEach((n) => n.setAttribute("contenteditable", on ? "true" : "false"));
  }

  function openPw() {
    lock.mask.classList.add("show");
    lock.input.value = "";
    lock.err.classList.remove("show");
    lock.modal.classList.remove("shake");
    setTimeout(() => lock.input.focus(), 60);
  }

  function closePw() {
    lock.mask.classList.remove("show");
    lock.input.blur();
  }

  function tryUnlock() {
    const v = lock.input.value.trim();
    if (v && v === String(state.site.password)) {
      closePw();
      setEditing(true);
    } else {
      lock.err.classList.add("show");
      lock.modal.classList.add("shake");
      setTimeout(() => lock.modal.classList.remove("shake"), 360);
      lock.input.select();
    }
  }

  function bindLock() {
    lock.mask  = $("#pwMask");
    lock.input = $("#pwInput");
    lock.err   = $("#pwErr");
    lock.modal = $(".modal", lock.mask);

    $("#lockBtn").addEventListener("click", () => {
      if (document.body.classList.contains("editing")) {
        setEditing(false);
      } else {
        openPw();
      }
    });

    $("#pwCancel").addEventListener("click", closePw);
    $("#pwOk").addEventListener("click", tryUnlock);
    lock.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock();
      if (e.key === "Escape") closePw();
    });
    lock.mask.addEventListener("click", (e) => {
      if (e.target === lock.mask) closePw();
    });

    $("#lockBackBtn").addEventListener("click", () => setEditing(false));

    // 一键导出：把当前内容写成 data.js 下载
    $("#exportBtn").addEventListener("click", () => {
      const header =
        "/* =========================================================\n" +
        "   由页面编辑模式导出，直接覆盖 js/data.js 即可\n" +
        "   ========================================================= */\n\n";
      const text = header + "const PAGE = " + JSON.stringify(state, null, 2) + ";\n";
      const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showHint("已导出 data.js —— 覆盖 js/data.js 后重新上传即可");
    });

    $("#resetBtn").addEventListener("click", () => {
      if (!confirm("把文字恢复成 data.js 里的初始内容？本地修改会清空。")) return;
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      state = clone(PAGE);
      activeTab = state.tabs[0].id;
      renderProfile();
      renderTabs();
      renderFeed();
      showHint("已恢复默认内容");
    });

    // 编辑输入
    document.addEventListener("input", (e) => {
      if (!document.body.classList.contains("editing")) return;
      const node = e.target.closest("[data-edit]");
      if (node) {
        const value = node.innerText.replace(/\n$/, "");
        setPath(node.dataset.edit, value);
        if (node.dataset.edit === "profile.name") {
          $$("[data-edit='profile.name']").forEach((n) => {
            if (n !== node) n.textContent = value;
          });
        }
        save();
        return;
      }
      const bodyNode = e.target.closest(".tweet-body");
      if (bodyNode) {
        const post = state.posts.find((p) => p.id === bodyNode.dataset.post);
        if (post) { post.text = bodyNode.innerText.replace(/\n$/, ""); save(); }
      }
    });

    // 粘贴时只取纯文本，避免带进外部样式
    document.addEventListener("paste", (e) => {
      const node = e.target.closest("[contenteditable='true']");
      if (!node) return;
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  }

  let hintTimer = null;
  function showHint(msg) {
    const h = $("#hint");
    h.textContent = msg;
    h.classList.add("show");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => h.classList.remove("show"), 2200);
  }

  /* ---------------- 4. 背景音乐 ---------------- */

  function bindBgm() {
    const audio = $("#bgm");
    audio.volume = Number(state.site.bgmVolume) || 0.55;

    let started = false;
    let broken = false;

    const play = () => {
      if (started || broken) return;
      const p = audio.play();
      if (!p || !p.then) { started = true; return; }
      p.then(() => { started = true; }).catch(() => { /* 等首次交互 */ });
    };

    audio.addEventListener("error", () => {
      broken = true;
      console.warn("[bgm] 没找到 " + state.site.bgm);
    });

    // 首次交互（点击 / 触摸 / 按键）即开始播放，之后再无人为控制
    const events = ["pointerdown", "touchstart", "keydown"];
    const onFirst = () => { play(); };

    events.forEach((ev) => window.addEventListener(ev, onFirst, { passive: true }));

    // 交互成功后解绑，避免重复触发
    audio.addEventListener("playing", () => {
      started = true;
      events.forEach((ev) => window.removeEventListener(ev, onFirst));
    });

    // 静音状态下先起播（部分浏览器允许），只为缩短首响延迟
    window.addEventListener("load", () => {
      setTimeout(() => {
        if (started || broken) return;
        audio.muted = true;
        const p = audio.play();
        if (p && p.catch) {
          p.then(() => { audio.muted = false; }).catch(() => { audio.muted = false; play(); });
        }
      }, 200);
    });
  }

  /* ---------------- 5. 灯箱 ---------------- */

  const lb = { root: null, img: null, count: null, images: [], index: 0, scale: 1 };

  function paintLightbox() {
    lb.scale = 1;
    lb.img.style.transform = "scale(1)";
    lb.img.src = lb.images[lb.index];
    lb.count.textContent = (lb.index + 1) + " / " + lb.images.length;
  }

  function openLightbox(images, index) {
    lb.images = images;
    lb.index = index;
    lb.root.classList.add("show");
    lb.root.classList.toggle("multi", images.length > 1);
    lb.root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    paintLightbox();
  }

  function closeLightbox() {
    lb.root.classList.remove("show");
    lb.root.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lb.img.removeAttribute("src");
  }

  function step(delta) {
    if (lb.images.length < 2) return;
    lb.index = (lb.index + delta + lb.images.length) % lb.images.length;
    paintLightbox();
  }

  function zoom(factor) {
    lb.scale = Math.min(4, Math.max(1, lb.scale * factor));
    lb.img.style.transform = "scale(" + lb.scale + ")";
  }

  const touchDist = (e) => Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );

  function bindLightbox() {
    lb.root  = $("#lightbox");
    lb.img   = $("#lbImg");
    lb.count = $("#lbCount");

    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
    $("#lbNext").addEventListener("click", (e) => { e.stopPropagation(); step(1); });

    lb.root.addEventListener("click", (e) => { if (e.target === lb.root) closeLightbox(); });

    lb.root.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.12 : 0.9);
    }, { passive: false });

    let dist = 0;
    lb.root.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) dist = touchDist(e);
    }, { passive: true });

    lb.root.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const now = touchDist(e);
      if (dist) {
        lb.scale = Math.min(4, Math.max(1, lb.scale * (now / dist)));
        lb.img.style.transform = "scale(" + lb.scale + ")";
      }
      dist = now;
    }, { passive: false });

    let startX = null;
    lb.root.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    }, { passive: true });

    lb.root.addEventListener("touchend", (e) => {
      if (startX == null || lb.scale > 1) { startX = null; return; }
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      startX = null;
    });

    document.addEventListener("keydown", (e) => {
      if (!lb.root.classList.contains("show")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------------- 6. 关注 / 时钟 / 主题 ---------------- */

  function bindFollow() {
    const btn = $("#followBtn");
    btn.textContent = state.profile.followingLabel;
    btn.classList.add("following");
    btn.addEventListener("click", () => {
      const on = btn.classList.toggle("following");
      btn.textContent = on ? state.profile.followingLabel : "Follow";
    });
  }

  function startClock() {
    const node = $("#clock");
    const tick = () => {
      const d = new Date();
      node.textContent =
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0");
    };
    tick();
    setInterval(tick, 15000);
  }

  function bindTheme() {
    const KEY = "wen-theme";
    const apply = (dark) => {
      document.body.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply(localStorage.getItem(KEY) === "dark");
    $("#themeBtn").addEventListener("click", () => {
      const dark = !document.body.classList.contains("dark");
      apply(dark);
      localStorage.setItem(KEY, dark ? "dark" : "light");
    });
  }

  /* ---------------- 启动 ---------------- */

  document.addEventListener("DOMContentLoaded", () => {
    bindLightbox();
    bindTheme();
    bindFollow();
    bindLock();
    bindBgm();
    startClock();
    renderProfile();
    renderTabs();
    renderFeed();
  });
})();
