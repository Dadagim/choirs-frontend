import axios from 'axios';



export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://dato-fares-mezmur-agelglot.onrender.com/'
})

let refreshRequest = null;

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

api.interceptors.response.use((response) => response, async (error) => {
    const request = error.config;
    const url = request?.url || '';
    const isTokenRequest = url.includes('api/token/');
    if (error.response?.status !== 401 || !request || request._retry || isTokenRequest) {
        return Promise.reject(error);
    }

    const refresh = localStorage.getItem('refresh');
    if (!refresh) return Promise.reject(error);

    request._retry = true;
    try {
        if (!refreshRequest) {
            refreshRequest = api.post('api/token/refresh/', {refresh})
                .then((response) => {
                    localStorage.setItem('access', response.data.access);
                    return response.data.access;
                })
                .catch((refreshError) => {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    throw refreshError;
                })
                .finally(() => {
                    refreshRequest = null;
                });
        }

        const access = await refreshRequest;
        request.headers.Authorization = `Bearer ${access}`;
        return api(request);
    } catch (refreshError) {
        return Promise.reject(refreshError);
    }
});