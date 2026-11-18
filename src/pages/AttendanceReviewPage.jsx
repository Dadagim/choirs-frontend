import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';

function AttendanceReviewPage() {
    const {id, date} = useParams();
    const [sheet, setSheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadSheet = async () => {
            try {
                const response = await api.get(`api/choirs/${id}/attendance-review/`, {
                    params: {date},
                });
                if (active) setSheet(response.data);
            } catch (loadError) {
                if (active) setError(loadError.response?.data?.detail || loadError.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadSheet();
        return () => {
            active = false;
        };
    }, [date, id]);

    const downloadPdf = async () => {
        setDownloading(true);
        setError('');
        try {
            const response = await api.get(`api/choirs/${id}/attendance-review/pdf/`, {
                params: {date},
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${sheet.choir.full_name}-attendance-${date}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (downloadError) {
            setError(downloadError.message || 'Unable to download the attendance PDF.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <Loading/>;
    if (error && !sheet) {
        return <p className="mx-auto my-8 max-w-4xl px-4 text-red-700" role="alert">{error}</p>;
    }

    return (
        <main className="mx-auto my-8 w-full max-w-6xl px-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Link className="text-indigo-700 hover:underline" to={`/choirs/${id}`}>
                    &larr; Back to {sheet.choir.full_name}
                </Link>
                <button className="btn-primary px-5 py-3" type="button" onClick={downloadPdf}
                        disabled={downloading}>
                    {downloading ? 'Preparing PDF...' : 'Download PDF'}
                </button>
            </div>

            {error && <p className="mb-4 text-red-700" role="alert">{error}</p>}

            <section className="overflow-hidden rounded-xl border border-slate-300 bg-white p-6 shadow-sm print:shadow-none">
                <header className="mb-6 border-b border-slate-300 pb-4 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                        Attendance record
                    </h1>
                    <p className="mt-2 text-lg font-semibold">{sheet.choir.full_name}</p>
                    <p className="mt-1 text-slate-600">Date: {sheet.date} · Meeting: {sheet.reason}</p>
                </header>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-slate-100 uppercase text-slate-700">
                                <th className="border border-slate-300 px-3 py-3">No.</th>
                                <th className="border border-slate-300 px-3 py-3">Full name</th>
                                <th className="border border-slate-300 px-3 py-3">Gender / age</th>
                                <th className="border border-slate-300 px-3 py-3">Leadership</th>
                                <th className="border border-slate-300 px-3 py-3">Status</th>
                                <th className="border border-slate-300 px-3 py-3">Remarks</th>
                                <th className="border border-slate-300 px-3 py-3">Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sheet.records.map((record, index) => (
                                <tr key={record.user_id}>
                                    <td className="border border-slate-300 px-3 py-3">{index + 1}</td>
                                    <td className="whitespace-nowrap border border-slate-300 px-3 py-3">
                                        {record.full_name}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-3">
                                        {record.gender} / {record.age}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-3">
                                        {record.leadership_status}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-3">{record.status}</td>
                                    <td className="border border-slate-300 px-3 py-3">
                                        {record.permission || ''}
                                    </td>
                                    <td className="min-w-32 border border-slate-300 px-3 py-3"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}

export default AttendanceReviewPage;
