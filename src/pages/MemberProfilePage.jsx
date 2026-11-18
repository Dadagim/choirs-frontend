import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';

function MemberProfilePage() {
    const {profileId} = useParams();
    const [profile, setProfile] = useState(null);
    const [choir, setChoir] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadProfile = async () => {
            try {
                const response = await api.get(`api/user-profile/${profileId}/`);
                if (active) {
                    setProfile(response.data.profile);
                    setChoir(response.data.choir);
                }
            } catch (loadError) {
                if (active) {
                    setError(loadError.response?.data?.detail || loadError.message);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProfile();
        return () => {
            active = false;
        };
    }, [profileId]);

    if (loading) return <Loading/>;
    if (error) {
        return <p className="mx-auto my-8 max-w-4xl px-4 text-red-700" role="alert">{error}</p>;
    }

    const apiBase = new URL(api.defaults.baseURL, window.location.origin);
    const imageUrl = profile.profile_pic ? new URL(profile.profile_pic, apiBase).toString() : null;
    const details = [
        ['Age', profile.age],
        ['Gender', profile.gender],
        ['Phone number', profile.phone_number],
        ['Marital status', profile.marriage_status],
        ['Leadership role', profile.leadership_status],
        ['Employment status', profile.job_status],
        ['Job / field of study', profile.job_name],
        ['Education level', profile.education_level],
        ['Foundational class', profile.foundational_class_level],
        ['Other church ministries', profile.other_church_ministries],
    ];
    const attendanceSummary = profile.attendance_summary;

    return (
        <main className="mx-auto my-8 w-full max-w-4xl px-4">
            <Link className="mb-4 inline-block text-indigo-700 hover:underline" to={`/choirs/${choir.id}`}>
                &larr; Back to {choir.full_name}
            </Link>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-8 text-white">
                    <div className="flex flex-wrap items-center gap-5">
                        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-3xl font-bold">
                            <span>{profile.full_name?.slice(0, 1) || '?'}</span>
                            {imageUrl && (
                                <img className="absolute inset-0 h-full w-full object-cover"
                                     src={imageUrl} alt=""
                                     onError={(event) => {
                                         event.currentTarget.style.display = 'none';
                                     }}/>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                            <p className="mt-1 text-indigo-100">{choir.full_name}</p>
                            <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm">
                                {profile.leadership_status}
                            </span>
                        </div>
                    </div>
                </div>

                {attendanceSummary ? (
                    <section className="border-b border-slate-200 p-6 md:p-8">
                        <h2 className="mb-4 text-xl font-semibold text-slate-900">Attendance progress</h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                            {[
                                ['Days marked', attendanceSummary.attendance_days],
                                ['Present', attendanceSummary.present_days],
                                ['Late', attendanceSummary.late_days],
                                ['Absent', attendanceSummary.absent_days],
                                ['Permission', attendanceSummary.permission_days],
                            ].map(([label, count]) => (
                                <div key={label} className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm text-slate-600">{label}</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
                                </div>
                            ))}
                        </div>
                        <h3 className="mt-6 font-semibold text-slate-900">Permission attendance</h3>
                        {attendanceSummary.permissions.length === 0 ? (
                            <p className="mt-2 text-slate-600">No permission attendance recorded.</p>
                        ) : (
                            <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2">Meeting</th>
                                            <th className="px-3 py-2">Permission note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceSummary.permissions.map((item, index) => (
                                            <tr key={`${item.date}-${index}`} className="border-t border-slate-100">
                                                <td className="px-3 py-2">{item.date}</td>
                                                <td className="px-3 py-2">{item.reason}</td>
                                                <td className="px-3 py-2">{item.permission || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                ) : (
                    <p className="border-b border-slate-200 p-6 text-slate-600">
                        Attendance progress is visible to the member and choir leadership.
                    </p>
                )}

                <dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2 md:p-8">
                    {details.map(([label, value]) => (
                        <div key={label} className="border-b border-slate-100 pb-3">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {label}
                            </dt>
                            <dd className="mt-1 break-words font-medium text-slate-900">
                                {label === 'Phone number' ? (
                                    <a className="hover:text-indigo-700" href={`tel:${value}`}>{value}</a>
                                ) : value || '—'}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>
        </main>
    );
}

export default MemberProfilePage;
