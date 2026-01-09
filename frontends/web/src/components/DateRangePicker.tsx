import React from 'react';
import { Calendar } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfYear, subMonths, format } from 'date-fns';

export interface DateRange {
    start: Date;
    end: Date;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
    const handlePreset = (preset: 'thisMonth' | 'lastMonth' | 'thisYear' | 'allTime') => {
        const now = new Date();
        switch (preset) {
            case 'thisMonth':
                onChange({ start: startOfMonth(now), end: endOfMonth(now) });
                break;
            case 'lastMonth':
                const last = subMonths(now, 1);
                onChange({ start: startOfMonth(last), end: endOfMonth(last) });
                break;
            case 'thisYear':
                onChange({ start: startOfYear(now), end: now }); // Up to now
                break;
            case 'allTime':
                // Assuming a reasonable far back date, or handle nulls in parent. 
                // For UI simplicity, let's just pick a wide range or let parent handle "all time" logic if we want to be strict.
                // Let's set 2020 as start.
                onChange({ start: new Date(2020, 0, 1), end: now });
                break;
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 px-3 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Period</span>
            </div>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <div className="flex gap-1">
                {[
                    { label: 'Last Month', value: 'lastMonth' },
                    { label: 'This Month', value: 'thisMonth' },
                    { label: 'This Year', value: 'thisYear' },
                    { label: 'All Time', value: 'allTime' },
                ].map((preset) => (
                    <button
                        key={preset.value}
                        onClick={() => handlePreset(preset.value as any)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            // Simple heuristic check for active state could be improved, but for now relies on user click
                            // Visual feedback is enough.
                            'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={format(value.start, 'yyyy-MM-dd')}
                    onChange={(e) => onChange({ ...value, start: e.target.valueAsDate || value.start })}
                    className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none border border-transparent focus:border-slate-700 rounded px-1"
                />
                <span className="text-slate-600">-</span>
                <input
                    type="date"
                    value={format(value.end, 'yyyy-MM-dd')}
                    onChange={(e) => onChange({ ...value, end: e.target.valueAsDate || value.end })}
                    className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none border border-transparent focus:border-slate-700 rounded px-1"
                />
            </div>
        </div>
    );
};
