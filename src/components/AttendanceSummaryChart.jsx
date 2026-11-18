import {useEffect, useMemo, useState} from 'react';
import {api} from '../api.js';

const series = [
    {key: 'present', label: 'Present', color: '#16a34a'},
    {key: 'late', label: 'Late', color: '#f59e0b'},
    {key: 'absent', label: 'Absent', color: '#dc2626'},
    {key: 'permission', label: 'Permission', color: '#2563eb'},
];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartWidth = 960;
const chartHeight = 300;
const margins = {top: 20, right: 12, bottom: 42, left: 48};

function AttendanceSummaryChart({choirId}) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadSummary = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`api/choirs/${choirId}/attendance-summary/`, {
                    params: {year},
                });
                if (active) setMonths(response.data.months);
            } catch (loadError) {
                if (active) {
                    setError(loadError.response?.data?.detail || loadError.message);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadSummary();
        return () => {
            active = false;
        };
    }, [choirId, year]);

    const totals = useMemo(() => months.reduce((sum, month) => {
        sum.days_taken += month.days_taken;
        series.forEach(({key}) => {
            sum[key] += month[key];
        });
        return sum;
    }, {days_taken: 0, present: 0, late: 0, absent: 0, permission: 0}), [months]);

    if (error) {
        return <p className="my-4 rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</p>;
    }

    const plotWidth = chartWidth - margins.left - margins.right;
    const plotHeight = chartHeight - margins.top - margins.bottom;
    const maxValue = Math.max(4, ...months.flatMap((month) => series.map(({key}) => month[key])));
    const scaleMax = Math.ceil(maxValue / 4) * 4;
    const groupWidth = plotWidth / 12;
    const barWidth = 10;
    const barGap = 3;
    const groupBarsWidth = series.length * barWidth + (series.length - 1) * barGap;

    return (
        <section className="my-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Monthly attendance</h2>
                    <p className="text-sm text-slate-600">Choir attendance by status</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    Year
                    <select className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                            value={year} onChange={(event) => setYear(Number(event.target.value))}>
                        {[0, 1, 2, 3, 4].map((offset) => {
                            const optionYear = currentYear - offset;
                            return <option key={optionYear} value={optionYear}>{optionYear}</option>;
                        })}
                    </select>
                </label>
            </div>

            {loading ? (
                <p className="py-12 text-center text-slate-500">Loading attendance summary...</p>
            ) : (
                <>
                    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Days taken</p>
                            <p className="text-xl font-bold text-slate-900">{totals.days_taken}</p>
                        </div>
                        {series.map((item) => (
                            <div key={item.key} className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">{item.label}</p>
                                <p className="text-xl font-bold text-slate-900">{totals[item.key]}</p>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <svg className="min-w-[700px] w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                             role="img" aria-label={`Monthly attendance totals for ${year}`}>
                            {[0, 1, 2, 3, 4].map((step) => {
                                const value = scaleMax * step / 4;
                                const y = margins.top + plotHeight - (value / scaleMax) * plotHeight;
                                return (
                                    <g key={step}>
                                        <line x1={margins.left} x2={chartWidth - margins.right}
                                              y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="3 4"/>
                                        <text x={margins.left - 10} y={y + 4} textAnchor="end"
                                              fill="#64748b" fontSize="11">{value}</text>
                                    </g>
                                );
                            })}
                            {months.map((month, monthIndex) => {
                                const groupStart = margins.left + monthIndex * groupWidth
                                    + (groupWidth - groupBarsWidth) / 2;
                                return (
                                    <g key={month.month}>
                                        {series.map((item, seriesIndex) => {
                                            const value = month[item.key];
                                            const height = (value / scaleMax) * plotHeight;
                                            const x = groupStart + seriesIndex * (barWidth + barGap);
                                            const y = margins.top + plotHeight - height;
                                            return (
                                                <rect key={item.key} x={x} y={y} width={barWidth}
                                                      height={height} rx="2" fill={item.color}>
                                                    <title>{`${monthNames[month.month - 1]} ${item.label}: ${value}`}</title>
                                                </rect>
                                            );
                                        })}
                                        <text x={margins.left + monthIndex * groupWidth + groupWidth / 2}
                                              y={chartHeight - 14} textAnchor="middle"
                                              fill="#64748b" fontSize="11">
                                            {monthNames[month.month - 1]}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
                        {series.map((item) => (
                            <span key={item.key} className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="h-3 w-3 rounded-sm" style={{backgroundColor: item.color}}/>
                                {item.label}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

export default AttendanceSummaryChart;
