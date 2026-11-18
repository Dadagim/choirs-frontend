import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';

const initialProfile = {
    full_name: '',
    gender: '',
    age: '',
    phone_number: '',
    marriage_status: '',
    job_status: '',
    job_name: '',
    education_level: '',
    foundational_class_level: '',
    choir: '',
    other_church_ministries: '',
};

const fieldClass = 'w-full rounded-xl border border-slate-300 px-3 py-2';
const selectClass = `${fieldClass} bg-white`;

function getErrorMessage(error) {
    const data = error.response?.data;
    if (data?.detail) return data.detail;
    if (data && typeof data === 'object') {
        return Object.values(data).flat().join(' ');
    }
    return error.message || 'Unable to save your profile.';
}

function ProfileCompletionPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(initialProfile);
    const [choirs, setChoirs] = useState([]);
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const loadChoirs = async () => {
            try {
                const [choirResponse, profileResponse] = await Promise.allSettled([
                    api.get('api/choirs/'),
                    api.get('api/user-profile/me/'),
                ]);

                if (profileResponse.status === 'fulfilled') {
                    navigate('/', {replace: true});
                    return;
                }
                if (profileResponse.reason.response?.status !== 404) {
                    throw profileResponse.reason;
                }
                if (!Array.isArray(choirResponse.value?.data)) {
                    throw choirResponse.reason || new Error('Unexpected response from choir API.');
                }
                if (active) setChoirs(choirResponse.value.data);
            } catch (loadError) {
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        loadChoirs();
        return () => {
            active = false;
        };
    }, [navigate]);

    const updateProfile = (event) => {
        const {name, value} = event.target;
        setProfile((current) => ({...current, [name]: value}));
    };

    const submitProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        const data = new FormData();
        Object.entries(profile).forEach(([key, value]) => {
            data.append(key, value);
        });
        data.set('age', String(Number(profile.age)));
        data.set('choir', String(Number(profile.choir)));
        if (profilePic) data.append('profile_pic', profilePic);

        try {
            await api.post('api/user-profile/me/', data);
            navigate('/', {replace: true});
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading/>;

    return (
        <main className="mx-auto my-8 w-full max-w-4xl px-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">Complete your profile</h1>
                <p className="mb-6 text-slate-600">Add your details to continue to EventVault.</p>

                {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700" role="alert">{error}</p>}

                <form className="grid gap-4 md:grid-cols-2" onSubmit={submitProfile}>
                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Full name
                        <input className={fieldClass} name="full_name" value={profile.full_name}
                               onChange={updateProfile} required maxLength={100}/>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Profile picture
                        <input className={fieldClass} type="file" accept="image/*"
                               onChange={(event) => setProfilePic(event.target.files?.[0] || null)}/>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Gender
                        <select className={selectClass} name="gender" value={profile.gender}
                                onChange={updateProfile} required>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Age
                        <input className={fieldClass} type="number" name="age" min="0" value={profile.age}
                               onChange={updateProfile} required/>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Phone number
                        <input className={fieldClass} type="tel" name="phone_number" value={profile.phone_number}
                               onChange={updateProfile} required maxLength={20}/>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Choir
                        <select className={selectClass} name="choir" value={profile.choir}
                                onChange={updateProfile} required>
                            <option value="">Select choir</option>
                            {choirs.map((choir) => (
                                <option key={choir.id} value={choir.id}>{choir.full_name}</option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Marital status
                        <select className={selectClass} name="marriage_status" value={profile.marriage_status}
                                onChange={updateProfile} required>
                            <option value="">Select status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Employment status
                        <select className={selectClass} name="job_status" value={profile.job_status}
                                onChange={updateProfile} required>
                            <option value="">Select status</option>
                            <option value="Governmental job">Governmental job</option>
                            <option value="Private Business">Private Business</option>
                            <option value="Student">Student</option>
                            <option value="Not current job">Not currently employed</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Job or field of study
                        <input className={fieldClass} name="job_name" value={profile.job_name}
                               onChange={updateProfile} required maxLength={200}/>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Education level
                        <select className={selectClass} name="education_level" value={profile.education_level}
                                onChange={updateProfile} required>
                            <option value="">Select education level</option>
                            <option value="High School">High School</option>
                            <option value="Collage">College</option>
                            <option value="Degree">Degree</option>
                            <option value="Masters">Masters</option>
                            <option value="PHD">PhD</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                        Foundational class level
                        <select className={selectClass} name="foundational_class_level"
                                value={profile.foundational_class_level} onChange={updateProfile} required>
                            <option value="">Select class level</option>
                            <option value="None">None</option>
                            <option value="Level One">Level One</option>
                            <option value="Level Two">Level Two</option>
                            <option value="Level Three">Level Three</option>
                            <option value="Class of Theology">Class of Theology</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">
                        Other church ministries
                        <input className={fieldClass} name="other_church_ministries"
                               value={profile.other_church_ministries} onChange={updateProfile} required
                               maxLength={200}/>
                    </label>

                    <button className="btn-primary mt-2 p-3 md:col-span-2" type="submit" disabled={saving}>
                        {saving ? 'Saving profile...' : 'Save profile and continue'}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ProfileCompletionPage;
