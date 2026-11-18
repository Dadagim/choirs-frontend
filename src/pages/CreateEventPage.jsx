import React, {useEffect, useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import {jwtDecode} from 'jwt-decode';

export default function CreateEvent() {
    const navigate = useNavigate();

    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('access');
    const user = jwtDecode(token)['user_id'];


    useEffect(() => {
        async function fetchVenues() {
            setLoading(true);
            try{
                await api.get('/api/venues/')
                .then((response) => {
                    console.log(response.data);
                    setVenues(response.data);
                })

            }catch(error){
                console.log(error);

            }finally {
                setLoading(false);
            }

        }
        fetchVenues();
    }, [])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: null,
        startDate: '',
        endDate: '',
        type: '',
        banner: null,
    });


    // Handle standard text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file input for the banner image
    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, banner: e.target.files[0] }));
    };

    // Submit form data to Django backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Use FormData because we are sending a file (banner) along with text
        const data = new FormData();
        data.append('name', formData.title);
        data.append('description', formData.description);
        data.append('venue_id', formData.location);
        data.append('start_date', formData.startDate);
        data.append('end_date', formData.endDate);
        data.append('posted_by', user);
        data.append('event_type', formData.type);
        if (formData.banner) {
            data.append('banner', formData.banner);
        }

        console.log(data);




        try {
            await api.post('api/events/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Redirect back to home or event list on success
            navigate('/');
        } catch (err) {
            console.error('Failed to create event:', err);
            setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create event. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Events
                </Link>

                {/* Form Container */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Create New Event</h1>
                        <p className="text-sm text-slate-500 mt-1">Fill out the details below to publish your event to the platform.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-pink-50 border border-pink-200 text-pink-600 text-sm rounded-2xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Frontend Developers Summit"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm"
                            />
                        </div>

                        {/* Location */}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Venue</label>
                            <select
                                name="location"
                                required
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Millennium Hall, Addis Ababa"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm"
                            >
                                <option selected disabled>Select Venue</option>
                                {venues && venues.map((venue) => {
                                    return (
                                        <option value={venue.id} key={venue.id}>{venue.name}</option>
                                    )
                                })}
                            </select>

                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event Type</label>
                            <select
                                name="type"
                                required
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm"
                            >
                                <option  selected disabled>Event Type</option>
                                <option value="concert">Concert</option>
                                <option value="sport">Sport</option>
                                <option value="theater">Theater</option>
                                <option value="other">Other</option>

                            </select>

                        </div>
                        {/* Date Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm"
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
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Write a detailed description of your event..."
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm resize-none"
                            ></textarea>
                        </div>

                        {/* Banner Image Upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event Banner Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating Event...' : 'Publish Event'}
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
}