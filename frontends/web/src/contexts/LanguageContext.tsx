import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language } from '../lib/translations';
import { ptBR, enUS } from 'date-fns/locale';
import { type Locale } from 'date-fns';

interface LanguageContextType {
    language: Language;
    t: (key: string, params?: Record<string, string | number>) => string;
    setLanguage: (lang: Language) => void;
    formatCurrency: (val: number) => string;
    dateLocale: Locale;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('app-language');
        return (saved as Language) || 'en-US';
    });

    useEffect(() => {
        const detectLanguage = async () => {
            const saved = localStorage.getItem('app-language');
            if (saved) return; // Don't override if user has a preference

            if (window.electron?.getLocale) {
                const locale = await window.electron.getLocale();
                if (locale.startsWith('pt')) {
                    setLanguageState('pt-BR');
                } else {
                    setLanguageState('en-US');
                }
            }
        };
        detectLanguage();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
    };

    const dateLocale = language === 'pt-BR' ? ptBR : enUS;

    const t = (path: string, params?: Record<string, string | number>): string => {
        const keys = path.split('.');
        let value: any = translations[language];

        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key];
            } else {
                return path;
            }
        }

        if (typeof value !== 'string') return path;

        if (params) {
            Object.entries(params).forEach(([key, val]) => {
                value = value.replace(`{${key}}`, val.toString());
            });
        }

        return value;
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: language === 'pt-BR' ? 'BRL' : 'USD'
        }).format(val);
    };

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage, formatCurrency, dateLocale }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
