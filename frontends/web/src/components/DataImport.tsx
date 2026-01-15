import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Play, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DataImportProps {
    onDataUpdate?: () => void;
}

export const DataImport: React.FC<DataImportProps> = ({ onDataUpdate }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'uploading' | 'processing' | 'success' | 'error', message: string }>({
        type: 'idle',
        message: ''
    });
    const [output, setOutput] = useState<string>('');
    const { t } = useLanguage();

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            setStatus({ type: 'idle', message: '' });
            setOutput('');
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleProcess = async () => {
        if (files.length === 0) return;

        try {
            setOutput('');
            let combinedOutput = '';

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setStatus({
                    type: 'uploading',
                    message: t('processing.uploading', { n: i + 1, total: files.length, name: file.name })
                });

                const buffer = await file.arrayBuffer();
                const saveRes = await window.electron.saveOfx(file.name, buffer);

                if (!saveRes.success) {
                    throw new Error(`Failed to save ${file.name}: ${saveRes.error}`);
                }
                combinedOutput += `Saved: ${file.name}\n`;
            }

            setStatus({ type: 'processing', message: t('processing.runningUpdate') });
            const processRes = await window.electron.runUpdate();

            if (!processRes.success) {
                setOutput(combinedOutput + (processRes.stderr || processRes.error || 'Process failed'));
                throw new Error('Script execution failed');
            }

            setOutput(combinedOutput + (processRes.stdout || 'Success!'));
            setStatus({ type: 'success', message: t('processing.success', { n: files.length }) });
            setFiles([]);
            if (onDataUpdate) onDataUpdate();
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    const handleClearData = async () => {
        try {
            setStatus({ type: 'processing', message: t('processing.clearing') });
            const res = await window.electron.clearData();
            if (!res.success) throw new Error(res.error || 'Failed to clear data');

            setStatus({ type: 'success', message: t('processing.clearedSuccess') });
            setIsConfirmingClear(false);
            setOutput(t('processing.cleanupComplete'));
            if (onDataUpdate) onDataUpdate();
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Upload className="text-brand-400" />
                    {t('importOfxTitle')}
                </h3>

                <div className="space-y-6">
                    {/* File Upload Zone */}
                    <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 transition-colors hover:border-brand-500 group">
                        <input
                            type="file"
                            accept=".ofx"
                            multiple
                            onChange={onFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-slate-800 p-4 rounded-full text-slate-400 group-hover:text-brand-400 transition-colors">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-slate-200 font-medium">
                                    {t('dropOrClickOfx')}
                                </p>
                                <p className="text-slate-500 text-sm mt-1">
                                    {t('supportsMultipleOfx')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Selected Files List */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {t('selectedFiles')} ({files.length})
                                </span>
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                                >
                                    {t('clearAll')}
                                </button>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {files.map((f, i) => (
                                    <div key={`${f.name}-${i}`} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                                            <span className="text-sm text-slate-200 truncate">{f.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(i)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleProcess}
                        disabled={files.length === 0 || status.type === 'uploading' || status.type === 'processing'}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${files.length === 0 || status.type === 'uploading' || status.type === 'processing'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20'
                            }`}
                    >
                        {status.type === 'uploading' || status.type === 'processing' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        {status.type === 'idle' ? t('processFiles', { n: files.length, s: files.length !== 1 ? 's' : '' }) : status.message}
                    </button>

                    {/* Status Message */}
                    {status.type !== 'idle' && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                            status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                                'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                            }`}>
                            {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-slate-900 border border-red-900/20 p-8 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <AlertCircle className="text-red-500 w-5 h-5" />
                            {t('dangerZone')}
                        </h4>
                        <p className="text-slate-400 text-sm">
                            {t('clearDataWarning')}
                        </p>
                    </div>

                    {!isConfirmingClear ? (
                        <button
                            onClick={() => setIsConfirmingClear(true)}
                            className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                        >
                            {t('clearAllData')}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider animate-pulse">{t('confirmDelete')}?</span>
                            <button
                                onClick={handleClearData}
                                className="px-5 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                            >
                                {t('confirmDelete')}
                            </button>
                            <button
                                onClick={() => setIsConfirmingClear(false)}
                                className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Console */}
            {output && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Console Output</span>
                        <button onClick={() => setOutput('')} className="text-slate-500 hover:text-slate-300 text-xs">{t('clearAll')}</button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-slate-400 overflow-auto max-h-60 whitespace-pre-wrap">
                        {output}
                    </pre>
                </div>
            )}
        </div>
    );
};
