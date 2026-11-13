import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('uc_lang') || 'uz');

  useEffect(() => {
    localStorage.setItem('uc_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const tr = (obj) => (obj && (obj[lang] ?? obj.uz)) ?? '';
  return <Ctx.Provider value={{ lang, setLang, tr }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
