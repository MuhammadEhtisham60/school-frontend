export const THEME_STORAGE_KEY = "edupulse:theme";

export const THEMES = [
  {
    id: "default",
    name: "EduPulse Classic",
    description: "Rich indigo-violet brand palette with clean light surfaces.",
    swatches: [
      { label: "Primary", hex: "#5b3df5" },
      { label: "Glow", hex: "#b845e6" },
      { label: "Surface", hex: "#f8f8fc" },
      { label: "Sidebar", hex: "#fcfcfe" },
      { label: "Ink", hex: "#1e2336" },
    ],
  },
  {
    id: "luxray",
    name: "Luxray",
    description: "Molten lava & brick red paired with deep space blue and papaya whip.",
    swatches: [
      { label: "Molten Lava", hex: "#780000" },
      { label: "Brick Red", hex: "#c1121f" },
      { label: "Papaya Whip", hex: "#fdf0d5" },
      { label: "Deep Space Blue", hex: "#003049" },
      { label: "Steel Blue", hex: "#669bbc" },
    ],
  },
  {
    id: "royal",
    name: "Royal",
    description: "Olive leaf & black forest balanced with cornsilk, sunlit clay, and copperwood.",
    swatches: [
      { label: "Olive Leaf", hex: "#606c38" },
      { label: "Black Forest", hex: "#283618" },
      { label: "Cornsilk", hex: "#fefae0" },
      { label: "Sunlit Clay", hex: "#dda15e" },
      { label: "Copperwood", hex: "#bc6c25" },
    ],
  },
  {
    id: "asthetic",
    name: "Asthetic",
    description: "Hunter green & fresh sky accented with royal gold, steel blue, and mahogany red.",
    swatches: [
      { label: "Mahogany Red", hex: "#bf211e" },
      { label: "Steel Blue", hex: "#71a2b6" },
      { label: "Royal Gold", hex: "#f9dc5c" },
      { label: "Fresh Sky", hex: "#60b2e5" },
      { label: "Hunter Green", hex: "#3f6c51" },
    ],
  },
  {
    id: "dream",
    name: "Dream",
    description: "Pearl aqua & mint leaf paired with pacific cyan, dark teal, and deep space blue.",
    swatches: [
      { label: "Pearl Aqua", hex: "#75dddd" },
      { label: "Pacific Cyan", hex: "#508991" },
      { label: "Deep Space Blue", hex: "#172a3a" },
      { label: "Dark Teal", hex: "#004346" },
      { label: "Mint Leaf", hex: "#09bc8a" },
    ],
  },
  {
    id: "teiwilight",
    name: "Teiwilight",
    description: "Violet twilight & dark amethyst paired with soft periwinkle, indigo, and frozen lake.",
    swatches: [
      { label: "Frozen Lake", hex: "#97dffc" },
      { label: "Soft Periwinkle", hex: "#858ae3" },
      { label: "Violet Twilight", hex: "#613dc1" },
      { label: "Indigo", hex: "#4e148c" },
      { label: "Dark Amethyst", hex: "#2c0735" },
    ],
  },
  {
    id: "delight",
    name: "Delight",
    description: "Dusty mauve & cherry blossom softened with pastel pink, powder petal, and alabaster grey.",
    swatches: [
      { label: "Alabaster Grey", hex: "#d8e2dc" },
      { label: "Powder Petal", hex: "#ffe5d9" },
      { label: "Pastel Pink", hex: "#ffcad4" },
      { label: "Cherry Blossom", hex: "#f4acb7" },
      { label: "Dusty Mauve", hex: "#9d8189" },
    ],
  },
];

export function getSavedTheme() {
  if (typeof window === "undefined") return "default";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.some((t) => t.id === saved) ? saved : "default";
}

export function applyTheme(themeId) {
  const validId = THEMES.some((t) => t.id === themeId) ? themeId : "default";
  if (typeof document !== "undefined") {
    if (validId === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", validId);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, validId);
  }
  return validId;
}

const THEME_PDF_PALETTES = {
  default: {
    bannerRgb: [30, 41, 59],
    bannerHex: "#1e293b",
    accentRgb: [79, 70, 229],
    accentHex: "#4f46e5",
    softBgRgb: [241, 245, 249],
    softBgHex: "#f1f5f9",
    highlightRowRgb: [238, 242, 255],
    highlightRowHex: "#eef2ff",
    borderRgb: [203, 213, 225],
    borderHex: "#cbd5e1",
    inkRgb: [15, 23, 42],
    inkHex: "#0f172a",
    mutedRgb: [71, 85, 105],
    mutedHex: "#475569",
  },
  luxray: {
    bannerRgb: [0, 48, 73],
    bannerHex: "#003049",
    accentRgb: [193, 18, 31],
    accentHex: "#c1121f",
    softBgRgb: [253, 240, 213],
    softBgHex: "#fdf0d5",
    highlightRowRgb: [230, 240, 245],
    highlightRowHex: "#e6f0f5",
    borderRgb: [234, 219, 192],
    borderHex: "#eadbc0",
    inkRgb: [0, 48, 73],
    inkHex: "#003049",
    mutedRgb: [59, 93, 115],
    mutedHex: "#3b5d73",
  },
  royal: {
    bannerRgb: [40, 54, 24],
    bannerHex: "#283618",
    accentRgb: [96, 108, 56],
    accentHex: "#606c38",
    softBgRgb: [254, 250, 224],
    softBgHex: "#fefae0",
    highlightRowRgb: [246, 232, 212],
    highlightRowHex: "#f6e8d4",
    borderRgb: [232, 223, 192],
    borderHex: "#e8dfc0",
    inkRgb: [40, 54, 24],
    inkHex: "#283618",
    mutedRgb: [82, 94, 54],
    mutedHex: "#525e36",
  },
  asthetic: {
    bannerRgb: [31, 59, 44],
    bannerHex: "#1f3b2c",
    accentRgb: [63, 108, 81],
    accentHex: "#3f6c51",
    softBgRgb: [238, 245, 248],
    softBgHex: "#eef5f8",
    highlightRowRgb: [254, 247, 214],
    highlightRowHex: "#fef7d6",
    borderRgb: [217, 230, 236],
    borderHex: "#d9e6ec",
    inkRgb: [28, 49, 39],
    inkHex: "#1c3127",
    mutedRgb: [74, 107, 120],
    mutedHex: "#4a6b78",
  },
  dream: {
    bannerRgb: [23, 42, 58],
    bannerHex: "#172a3a",
    accentRgb: [0, 67, 70],
    accentHex: "#004346",
    softBgRgb: [228, 247, 247],
    softBgHex: "#e4f7f7",
    highlightRowRgb: [223, 250, 243],
    highlightRowHex: "#dffaf3",
    borderRgb: [204, 229, 231],
    borderHex: "#cce5e7",
    inkRgb: [23, 42, 58],
    inkHex: "#172a3a",
    mutedRgb: [63, 107, 114],
    mutedHex: "#3f6b72",
  },
  teiwilight: {
    bannerRgb: [44, 7, 53],
    bannerHex: "#2c0735",
    accentRgb: [97, 61, 193],
    accentHex: "#613dc1",
    softBgRgb: [238, 240, 253],
    softBgHex: "#eef0fd",
    highlightRowRgb: [229, 246, 254],
    highlightRowHex: "#e5f6fe",
    borderRgb: [220, 218, 244],
    borderHex: "#dcdaf4",
    inkRgb: [44, 7, 53],
    inkHex: "#2c0735",
    mutedRgb: [89, 70, 132],
    mutedHex: "#594684",
  },
  delight: {
    bannerRgb: [74, 53, 59],
    bannerHex: "#4a353b",
    accentRgb: [157, 129, 137],
    accentHex: "#9d8189",
    softBgRgb: [255, 229, 217],
    softBgHex: "#ffe5d9",
    highlightRowRgb: [255, 202, 212],
    highlightRowHex: "#ffcad4",
    borderRgb: [216, 226, 220],
    borderHex: "#d8e2dc",
    inkRgb: [63, 45, 51],
    inkHex: "#3f2d33",
    mutedRgb: [111, 87, 95],
    mutedHex: "#6f575f",
  },
};

export function getThemeColors(themeId = getSavedTheme()) {
  return THEME_PDF_PALETTES[themeId] || THEME_PDF_PALETTES.default;
}
