import {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {api} from '../api.js';
import Loading from '../components/Loading.jsx';
import AttachmentPreview from '../components/AttachmentPreview.jsx';
import useAuthenticatedWebSocket from '../hooks/useAuthenticatedWebSocket.js';

function mergeMessages(current, incoming) {
    const messages = new Map(current.map((message) => [message.id, message]));
    incoming.forEach((message) => messages.set(message.id, message));
    return [...messages.values()].sort((first, second) =>
        new Date(first.created_at) - new Date(second.created_at)
    );
}

function getErrorMessage(error) {
    const data = error.response?.data;
    if (data?.detail) return data.detail;
    if (data && typeof data === 'object') return Object.values(data).flat().join(' ');
    return error.message || 'Unable to send your message.';
}

function ChoirConversationPage() {
    const {id} = useParams();
    const formRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [choirName, setChoirName] = useState('');
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const onSocketMessage = useCallback((event) => {
        if (event.type === 'message') {
            setMessages((current) => mergeMessages(current, [event.message]));
        } else if (event.type === 'error') {
            setError(event.detail);
        }
    }, []);
    const {status} = useAuthenticatedWebSocket(
        `/ws/choirs/${id}/chat/`,
        onSocketMessage,
    );

    useEffect(() => {
        let active = true;
        const loadConversation = async () => {
            try {
                const [messageResponse, choirResponse] = await Promise.all([
                    api.get(`api/choirs/${id}/messages/`),
                    api.get(`api/choirs/${id}/`),
                ]);
                if (active) {
                    setMessages((current) => mergeMessages(current, messageResponse.data));
                    setChoirName(choirResponse.data.choir.full_name);
                }
            } catch (loadError) {
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        loadConversation();
        return () => {
            active = false;
        };
    }, [id]);

    const sendMessage = async (event) => {
        event.preventDefault();
        const trimmedText = text.trim();
        if (!trimmedText && !attachment) return;

        setSending(true);
        setError('');
        try {
            let response;
            if (attachment) {
                const data = new FormData();
                data.append('text', trimmedText);
                data.append('attachment', attachment);
                response = await api.post(`api/choirs/${id}/messages/`, data);
            } else {
                response = await api.post(`api/choirs/${id}/messages/`, {text: trimmedText});
            }
            setMessages((current) => mergeMessages(current, [response.data]));
            setText('');
            setAttachment(null);
            formRef.current?.reset();
        } catch (sendError) {
            setError(getErrorMessage(sendError));
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Loading/>;

    return (
        <main className="mx-auto my-8 w-full max-w-5xl px-4">
            <Link className="mb-4 inline-block text-indigo-700 hover:underline" to={`/choirs/${id}`}>
                &larr; Back to {choirName || 'choir'}
            </Link>
            <section className="flex min-h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header className="border-b border-slate-200 p-5">
                    <h1 className="text-xl font-bold text-slate-900">{choirName} conversation</h1>
                    <p className="mt-1 text-sm text-slate-600">Live updates · {status}</p>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {messages.length === 0 && (
                        <p className="text-center text-slate-500">No messages yet. Start the conversation.</p>
                    )}
                    {messages.map((message) => (
                        <article key={message.id} className="rounded-xl bg-slate-50 p-4">
                            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                                <h2 className="font-semibold text-slate-900">{message.author_name}</h2>
                                <time className="text-xs text-slate-500">
                                    {new Date(message.created_at).toLocaleString()}
                                </time>
                            </div>
                            {message.text && <p className="whitespace-pre-wrap text-slate-700">{message.text}</p>}
                            {message.attachment_url && (
                                <AttachmentPreview name={message.attachment_name} url={message.attachment_url}/>
                            )}
                        </article>
                    ))}
                </div>

                <form ref={formRef} className="border-t border-slate-200 p-4" onSubmit={sendMessage}>
                    {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
                    <label className="sr-only" htmlFor="choir-chat-message">Message</label>
                    <textarea id="choir-chat-message" className="w-full rounded-xl border border-slate-300 p-3"
                              rows="3" maxLength={4000} value={text}
                              onChange={(event) => setText(event.target.value)}
                              placeholder="Write a message..." />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <input type="file" accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.aac,.m4a,.mp3,.ogg,.wav,.avi,.mkv,.mov,.mp4,.webm"
                               onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                               aria-label="Attach a document, audio, or video file"/>
                        <button className="btn-primary px-5 py-2" type="submit"
                                disabled={sending || (!text.trim() && !attachment)}>
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Attachments are limited to 25 MB per file.</p>
                </form>
            </section>
        </main>
    );
}

export default ChoirConversationPage;
