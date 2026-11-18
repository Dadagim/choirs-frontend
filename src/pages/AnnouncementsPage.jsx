import {useCallback, useEffect, useRef, useState} from 'react';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';
import AttachmentPreview from '../components/AttachmentPreview.jsx';
import useAuthenticatedWebSocket from '../hooks/useAuthenticatedWebSocket.js';

function mergeAnnouncements(current, incoming) {
    const announcements = new Map(current.map((item) => [item.id, item]));
    incoming.forEach((item) => announcements.set(item.id, item));
    return [...announcements.values()].sort((first, second) =>
        new Date(second.created_at) - new Date(first.created_at)
    );
}

function getErrorMessage(error) {
    const data = error.response?.data;
    if (data?.detail) return data.detail;
    if (data && typeof data === 'object') return Object.values(data).flat().join(' ');
    return error.message || 'Unable to publish announcement.';
}

function AnnouncementsPage() {
    const formRef = useRef(null);
    const [announcements, setAnnouncements] = useState([]);
    const [canPublish, setCanPublish] = useState(false);
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');

    const onSocketMessage = useCallback((event) => {
        if (event.type === 'announcement') {
            setAnnouncements((current) => mergeAnnouncements(current, [event.message]));
        }
    }, []);
    const {status} = useAuthenticatedWebSocket('/ws/announcements/', onSocketMessage);

    useEffect(() => {
        let active = true;
        const loadAnnouncements = async () => {
            try {
                const response = await api.get('api/announcements/');
                if (active) {
                    setAnnouncements(response.data.announcements);
                    setCanPublish(response.data.can_publish);
                }
            } catch (loadError) {
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        loadAnnouncements();
        return () => {
            active = false;
        };
    }, []);

    const publishAnnouncement = async (event) => {
        event.preventDefault();
        if (!text.trim() && !attachment) return;

        setPublishing(true);
        setError('');
        const data = new FormData();
        data.append('text', text.trim());
        if (attachment) data.append('attachment', attachment);

        try {
            const response = await api.post('api/announcements/', data);
            setAnnouncements((current) => mergeAnnouncements(current, [response.data]));
            setText('');
            setAttachment(null);
            formRef.current?.reset();
        } catch (publishError) {
            setError(getErrorMessage(publishError));
        } finally {
            setPublishing(false);
        }
    };

    if (loading) return <Loading/>;

    return (
        <main className="mx-auto my-8 w-full max-w-4xl px-4">
            <h1 className="mb-2 text-2xl font-bold text-slate-900">Announcements</h1>
            <p className="mb-6 text-sm text-slate-600">Live updates · {status}</p>
            {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700" role="alert">{error}</p>}

            {canPublish && (
                <form ref={formRef} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      onSubmit={publishAnnouncement}>
                    <label className="mb-3 block font-semibold text-slate-900" htmlFor="announcement-text">
                        New announcement
                    </label>
                    <textarea id="announcement-text" className="w-full rounded-xl border border-slate-300 p-3"
                              rows="3" maxLength={4000} value={text}
                              onChange={(event) => setText(event.target.value)}
                              placeholder="Write an announcement..." />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <input type="file" accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.aac,.m4a,.mp3,.ogg,.wav,.avi,.mkv,.mov,.mp4,.webm"
                               onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                               aria-label="Attach a document, audio, or video file"/>
                        <button className="btn-primary px-5 py-2" type="submit"
                                disabled={publishing || (!text.trim() && !attachment)}>
                            {publishing ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Attachments are limited to 25 MB per file.</p>
                </form>
            )}

            <section className="space-y-4">
                {announcements.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
                        No announcements yet.
                    </p>
                )}
                {announcements.map((announcement) => (
                    <article key={announcement.id}
                             className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="font-semibold text-slate-900">{announcement.author_name}</h2>
                            <time className="text-xs text-slate-500">
                                {new Date(announcement.created_at).toLocaleString()}
                            </time>
                        </div>
                        {announcement.text && (
                            <p className="whitespace-pre-wrap text-slate-700">{announcement.text}</p>
                        )}
                        {announcement.attachment_url && (
                            <AttachmentPreview name={announcement.attachment_name}
                                               url={announcement.attachment_url}/>
                        )}
                    </article>
                ))}
            </section>
        </main>
    );
}

export default AnnouncementsPage;
