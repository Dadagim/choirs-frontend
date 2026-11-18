import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { api } from '../api';
import {jwtDecode} from 'jwt-decode';

export default function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access')
    const user = jwtDecode(token)['user_id'];
    const [posted, setPosted] = useState(null);




    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        startDate: '',
        endDate: '',
        event_type: '',
        banner: null,
    });

    // 1. Fetch event details and venues list on mount
    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            try {
                const [eventRes, venuesRes] = await Promise.all([
                    api.get(`/api/event/${id}/`),
                    api.get('/api/venues/')
                ]);

                const ev = eventRes.data;
                setVenues(venuesRes.data);
                setPosted(ev.posted_by);



                // Pre-fill form fields with existing backend data
                setFormData({
                    title: ev.name || '',
                    description: ev.description || '',
                    venue: ev.venue?.id || ev.venue || '',
                    startDate: ev.start_date ? ev.start_date.slice(0, 16) : '', // format for datetime-local
                    endDate: ev.end_date ? ev.end_date.slice(0, 16) : '',
                    event_type: ev.event_type || '',
                    banner: null, // Keep null unless user wants to upload a new one
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load event data for editing.");
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, banner: e.target.files[0] }));
    };

    // Submit updated data via PUT or PATCH
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('name', formData.title);
        data.append('description', formData.description);
        data.append('venue', formData.venue);
        data.append('start_date', formData.startDate);
        data.append('end_date', formData.endDate);
        data.append('event_type', formData.event_type);

        // Only append banner if the user selected a new file
        if (formData.banner) {
            data.append('banner', formData.banner);
        }

        try {
            await api.put(`api/event/${id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate(`/event/${id}`);
        } catch (err) {
            console.error('Failed to update event:', err);
            setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10">
            <div className="max-w-3xl mx-auto space-y-6">

                <Link
                    to={`/event/${id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                    ← Back to Event Details
                </Link>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Edit Event</h1>
                        <p className="text-sm text-slate-500 mt-1">Update the details of your event below.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-pink-50 border border-pink-200 text-pink-600 text-sm rounded-2xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event Type</label>
                            <select
                                name="event_type"
                                required
                                value={formData.event_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                            >
                                <option value="" disabled>Select Event Type</option>
                                <option value="Theater">Theater</option>
                                <option value="Concert">Concert</option>
                                <option value="Sport">Sport</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Venue</label>
                            <select
                                name="venue"
                                required
                                value={formData.venue}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                            >
                                <option value="" disabled>Select Venue</option>
                                {venues.map((venue) => (
                                    <option value={venue.id} key={venue.id}>{venue.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    required
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Banner Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving Changes...' : 'Update Event'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}