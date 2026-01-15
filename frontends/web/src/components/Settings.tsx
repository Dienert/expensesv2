import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { type Language } from '../lib/translations';

export const Settings: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();

    const languages: { code: Language; label: string }[] = [
        { code: 'en-US', label: t('settings_view.en') },
        { code: 'pt-BR', label: t('settings_view.pt') }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">{t('settings_view.language')}</h3>
                            <p className="text-sm text-slate-400">{t('settings_view.chooseLanguage')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${language === lang.code
                                        ? 'bg-brand-500/10 border-brand-500/50 text-brand-400'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                                    }`}
                            >
                                <span className="font-medium">{lang.label}</span>
                                {language === lang.code && (
                                    <Check className="w-5 h-5" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Placeholder for other settings if needed later */}
            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                    {t('settings')} - v1.0.0
                </p>
            </div>
        </motion.div>
    );
};
