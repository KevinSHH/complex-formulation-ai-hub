import { useLang } from "../i18n/index.jsx";

/**
 * 中 / EN 语言切换器（分段控件样式）。
 * 默认英文，点击切换，选择持久化。
 */
export default function LangSwitch({ compact = false }) {
  const { lang, setLang } = useLang();

  const base =
    "inline-flex items-center rounded-full border border-stone-400/40 bg-white overflow-hidden select-none";
  const btn =
    "px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 focus:outline-none";
  const active = "bg-ink-900 text-white";
  const inactive = "text-stone-600 hover:text-ink-900 hover:bg-stone-300/40";

  return (
    <div className={base} role="group" aria-label="Language / 语言">
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`${btn} ${lang === "zh" ? active : inactive}`}
      >
        中
      </button>
      <span className="w-px h-4 bg-stone-400/40" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${btn} ${lang === "en" ? active : inactive}`}
      >
        EN
      </button>
    </div>
  );
}
