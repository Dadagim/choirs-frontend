import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';

const meetingReasons = ['Regular Meeting', 'Practice Meeting', 'Others'];
const attendanceStatuses = ['Present', 'Absent', 'Late', 'Permission'];

function getErrorMessage(error) {
    const data = error.response?.data;
    if (data?.detail) return data.detail;
    if (data && typeof data === 'object') {
        return Object.values(data).flat().join(' ');
    }
    return error.message || 'Unable to save attendance.';
}

function AttendancePage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [choir, setChoir] = useState(null);
    const [members, setMembers] = useState([]);
    const [reason, setReason] = useState(meetingReasons[0]);
    const [attendance, setAttendance] = useState({});
    const [permissions, setPermissions] = useState({});
    const [existingDate, setExistingDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadMembers = async () => {
            try {
                const response = await api.get(`api/choirs/${id}/attendance/`);
                if (active) {
                    setChoir(response.data.choir);
                    setMembers(response.data.members);
                    setAttendance(Object.fromEntries(response.data.members.map((member) => [member.user, ''])));
                    setPermissions(Object.fromEntries(response.data.members.map((member) => [member.user, ''])));
                }
            } catch (loadError) {
                if (loadError.response?.status === 409) {
                    if (active) {
                        setExistingDate(loadError.response.data.date || '');
                        setError(loadError.response.data.detail || 'Attendance was already submitted today.');
                    }
                    return;
                }
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        loadMembers();
        return () => {
            active = false;
        };
    }, [id]);

    const updateAttendance = (userId, value) => {
        setAttendance((current) => ({...current, [userId]: value}));
        if (value !== 'Permission') {
            setPermissions((current) => ({...current, [userId]: ''}));
        }
    };

    const updatePermission = (userId, value) => {
        setPermissions((current) => ({...current, [userId]: value}));
    };

    const submitAttendance = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await api.post(`api/choirs/${id}/attendance/`, {
                reason,
                records: members.map((member) => ({
                    user: member.user,
                    status: attendance[member.user],
                    permission: permissions[member.user],
                })),
            });
            navigate(`/choirs/${id}/attendance/review/${response.data.date}`);
        } catch (submitError) {
            if (submitError.response?.status === 409) {
                setExistingDate(submitError.response.data.date || '');
            }
            setError(getErrorMessage(submitError));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading/>;

    if (error && !choir) {
        return (
            <section className="mx-auto my-8 max-w-4xl px-4" role="alert">
                <p className="text-red-700">{error}</p>
                {existingDate && (
                    <Link className="mt-3 inline-block text-indigo-700 underline"
                          to={`/choirs/${id}/attendance/review/${existingDate}`}>
                        Review today&apos;s attendance
                    </Link>
                )}
            </section>
        );
    }

    return (
        <main className="mx-auto my-8 w-full max-w-5xl px-4">
            <Link className="mb-4 inline-block text-indigo-700 hover:underline" to={`/choirs/${id}`}>
                &larr; Back to {choir.full_name}
            </Link>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Take attendance: {choir.full_name}</h1>
                {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700" role="alert">{error}</p>}

                <form onSubmit={submitAttendance}>
                    {error && <p className="mb-4 text-red-700" role="alert">{error}</p>}
                    {existingDate && (
                        <Link className="mb-4 inline-block text-indigo-700 underline"
                              to={`/choirs/${id}/attendance/review/${existingDate}`}>
                            Review the attendance sheet
                        </Link>
                    )}
                    <label className="mb-6 grid max-w-md gap-1 text-sm font-medium text-slate-700">
                        Meeting type
                        <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                                value={reason} onChange={(event) => setReason(event.target.value)} required>
                            {meetingReasons.map((meetingReason) => (
                                <option key={meetingReason} value={meetingReason}>{meetingReason}</option>
                            ))}
                        </select>
                    </label>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">Member</th>
                                    <th className="px-4 py-3">Attendance</th>
                                    <th className="px-4 py-3">Permission note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <tr key={member.user}>
                                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                                            {member.full_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                                                    value={attendance[member.user] || ''}
                                                    onChange={(event) => updateAttendance(member.user, event.target.value)}
                                                    required>
                                                <option value="">Select status</option>
                                                {attendanceStatuses.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full min-w-48 rounded-lg border border-slate-300 px-3 py-2"
                                                   value={permissions[member.user] || ''}
                                                   onChange={(event) => updatePermission(member.user, event.target.value)}
                                                   disabled={attendance[member.user] !== 'Permission'}
                                                   maxLength={200} aria-label={`Permission note for ${member.full_name}`}/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button className="btn-primary mt-6 px-5 py-3" type="submit"
                            disabled={saving || members.length === 0}>
                        {saving ? 'Saving attendance...' : 'Save attendance'}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default AttendancePage;
