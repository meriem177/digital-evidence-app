import { useTranslation } from "react-i18next";
import { useState } from "react";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = [
    { code: "en", label: "🇬🇧 English" },
    { code: "fr", label: "🇫🇷 Français" },
    { code: "ar", label: "🇩🇿 العربية" }
  ];

  const change = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem("appLang", lng);
    } catch (e) {}
    if (typeof document !== "undefined") {
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lng;
    }
    setOpen(false);
  };

  const current = options.find((o) => o.code === i18n.language) || options[0];

  return (
    <div className="btn-group ms-3">
      <button
        type="button"
        className="btn btn-outline-light d-flex align-items-center"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="me-2">🌐</span>
        <span>{current.label}</span>
      </button>
      <ul className={`dropdown-menu dropdown-menu-end ${open ? "show" : ""}`}>
        {options.map((opt) => (
          <li key={opt.code}>
            <button className="dropdown-item" onClick={() => change(opt.code)}>
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSelector;
