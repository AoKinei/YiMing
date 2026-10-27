/* =========================================================
   页面内容配置
   ---------------------------------------------------------
   图片命名规则：assets/p<帖子编号>-<第几张>.jpeg
   例：第 3 条帖子的第 2 张 = assets/p03-2.jpeg
   没有的图显示灰块 + 文件名，不影响布局，也不报错。
   ========================================================= */

/* 按「帖子编号 + 张数」批量生成图片路径 */
const IMG = (no, count) =>
  Array.from({ length: count }, (_, i) =>
    `assets/p${String(no).padStart(2, "0")}-${i + 1}.jpeg`);

const PAGE = {

  site: {
    password: "0724",                         // 右上角小锁的密码
    bgm: "assets/bgm.mp3",                    // 本地音乐（放这个文件才会自动播）
    bgmTitle: "泪是无法临摹的雨季",             // 歌名，仅用于提示
    bgmUrl: "https://music.163.com/#/search/m/?s=泪是无法临摹的雨季",
    bgmVolume: 0.55,
    pin: {
      text: "文档跳转",
      href: "https://www.kdocs.cn/l/cd7YGQDbUWdY"
    }
  },

  /* ---------- 顶部资料 ---------- */
  profile: {
    name: "佚名",
    title: "你甚至找不到一丝我的痕迹。",        // 顶栏昵称下面的小字
    handle: "@YiMing51",
    avatar: "assets/avatar-1.jpeg",
    banner: "assets/banner-2.jpeg",
    following: 1,
    followers: "28k",
    bio: "我仍做着有你的梦。",
    location: "雾山影",
    tag: "赛博牛郎",
    followingLabel: "Following"
  },

  /* ---------- 分栏 ---------- */
  tabs: [
    { id: "about",   name: "关于" },
    { id: "pingjia", name: "评价" },
    { id: "huashu",  name: "话术" },
    { id: "kalei",   name: "卡类" },
    { id: "xuzhi",   name: "须知" }
  ],

  /* ---------- 推文 ---------- */
  posts: [
    /* ===== 关于 ===== */
    {
      id: "p01",
      tab: "about",
      text:
        "-25 T 金牛 ENFP/INTJ\n" +
        "-营业时间纯随机爱自由\n" +
        "-建模1.6虚荣眼镜｜0.8初始\n" +
        "-纯连 哄睡 树洞 纯虚 三恋 DS 唱歌 占卜 端游 教学\n" +
        "-全能女人并非全职陪玩 能够相遇证明我们有缘\n" +
        "-不需要抱有太大期待并记住我是谁 因为我本就无名",
      images: IMG(1, 1),
      views: 999, quotes: 0, reply: "99+", repost: 42, like: 58
    },
    {
      id: "p02",
      tab: "about",
      text: "以下为本人风格概述，风格并非一成不变，什么风格纯凭当日状态，如有特别偏爱的倾向可定制",
      images: IMG(2, 1),
      views: 612, quotes: 3, reply: 12, repost: 8, like: 76
    },

    /* ===== 评价 ===== */
    {
      id: "p03",
      tab: "pingjia",
      text: "近期虚恋评价",
      images: IMG(3, 2),
      views: 1203, quotes: 6, reply: 21, repost: 15, like: 133
    },
    {
      id: "p04",
      tab: "pingjia",
      text: "近期病恋评价",
      images: IMG(4, 3),
      views: 986, quotes: 4, reply: 17, repost: 11, like: 102
    },
    {
      id: "p05",
      tab: "pingjia",
      text: "近期虐恋评价",
      images: IMG(5, 1),
      views: 842, quotes: 2, reply: 14, repost: 9, like: 88
    },
    {
      id: "p06",
      tab: "pingjia",
      text: "一些板评卡",
      images: IMG(6, 9),
      views: 735, quotes: 1, reply: 10, repost: 6, like: 71
    },
    {
      id: "p07",
      tab: "pingjia",
      text: "三恋接单约600+，有效板评合计200+，仅展示部分评价",
      images: [],
      views: 1560, quotes: 0, reply: 7, repost: 3, like: 64
    },

    /* ===== 话术 ===== */
    {
      id: "p08",
      tab: "huashu",
      text: "虚恋近期话术",
      images: IMG(8, 3),
      views: 664, quotes: 3, reply: 9, repost: 5, like: 58
    },
    {
      id: "p09",
      tab: "huashu",
      text: "病恋近期话术",
      images: IMG(9, 4),
      views: 591, quotes: 2, reply: 8, repost: 4, like: 49
    },
    {
      id: "p10",
      tab: "huashu",
      text: "虐恋近期话术",
      images: IMG(10, 6),
      views: 512, quotes: 1, reply: 6, repost: 3, like: 43
    },
    {
      id: "p11",
      tab: "huashu",
      text: "请勿任何形式的抄袭/模仿等行为出现，一经发现按照单价*10补偿，其余话术/视频可以去dy查看，dy号：Y1M1NG.le",
      images: [],
      views: 388, quotes: 0, reply: 4, repost: 2, like: 31
    },

    /* ===== 卡类 ===== */
    {
      id: "p12",
      tab: "kalei",
      text: "历届古老头牌卡",
      images: IMG(12, 4),
      views: 476, quotes: 2, reply: 5, repost: 3, like: 39
    },
    {
      id: "p13",
      tab: "kalei",
      text: "审核头牌",
      images: IMG(13, 1),
      views: 302, quotes: 0, reply: 2, repost: 1, like: 24
    },

    /* ===== 须知 ===== */
    {
      id: "p14",
      tab: "xuzhi",
      text:
        "·下单后请您告知具体时间，鸽单大于等于2次默认送单\n" +
        "·若您迟到至多等待5min并无偿还\n" +
        "·婉拒家花/wcn/人妻/一陪多\n" +
        "·如有不适可说出安全词“无名”或10min内无理由退换\n" +
        "·请勿恶意辱骂，找茬，砸场，情感漠视，嘻嘻哈哈等恶搞行为出现\n" +
        "·请勿私自截屏/直播/外传约会内容\n" +
        "·最终解释权归佚名所有",
      images: [],
      views: 1830, quotes: 0, reply: 6, repost: 2, like: 57
    },
    {
      id: "p15",
      tab: "xuzhi",
      text: "图片须知",
      images: IMG(15, 4),
      views: 421, quotes: 0, reply: 3, repost: 1, like: 28
    },
    {
      id: "p16",
      tab: "xuzhi",
      text: "你能抓得住风吗？",
      images: [],
      views: 267, quotes: 0, reply: 2, repost: 1, like: 19
    }
  ]
};
