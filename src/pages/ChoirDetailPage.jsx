import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';
import AttendanceSummaryChart from '../components/AttendanceSummaryChart.jsx';

function getErrorMessage(error) {
    return error.response?.data?.detail || error.message || 'Unable to load choir details.';
}

function ChoirDetailPage() {
    const {id} = useParams();
    const [choir, setChoir] = useState(null);
    const [members, setMembers] = useState([]);
    const [canTakeAttendance, setCanTakeAttendance] = useState(false);
    const [canJoinConversation, setCanJoinConversation] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadChoir = async () => {
            try {
                const response = await api.get(`api/choirs/${id}/`);
                if (active) {
                    setChoir(response.data.choir);
                    setMembers(response.data.members);
                    setCanTakeAttendance(response.data.can_take_attendance);
                    setCanJoinConversation(response.data.can_join_conversation);
                }
            } catch (loadError) {
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        loadChoir();
        return () => {
            active = false;
        };
    }, [id]);

    if (loading) return <Loading/>;
    if (error) {
        return <p className="mx-auto my-8 max-w-4xl px-4 text-red-700" role="alert">{error}</p>;
    }

    const apiBase = new URL(api.defaults.baseURL, window.location.origin);

    return (
        <main className="mx-auto my-8 w-full max-w-7xl px-4">
            <Link className="mb-4 inline-block text-indigo-700 hover:underline" to="/">
                &larr; Back to choirs
            </Link>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{choir.full_name}</h1>
                        <p className="mt-2 text-slate-600">
                            {members.length} choir member{members.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    {canTakeAttendance && (
                        <Link className="btn-primary px-5 py-3" to={`/choirs/${id}/attendance`}>
                            Attendance
                        </Link>
                    )}
                    {canJoinConversation && (
                        <Link className="btn-primary px-5 py-3" to={`/choirs/${id}/conversation`}>
                            Join conversation
                        </Link>
                    )}
                </div>
            </section>

            <AttendanceSummaryChart choirId={id}/>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 className="p-5 text-lg font-semibold text-slate-900">Members</h2>
                {members.length === 0 ? (
                    <p className="p-5 text-slate-600">No members are listed for this choir.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">Profile</th>
                                    <th className="px-4 py-3">Full name</th>
                                    <th className="px-4 py-3">Age</th>
                                    <th className="px-4 py-3">Gender</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Leadership</th>
                                    <th className="px-4 py-3">Marital status</th>
                                    <th className="px-4 py-3">Job</th>
                                    <th className="px-4 py-3">Education</th>
                                    <th className="px-4 py-3">Other ministries</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((member) => {
                                    const imageUrl = member.profile_pic
                                        ? new URL(member.profile_pic, apiBase).toString()
                                        : null;

                                    return (
                                        <tr key={member.id} className="align-middle text-slate-700">
                                            <td className="px-4 py-3">
                                                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">
                                                    <span>{member.full_name?.slice(0, 1) || '?'}</span>
                                                    {imageUrl && (
                                                        <img className="absolute inset-0 h-full w-full object-cover"
                                                             src={imageUrl} alt=""
                                                             onError={(event) => {
                                                                 event.currentTarget.style.display = 'none';
                                                             }}/>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                                                <Link className="hover:text-indigo-700 hover:underline"
                                                      to={`/members/${member.id}`}>
                                                    {member.full_name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">{member.age}</td>
                                            <td className="px-4 py-3">{member.gender}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{member.phone_number}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{member.leadership_status}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{member.marriage_status}</td>
                                            <td className="px-4 py-3">
                                                <div>{member.job_status}</div>
                                                <div className="text-xs text-slate-500">{member.job_name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{member.education_level}</div>
                                                <div className="text-xs text-slate-500">
                                                    {member.foundational_class_level}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{member.other_church_ministries}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default ChoirDetailPage;
