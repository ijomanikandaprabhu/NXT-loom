import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  money as fmtMoney,
  moneyCompact as fmtMoneyCompact,
  type MarketCode,
  type CurrencyCode,
} from "@/data/locale";
import { useOrg } from "@/lib/org-store";
import { useAuth } from "@/lib/auth";

export type LangCode = "en" | "id" | "ms" | "th" | "vi" | "fil";

export type Language = {
  code: LangCode;
  name: string;
  nativeName: string;
  /** Markets where this language is a working language. */
  markets: MarketCode[];
};

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", markets: ["SG", "MY", "PH", "TH"] },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", markets: ["ID"] },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", markets: ["MY"] },
  { code: "th", name: "Thai", nativeName: "ไทย", markets: ["TH"] },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", markets: ["VN"] },
  { code: "fil", name: "Filipino", nativeName: "Filipino", markets: ["PH"] },
];

/** Default working language per market. */
const defaultLangFor: Record<string, LangCode> = {
  SG: "en",
  MY: "ms",
  ID: "id",
  TH: "th",
  VN: "vi",
  PH: "fil",
};

type Dict = Record<string, string>;

const en: Dict = {
  // shell
  "nav.copilot": "Copilot",
  "nav.products": "Products",
  "nav.flows": "Flows",
  "nav.placements": "Placements",
  "nav.runs": "Runs",
  "nav.items": "Items",
  "nav.insights": "Insights",
  "nav.settings": "Settings",
  "group.build": "Build",
  "group.run": "Run",
  "group.govern": "Govern",
  "shell.production": "Production",
  "shell.market": "Market",
  "shell.language": "Language",
  // common
  "common.search": "Search",
  "common.save": "Save",
  "common.submit": "Submit",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.correct": "Correct",
  "common.flag": "Flag",
  "common.markMissing": "Mark missing",
  "common.new": "New",
  "common.all": "All",
  "common.export": "Export",
  // pages
  "products.title": "Product Builder",
  "products.subtitle":
    "Configure insurance products, plans, and rules without code — then publish to every channel.",
  "products.new": "New product",
  "flows.title": "Flows",
  "flows.subtitle": "Create and manage your flows to automate tasks and processes.",
  "placements.title": "Placements",
  "placements.subtitle":
    "Market a risk to multiple carriers, then compare what came back — including the terms that quietly changed.",
  "placements.new": "New placement",
  "runs.title": "Live Runs",
  "runs.subtitle": "Every execution across your workspaces, with node-level trace and recovery.",
  "items.title": "Work Items",
  "insights.title": "Ops Insights",
  "insights.subtitle":
    "Automation quality, throughput, and cost across every line of business. Last 30 days.",
  "settings.title": "Settings",
  "settings.subtitle": "Manage your organization settings, users, and resources.",
  "assistant.greeting": "Good evening",
  "assistant.help": "How can I help with your work today?",
  "assistant.placeholder": "Ask me about your projects, flows, or workspace",
  "assistant.newChat": "New Conversation",
  "assistant.conversations": "Your Conversations",
  "assistant.disclaimer":
    "NXT Loom Assistant can make mistakes. Please double check its responses.",
};

const id: Dict = {
  "nav.copilot": "Kopilot",
  "nav.products": "Produk",
  "nav.flows": "Alur",
  "nav.placements": "Penempatan",
  "nav.runs": "Eksekusi",
  "nav.items": "Item",
  "nav.insights": "Wawasan",
  "nav.settings": "Pengaturan",
  "group.build": "Bangun",
  "group.run": "Jalankan",
  "group.govern": "Kelola",
  "shell.production": "Produksi",
  "shell.market": "Pasar",
  "shell.language": "Bahasa",
  "common.search": "Cari",
  "common.save": "Simpan",
  "common.submit": "Kirim",
  "common.cancel": "Batal",
  "common.confirm": "Konfirmasi",
  "common.correct": "Perbaiki",
  "common.flag": "Tandai",
  "common.markMissing": "Tandai hilang",
  "common.new": "Baru",
  "common.all": "Semua",
  "common.export": "Ekspor",
  "products.title": "Pembuat Produk",
  "products.subtitle":
    "Konfigurasikan produk asuransi, paket, dan aturan tanpa kode — lalu terbitkan ke semua kanal.",
  "products.new": "Produk baru",
  "flows.title": "Alur",
  "flows.subtitle": "Buat dan kelola alur untuk mengotomatiskan tugas dan proses.",
  "placements.title": "Penempatan",
  "placements.subtitle":
    "Tawarkan risiko ke beberapa penanggung, lalu bandingkan hasilnya — termasuk ketentuan yang diam-diam berubah.",
  "placements.new": "Penempatan baru",
  "runs.title": "Eksekusi Langsung",
  "runs.subtitle": "Setiap eksekusi di seluruh ruang kerja, dengan jejak per-node dan pemulihan.",
  "items.title": "Item Kerja",
  "insights.title": "Wawasan Operasi",
  "insights.subtitle":
    "Kualitas otomatisasi, throughput, dan biaya di setiap lini bisnis. 30 hari terakhir.",
  "settings.title": "Pengaturan",
  "settings.subtitle": "Kelola pengaturan organisasi, pengguna, dan sumber daya Anda.",
  "assistant.greeting": "Selamat malam",
  "assistant.help": "Ada yang bisa saya bantu hari ini?",
  "assistant.placeholder": "Tanyakan tentang proyek, alur, atau ruang kerja Anda",
  "assistant.newChat": "Percakapan Baru",
  "assistant.conversations": "Percakapan Anda",
  "assistant.disclaimer":
    "Asisten NXT Loom dapat membuat kesalahan. Mohon periksa kembali jawabannya.",
};

const ms: Dict = {
  "nav.copilot": "Kopilot",
  "nav.products": "Produk",
  "nav.flows": "Aliran",
  "nav.placements": "Penempatan",
  "nav.runs": "Larian",
  "nav.items": "Item",
  "nav.insights": "Cerapan",
  "nav.settings": "Tetapan",
  "group.build": "Bina",
  "group.run": "Jalan",
  "group.govern": "Tadbir",
  "shell.production": "Pengeluaran",
  "shell.market": "Pasaran",
  "shell.language": "Bahasa",
  "common.search": "Cari",
  "common.save": "Simpan",
  "common.submit": "Hantar",
  "common.cancel": "Batal",
  "common.confirm": "Sahkan",
  "common.correct": "Betulkan",
  "common.flag": "Tanda",
  "common.markMissing": "Tanda hilang",
  "common.new": "Baharu",
  "common.all": "Semua",
  "common.export": "Eksport",
  "products.title": "Pembina Produk",
  "products.subtitle":
    "Konfigurasikan produk insurans, pelan, dan peraturan tanpa kod — kemudian terbitkan ke setiap saluran.",
  "products.new": "Produk baharu",
  "flows.title": "Aliran",
  "flows.subtitle": "Cipta dan urus aliran untuk mengautomasikan tugas dan proses.",
  "placements.title": "Penempatan",
  "placements.subtitle":
    "Tawarkan risiko kepada beberapa penanggung, kemudian bandingkan maklum balas — termasuk terma yang berubah secara senyap.",
  "placements.new": "Penempatan baharu",
  "runs.title": "Larian Langsung",
  "runs.subtitle": "Setiap pelaksanaan merentas ruang kerja anda, dengan jejak per-nod dan pemulihan.",
  "items.title": "Item Kerja",
  "insights.title": "Cerapan Operasi",
  "insights.subtitle":
    "Kualiti automasi, daya pemprosesan, dan kos merentas setiap lini perniagaan. 30 hari lalu.",
  "settings.title": "Tetapan",
  "settings.subtitle": "Urus tetapan organisasi, pengguna, dan sumber anda.",
  "assistant.greeting": "Selamat malam",
  "assistant.help": "Bagaimana saya boleh membantu kerja anda hari ini?",
  "assistant.placeholder": "Tanya tentang projek, aliran, atau ruang kerja anda",
  "assistant.newChat": "Perbualan Baharu",
  "assistant.conversations": "Perbualan Anda",
  "assistant.disclaimer":
    "Pembantu NXT Loom boleh melakukan kesilapan. Sila semak semula jawapannya.",
};

const th: Dict = {
  "nav.copilot": "โคไพลอต",
  "nav.products": "ผลิตภัณฑ์",
  "nav.flows": "โฟลว์",
  "nav.placements": "การจัดวาง",
  "nav.runs": "การทำงาน",
  "nav.items": "รายการ",
  "nav.insights": "ข้อมูลเชิงลึก",
  "nav.settings": "การตั้งค่า",
  "group.build": "สร้าง",
  "group.run": "รัน",
  "group.govern": "กำกับดูแล",
  "shell.production": "โปรดักชัน",
  "shell.market": "ตลาด",
  "shell.language": "ภาษา",
  "common.search": "ค้นหา",
  "common.save": "บันทึก",
  "common.submit": "ส่ง",
  "common.cancel": "ยกเลิก",
  "common.confirm": "ยืนยัน",
  "common.correct": "แก้ไข",
  "common.flag": "ตั้งค่าสถานะ",
  "common.markMissing": "ทำเครื่องหมายว่าขาด",
  "common.new": "ใหม่",
  "common.all": "ทั้งหมด",
  "common.export": "ส่งออก",
  "products.title": "ตัวสร้างผลิตภัณฑ์",
  "products.subtitle":
    "กำหนดค่าผลิตภัณฑ์ประกันภัย แผน และกฎเกณฑ์โดยไม่ต้องเขียนโค้ด แล้วเผยแพร่ไปยังทุกช่องทาง",
  "products.new": "ผลิตภัณฑ์ใหม่",
  "flows.title": "โฟลว์",
  "flows.subtitle": "สร้างและจัดการโฟลว์เพื่อทำงานและกระบวนการโดยอัตโนมัติ",
  "placements.title": "การจัดวาง",
  "placements.subtitle":
    "เสนอความเสี่ยงไปยังผู้รับประกันหลายราย แล้วเปรียบเทียบผลลัพธ์ รวมถึงเงื่อนไขที่เปลี่ยนไปอย่างเงียบๆ",
  "placements.new": "การจัดวางใหม่",
  "runs.title": "การทำงานแบบเรียลไทม์",
  "runs.subtitle": "ทุกการดำเนินการในพื้นที่ทำงานของคุณ พร้อมการติดตามระดับโหนดและการกู้คืน",
  "items.title": "รายการงาน",
  "insights.title": "ข้อมูลเชิงลึกการดำเนินงาน",
  "insights.subtitle": "คุณภาพระบบอัตโนมัติ ปริมาณงาน และต้นทุนในทุกสายธุรกิจ 30 วันที่ผ่านมา",
  "settings.title": "การตั้งค่า",
  "settings.subtitle": "จัดการการตั้งค่าองค์กร ผู้ใช้ และทรัพยากรของคุณ",
  "assistant.greeting": "สวัสดีตอนเย็น",
  "assistant.help": "วันนี้ให้ช่วยอะไรดีคะ?",
  "assistant.placeholder": "ถามเกี่ยวกับโปรเจกต์ โฟลว์ หรือพื้นที่ทำงานของคุณ",
  "assistant.newChat": "การสนทนาใหม่",
  "assistant.conversations": "การสนทนาของคุณ",
  "assistant.disclaimer": "ผู้ช่วย NXT Loom อาจตอบผิดพลาดได้ กรุณาตรวจสอบคำตอบอีกครั้ง",
};

const vi: Dict = {
  "nav.copilot": "Trợ lý",
  "nav.products": "Sản phẩm",
  "nav.flows": "Luồng",
  "nav.placements": "Chào phí",
  "nav.runs": "Lượt chạy",
  "nav.items": "Mục",
  "nav.insights": "Phân tích",
  "nav.settings": "Cài đặt",
  "group.build": "Xây dựng",
  "group.run": "Vận hành",
  "group.govern": "Quản trị",
  "shell.production": "Sản xuất",
  "shell.market": "Thị trường",
  "shell.language": "Ngôn ngữ",
  "common.search": "Tìm kiếm",
  "common.save": "Lưu",
  "common.submit": "Gửi",
  "common.cancel": "Hủy",
  "common.confirm": "Xác nhận",
  "common.correct": "Sửa",
  "common.flag": "Gắn cờ",
  "common.markMissing": "Đánh dấu thiếu",
  "common.new": "Mới",
  "common.all": "Tất cả",
  "common.export": "Xuất",
  "products.title": "Trình tạo sản phẩm",
  "products.subtitle":
    "Cấu hình sản phẩm bảo hiểm, gói và quy tắc mà không cần viết mã — rồi phát hành đến mọi kênh.",
  "products.new": "Sản phẩm mới",
  "flows.title": "Luồng",
  "flows.subtitle": "Tạo và quản lý các luồng để tự động hóa công việc và quy trình.",
  "placements.title": "Chào phí",
  "placements.subtitle":
    "Chào rủi ro tới nhiều nhà bảo hiểm, rồi so sánh phản hồi — bao gồm cả những điều khoản đã âm thầm thay đổi.",
  "placements.new": "Chào phí mới",
  "runs.title": "Lượt chạy trực tiếp",
  "runs.subtitle":
    "Mọi lần thực thi trên các không gian làm việc, kèm nhật ký từng nút và khả năng khôi phục.",
  "items.title": "Mục công việc",
  "insights.title": "Phân tích vận hành",
  "insights.subtitle":
    "Chất lượng tự động hóa, thông lượng và chi phí trên từng nghiệp vụ. 30 ngày qua.",
  "settings.title": "Cài đặt",
  "settings.subtitle": "Quản lý cài đặt tổ chức, người dùng và tài nguyên của bạn.",
  "assistant.greeting": "Chào buổi tối",
  "assistant.help": "Hôm nay tôi có thể giúp gì cho công việc của bạn?",
  "assistant.placeholder": "Hỏi về dự án, luồng hoặc không gian làm việc của bạn",
  "assistant.newChat": "Cuộc trò chuyện mới",
  "assistant.conversations": "Cuộc trò chuyện của bạn",
  "assistant.disclaimer":
    "Trợ lý NXT Loom có thể mắc lỗi. Vui lòng kiểm tra lại câu trả lời.",
};

const fil: Dict = {
  "nav.copilot": "Copilot",
  "nav.products": "Mga Produkto",
  "nav.flows": "Mga Daloy",
  "nav.placements": "Mga Paglalagay",
  "nav.runs": "Mga Pagtakbo",
  "nav.items": "Mga Item",
  "nav.insights": "Mga Insight",
  "nav.settings": "Mga Setting",
  "group.build": "Bumuo",
  "group.run": "Patakbuhin",
  "group.govern": "Pamahalaan",
  "shell.production": "Produksyon",
  "shell.market": "Merkado",
  "shell.language": "Wika",
  "common.search": "Maghanap",
  "common.save": "I-save",
  "common.submit": "Isumite",
  "common.cancel": "Kanselahin",
  "common.confirm": "Kumpirmahin",
  "common.correct": "Itama",
  "common.flag": "I-flag",
  "common.markMissing": "Markahang kulang",
  "common.new": "Bago",
  "common.all": "Lahat",
  "common.export": "I-export",
  "products.title": "Tagabuo ng Produkto",
  "products.subtitle":
    "I-configure ang mga produkto ng insurance, plano, at panuntunan nang walang code — pagkatapos ay i-publish sa bawat channel.",
  "products.new": "Bagong produkto",
  "flows.title": "Mga Daloy",
  "flows.subtitle": "Gumawa at pamahalaan ang mga daloy upang i-automate ang mga gawain at proseso.",
  "placements.title": "Mga Paglalagay",
  "placements.subtitle":
    "Ialok ang panganib sa maraming carrier, pagkatapos ay ihambing ang mga sagot — kasama ang mga tuntuning tahimik na nagbago.",
  "placements.new": "Bagong paglalagay",
  "runs.title": "Live na Pagtakbo",
  "runs.subtitle":
    "Bawat pagpapatupad sa iyong mga workspace, may node-level na trace at pagbawi.",
  "items.title": "Mga Work Item",
  "insights.title": "Mga Insight sa Operasyon",
  "insights.subtitle":
    "Kalidad ng automation, throughput, at gastos sa bawat linya ng negosyo. Huling 30 araw.",
  "settings.title": "Mga Setting",
  "settings.subtitle":
    "Pamahalaan ang mga setting ng iyong organisasyon, mga user, at mapagkukunan.",
  "assistant.greeting": "Magandang gabi",
  "assistant.help": "Paano kita matutulungan sa trabaho mo ngayon?",
  "assistant.placeholder": "Magtanong tungkol sa iyong mga proyekto, daloy, o workspace",
  "assistant.newChat": "Bagong Pag-uusap",
  "assistant.conversations": "Ang Iyong mga Pag-uusap",
  "assistant.disclaimer":
    "Maaaring magkamali ang NXT Loom Assistant. Pakisuri muli ang mga sagot nito.",
};

const dicts: Record<LangCode, Dict> = { en, id, ms, th, vi, fil };

type I18nValue = {
  market: MarketCode;
  setMarket: (m: MarketCode) => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
  currency: CurrencyCode;
  /** Translate. Falls back to English, then to the key itself. */
  t: (key: string) => string;
  /** Format money in the active market's currency unless one is given. */
  money: (amount: number, currency?: CurrencyCode) => string;
  moneyCompact: (amount: number, currency?: CurrencyCode) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

const STORE_MARKET = "nxtloom.market";
const STORE_LANG = "nxtloom.lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { markets, marketFor, money: orgMoney } = useOrg();
  const { allowedMarkets } = useAuth();
  const [market, setMarketState] = useState<MarketCode>(() => {
    const saved = localStorage.getItem(STORE_MARKET) as MarketCode | null;
    return saved ?? "SG";
  });
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = localStorage.getItem(STORE_LANG) as LangCode | null;
    return saved && dicts[saved] ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORE_MARKET, market);
  }, [market]);

  useEffect(() => {
    localStorage.setItem(STORE_LANG, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  /** Switching market moves to that market's working language unless the
   *  current language is already valid there (e.g. English in SG/MY/PH). */
  const setMarket = (m: MarketCode) => {
    setMarketState(m);
    const current = languages.find((l) => l.code === lang);
    if (!current?.markets.includes(m)) setLangState(defaultLangFor[m] ?? "en");
  };

  // A persisted market can outlive the session that was allowed to see it, so
  // signing in as someone with narrower scope has to pull the selection back.
  useEffect(() => {
    if (allowedMarkets.length && !allowedMarkets.includes(market)) {
      setMarket(allowedMarkets[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedMarkets, market]);

  const value = useMemo<I18nValue>(() => {
    const active = marketFor(market) ?? markets[0];
    const currency = active.currency;
    const isCustom = "custom" in active;
    return {
      market,
      setMarket,
      lang,
      setLang: setLangState,
      currency,
      t: (key) => dicts[lang][key] ?? en[key] ?? key,
      money: (amount, c) =>
        c ? fmtMoney(amount, c) : isCustom ? orgMoney(amount, market) : fmtMoney(amount, currency),
      moneyCompact: (amount, c) =>
        c ? fmtMoneyCompact(amount, c) : isCustom ? orgMoney(amount, market) : fmtMoneyCompact(amount, currency),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, lang, markets]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
