/**
 * Language Context Provider
 * Manages language state (English/Amharic) and RTL support
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { t, isRTL, getAvailableLanguages, getLanguageName } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isRTLDirection, setIsRTLDirection] = useState(false);

  useEffect(() => {
    // Load language from localStorage or user preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    // Update document direction based on language
    const rtl = isRTL(language);
    setIsRTLDirection(rtl);
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (getAvailableLanguages().includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  const value = {
    language,
    changeLanguage,
    isRTL: isRTLDirection,
    t: (key) => t(key, language),
    availableLanguages: getAvailableLanguages(),
    getLanguageName: (lang) => getLanguageName(lang),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
