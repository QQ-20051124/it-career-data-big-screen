// 图片头像列表（使用 GenerateImage 生成的可爱卡通头像）
const imageAvatars = [
  '/src/assets/avatars/avatar1.jpg',
  '/src/assets/avatars/avatar2.jpg',
  '/src/assets/avatars/avatar3.jpg',
  '/src/assets/avatars/avatar4.jpg',
  '/src/assets/avatars/avatar5.jpg',
  '/src/assets/avatars/avatar6.jpg',
  '/src/assets/avatars/avatar7.jpg',
  '/src/assets/avatars/avatar8.jpg',
  '/src/assets/avatars/avatar9.jpg',
  '/src/assets/avatars/avatar10.jpg',
  '/src/assets/avatars/avatar11.jpg',
  '/src/assets/avatars/avatar12.jpg',
  '/src/assets/avatars/avatar13.jpg',
  '/src/assets/avatars/avatar14.jpg',
  '/src/assets/avatars/avatar15.jpg',
  '/src/assets/avatars/avatar16.jpg',
  '/src/assets/avatars/avatar17.jpg',
  '/src/assets/avatars/avatar18.jpg',
  '/src/assets/avatars/avatar19.jpg',
  '/src/assets/avatars/avatar20.jpg',
  '/src/assets/avatars/avatar21.jpg',
  '/src/assets/avatars/avatar22.jpg',
  '/src/assets/avatars/avatar23.jpg',
  '/src/assets/avatars/avatar24.jpg',
  '/src/assets/avatars/avatar25.jpg',
  '/src/assets/avatars/avatar26.jpg',
  '/src/assets/avatars/avatar27.jpg',
  '/src/assets/avatars/avatar28.jpg',
  '/src/assets/avatars/avatar29.jpg',
  '/src/assets/avatars/avatar30.jpg',
  '/src/assets/avatars/avatar31.jpg',
  '/src/assets/avatars/avatar32.jpg',
  '/src/assets/avatars/avatar33.jpg',
  '/src/assets/avatars/avatar34.jpg',
  '/src/assets/avatars/avatar35.jpg',
  '/src/assets/avatars/avatar36.jpg',
  '/src/assets/avatars/avatar37.jpg',
  '/src/assets/avatars/avatar38.jpg',
  '/src/assets/avatars/avatar39.jpg',
  '/src/assets/avatars/avatar40.jpg',
  '/src/assets/avatars/avatar41.jpg',
  '/src/assets/avatars/avatar42.jpg',
  '/src/assets/avatars/avatar43.jpg',
  '/src/assets/avatars/avatar44.jpg',
  '/src/assets/avatars/avatar45.jpg',
  '/src/assets/avatars/avatar46.jpg',
  '/src/assets/avatars/avatar47.jpg',
  '/src/assets/avatars/avatar48.jpg',
  '/src/assets/avatars/avatar49.jpg',
  '/src/assets/avatars/avatar50.jpg'
]

// SVG 头像后备列表
const cartoonAvatars = [
  // 1: 橘子汽水男生 - 橙色短发
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset="1" stop-color="#fed7aa"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg1)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M60 92 Q58 68 70 60 Q85 52 100 52 Q115 52 130 60 Q142 68 140 92 Q136 82 125 76 Q112 70 100 70 Q88 70 75 76 Q64 82 60 92" fill="#fb923c"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#fb923c" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 2: 薄荷女生 - 薄荷绿双马尾
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d1fae5"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg2)"/>
    <ellipse cx="60" cy="140" rx="22" ry="28" fill="#34d399"/>
    <ellipse cx="140" cy="140" rx="22" ry="28" fill="#34d399"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#34d399"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#34d399" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="75" cy="82" r="5" fill="#10b981"/>
    <circle cx="125" cy="82" r="5" fill="#10b981"/>
  </svg>`,

  // 3: 蓝莓男生 - 蓝紫色齐发
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0e7ff"/><stop offset="1" stop-color="#c7d2fe"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg3)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#6366f1"/>
    <rect x="58" y="85" width="84" height="10" rx="4" fill="#6366f1"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#6366f1" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 4: 草莓女生 - 红色卷发蝴蝶结
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fecaca"/><stop offset="1" stop-color="#fbbf24"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg4)"/>
    <path d="M72 48 L65 40 L65 55 Z" fill="#ef4444"/>
    <path d="M72 48 L80 40 L80 55 Z" fill="#ef4444"/>
    <circle cx="72" cy="48" r="3" fill="#fbbf24"/>
    <ellipse cx="65" cy="135" rx="18" ry="24" fill="#ef4444"/>
    <ellipse cx="135" cy="135" rx="18" ry="24" fill="#ef4444"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#ef4444"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#ef4444" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 5: 柠檬男生 - 黄白色系
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg5)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M60 92 Q58 68 72 60 Q87 54 100 54 Q113 54 128 60 Q142 68 140 92 Q136 82 125 76 Q112 70 100 70 Q88 70 75 76 Q64 82 60 92" fill="#eab308"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#eab308" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M90 150 Q100 158 110 150" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="98" r="4" fill="#fbbf24"/>
  </svg>`,

  // 6: 樱花女生 - 粉色长发
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fce7f3"/><stop offset="1" stop-color="#fbcfe8"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg6)"/>
    <ellipse cx="58" cy="145" rx="20" ry="30" fill="#ec4899"/>
    <ellipse cx="142" cy="145" rx="20" ry="30" fill="#ec4899"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M55 92 Q52 62 68 55 Q85 48 100 48 Q115 48 132 55 Q148 62 145 92 Q140 82 128 76 Q115 70 100 70 Q85 70 72 76 Q60 82 55 92" fill="#f472b6"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#f472b6" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g transform="translate(100 55)">
      <circle cx="0" cy="0" r="5" fill="#f9a8d4"/>
      <circle cx="-7" cy="-3" r="3" fill="#fbcfe8"/>
      <circle cx="7" cy="-3" r="3" fill="#fbcfe8"/>
      <circle cx="0" cy="-7" r="2.5" fill="#f9a8d4"/>
      <circle cx="-5" cy="3" r="2.5" fill="#fbcfe8"/>
      <circle cx="5" cy="3" r="2.5" fill="#fbcfe8"/>
    </g>
  </svg>`,

  // 7: 咖啡男生 - 棕色系
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg7" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0c3fc"/><stop offset="1" stop-color="#d8b4fe"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg7)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#92400e"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#92400e" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M88 96 Q95 92 100 96 Q105 92 112 96" stroke="#fbbf24" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 8: 天空女生 - 蓝色猫耳
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg8" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg8)"/>
    <polygon points="62,82 55,55 78,72" fill="#60a5fa"/>
    <polygon points="138,82 145,55 122,72" fill="#60a5fa"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#60a5fa"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#60a5fa" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M97 146 L100 150 L103 146" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 9: 抹茶男生 - 绿色眼镜
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg9" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f99d"/><stop offset="1" stop-color="#bef264"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg9)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#4d7c0f"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#4d7c0f" stroke-width="1"/>
    <circle cx="82" cy="127" r="14" fill="none" stroke="#365314" stroke-width="2.5"/>
    <circle cx="118" cy="127" r="14" fill="none" stroke="#365314" stroke-width="2.5"/>
    <line x1="96" y1="127" x2="104" y2="127" stroke="#365314" stroke-width="2.5"/>
    <ellipse cx="82" cy="127" rx="5" ry="6" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="5" ry="6" fill="#2d3748"/>
    <ellipse cx="70" cy="143" rx="5" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="5" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 156 108 152" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 10: 云朵女生 - 白色蓬松发
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg10" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0e7ff"/><stop offset="1" stop-color="#ede9fe"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg10)"/>
    <circle cx="72" cy="70" r="14" fill="#f5f5f4"/>
    <circle cx="100" cy="58" r="18" fill="#f5f5f4"/>
    <circle cx="128" cy="70" r="14" fill="#f5f5f4"/>
    <ellipse cx="85" cy="75" rx="14" ry="10" fill="#f5f5f4"/>
    <ellipse cx="115" cy="75" rx="14" ry="10" fill="#f5f5f4"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#d6d3d1" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 11: 西瓜男生 - 绿皮红瓤
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg11" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fecaca"/><stop offset="1" stop-color="#fca5a5"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg11)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#22c55e"/>
    <path d="M58 85 Q85 78 100 78 Q115 78 142 85" stroke="#ef4444" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#22c55e" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 12: 樱桃女生 - 双丸子头
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg12" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbcfe8"/><stop offset="1" stop-color="#f9a8d4"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg12)"/>
    <circle cx="62" cy="55" r="22" fill="#be185d"/>
    <circle cx="138" cy="55" r="22" fill="#be185d"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#be185d"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#be185d" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="56" cy="50" r="6" fill="#fbbf24"/>
    <circle cx="144" cy="50" r="6" fill="#fbbf24"/>
  </svg>`,

  // 13: 紫薯男生 - 深紫色
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg13" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ddd6fe"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg13)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M56 92 Q52 60 70 52 Q85 46 100 46 Q115 46 130 52 Q148 60 144 92 Q140 82 128 76 Q115 70 100 70 Q85 70 72 76 Q60 82 56 92" fill="#7c3aed"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#7c3aed" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 14: 彩虹女生 - 彩虹色发带
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg14" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset="1" stop-color="#fce7f3"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg14)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#fcd34d"/>
    <rect x="58" y="80" width="84" height="6" rx="3" fill="none" stroke="#ef4444" stroke-width="2"/>
    <line x1="58" y1="83" x2="142" y2="83" stroke="#ef4444" stroke-width="4"/>
    <line x1="58" y1="86" x2="142" y2="86" stroke="#f59e0b" stroke-width="4"/>
    <line x1="58" y1="89" x2="142" y2="89" stroke="#22c55e" stroke-width="4"/>
    <line x1="58" y1="92" x2="142" y2="92" stroke="#3b82f6" stroke-width="4"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#fcd34d" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 15: 哈密瓜男生 - 橙黄色
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg15" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fed7aa"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg15)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#fb923c"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#fb923c" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="3" fill="#fbbf24"/>
  </svg>`,

  // 16: 棉花糖女生 - 蓝粉双色
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg16" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0e7ff"/><stop offset="1" stop-color="#fce7f3"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg16)"/>
    <circle cx="75" cy="68" r="14" fill="#818cf8"/>
    <circle cx="100" cy="55" r="16" fill="#f472b6"/>
    <circle cx="125" cy="68" r="14" fill="#818cf8"/>
    <ellipse cx="85" cy="73" rx="12" ry="8" fill="#818cf8"/>
    <ellipse cx="115" cy="73" rx="12" ry="8" fill="#818cf8"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#c4b5fd" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 17: 熊猫男生 - 黑白配色
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg17" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f4f6"/><stop offset="1" stop-color="#e5e7eb"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg17)"/>
    <circle cx="68" cy="55" r="16" fill="#1f2937"/>
    <circle cx="132" cy="55" r="16" fill="#1f2937"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#fafafa"/>
    <path d="M58 92 Q56 65 70 58 Q85 50 100 50 Q115 50 130 58 Q144 65 142 92 Q138 82 128 76 Q115 70 100 70 Q85 70 72 76 Q62 82 58 92" fill="#1f2937"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#1f2937" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#1f2937"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#1f2937"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#fca5a5" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#fca5a5" opacity="0.5"/>
    <ellipse cx="100" cy="142" rx="4" ry="3" fill="#1f2937"/>
    <path d="M92 152 Q100 158 108 152" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 18: 糖果女生 - 多彩糖珠
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg18" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset="1" stop-color="#fce7f3"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg18)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M56 92 Q52 60 70 52 Q85 46 100 46 Q115 46 130 52 Q148 60 144 92 Q140 82 128 76 Q115 70 100 70 Q85 70 72 76 Q60 82 56 92" fill="#fb923c"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#fb923c" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="72" cy="88" r="4" fill="#f472b6"/>
    <circle cx="100" cy="82" r="4" fill="#60a5fa"/>
    <circle cx="128" cy="88" r="4" fill="#34d399"/>
    <circle cx="86" cy="94" r="3" fill="#a78bfa"/>
    <circle cx="114" cy="94" r="3" fill="#fbbf24"/>
  </svg>`,

  // 19: 海洋男生 - 蓝色系
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg19" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfdbfe"/><stop offset="1" stop-color="#93c5fd"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg19)"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M56 92 Q52 60 70 52 Q85 46 100 46 Q115 46 130 52 Q148 60 144 92 Q140 82 128 76 Q115 70 100 70 Q85 70 72 76 Q60 82 56 92" fill="#2563eb"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#2563eb" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M65 98 Q68 92 72 98" stroke="#60a5fa" stroke-width="2" fill="none"/>
    <path d="M128 95 Q132 88 136 95" stroke="#60a5fa" stroke-width="2" fill="none"/>
  </svg>`,

  // 20: 奶昔女生 - 米色系双马尾
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs><linearGradient id="bg20" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#bg20)"/>
    <ellipse cx="56" cy="140" rx="20" ry="30" fill="#d97706"/>
    <ellipse cx="144" cy="140" rx="20" ry="30" fill="#d97706"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="#ffe0bd"/>
    <path d="M56 92 Q52 60 70 52 Q85 46 100 46 Q115 46 130 52 Q148 60 144 92 Q140 82 128 76 Q115 70 100 70 Q85 70 72 76 Q60 82 56 92" fill="#d97706"/>
    <ellipse cx="100" cy="130" rx="40" ry="42" fill="none" stroke="#d97706" stroke-width="1"/>
    <ellipse cx="82" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <ellipse cx="118" cy="127" rx="6" ry="8" fill="#2d3748"/>
    <circle cx="83" cy="125" r="3" fill="#fff"/>
    <circle cx="119" cy="125" r="3" fill="#fff"/>
    <ellipse cx="70" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <ellipse cx="130" cy="143" rx="6" ry="3" fill="#ffb3ba" opacity="0.5"/>
    <path d="M92 152 Q100 158 108 152" stroke="#2d3748" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="50" y="88" width="14" height="6" rx="3" fill="#fbbf24"/>
    <rect x="136" y="88" width="14" height="6" rx="3" fill="#fbbf24"/>
  </svg>`
]

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function svgToBase64(svg) {
  try {
    const utf8Bytes = new TextEncoder().encode(svg)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    return btoa(binary)
  } catch (e) {
    console.warn('Base64 encoding failed, using fallback')
    return ''
  }
}

// 使用webpack的require.context动态加载所有头像图片
const avatarImages = require.context('../assets/avatars', false, /\.jpg$/)
const avatarImageUrls = avatarImages.keys().map(key => avatarImages(key))

export function generateAvatar(name) {
  try {
    // 优先使用图片头像
    if (avatarImageUrls.length > 0) {
      const index = name ? hashCode(name) % avatarImageUrls.length : Math.floor(Math.random() * avatarImageUrls.length)
      return avatarImageUrls[index]
    }
    // 后备使用SVG头像
    const index = name ? hashCode(name) % cartoonAvatars.length : Math.floor(Math.random() * cartoonAvatars.length)
    const svg = cartoonAvatars[index]
    const base64String = svgToBase64(svg)
    if (base64String) {
      return `data:image/svg+xml;base64,${base64String}`
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  } catch (e) {
    console.warn('generateAvatar failed:', e)
    return ''
  }
}

export function getRandomAvatar() {
  try {
    // 优先使用图片头像
    if (avatarImageUrls.length > 0) {
      const index = Math.floor(Math.random() * avatarImageUrls.length)
      return avatarImageUrls[index]
    }
    // 后备使用SVG头像
    const index = Math.floor(Math.random() * cartoonAvatars.length)
    const svg = cartoonAvatars[index]
    const base64String = svgToBase64(svg)
    if (base64String) {
      return `data:image/svg+xml;base64,${base64String}`
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  } catch (e) {
    console.warn('getRandomAvatar failed:', e)
    return ''
  }
}

export function getAvatarCount() {
  return avatarImageUrls.length > 0 ? avatarImageUrls.length : cartoonAvatars.length
}

export function generateGuestName() {
  const randomNum = Math.floor(Math.random() * 9000 + 1000)
  const prefixes = ['小萌', '小可爱', '萌新', '小萌新', '萌仔', '小蛋', '蛋蛋', '小团子', '团子', '小宝贝']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  return `${prefix}_${randomNum}`
}
