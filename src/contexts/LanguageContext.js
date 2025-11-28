"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const languages = {
  en: {
    code: "en",
    name: "English",
    flag: "/info/flag-usa-sm.png",
    nativeName: "English",
  },
  es: {
    code: "es",
    name: "Español",
    flag: "/info/flag-tico-sm.png",
    nativeName: "Español",
  },
  de: {
    code: "de",
    name: "German",
    flag: "/info/flag-germany-sm.png",
    nativeName: "Deutsch",
  },
  nl: {
    code: "nl",
    name: "Dutch",
    flag: "/info/flag-netherlands-sm.png",
    nativeName: "Nederlands",
  },
  fr: {
    code: "fr",
    name: "French",
    flag: "/info/flag-france-sm.png",
    nativeName: "Français",
  },
  ja: {
    code: "ja",
    name: "Japanese",
    flag: "/info/flag-japan-sm.png",
    nativeName: "日本語",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    flag: "/info/flag-brazil-sm.png",
    nativeName: "Português",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem("blessedhouse-language");
    if (savedLanguage && languages[savedLanguage]) {
      setLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (languages[browserLang]) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const changeLanguage = (langCode) => {
    if (languages[langCode]) {
      setLanguage(langCode);
      localStorage.setItem("blessedhouse-language", langCode);
      // Update HTML lang attribute
      document.documentElement.lang = langCode;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

