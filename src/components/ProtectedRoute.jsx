import {useEffect, useState} from 'react';
import { Navigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode';
import {api} from "../api.js";
import Loading from "./Loading.jsx";


function ProtectedRoute({children, requireProfile = true}) {
    const [status, setStatus] = useState('checking');
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        const checkAccess = async () => {
            const token = localStorage.getItem('access');
            if (!token) {
                setStatus('unauthorized');
                return;
            }

            try {
                const expiration = jwtDecode(token).exp;
                if (!expiration) {
                    setStatus('unauthorized');
                    return;
                }

                if (expiration * 1000 < Date.now()) {
                    const refresh = localStorage.getItem('refresh');
                    if (!refresh) {
                        setStatus('unauthorized');
                        return;
                    }

                    const response = await api.post('api/token/refresh/', {refresh});
                    localStorage.setItem('access', response.data.access);
                }

                if (requireProfile) {
                    try {
                        await api.get('api/user-profile/me/');
                    } catch (profileError) {
                        if (profileError.response?.status === 404) {
                            if (active) setStatus('profile-missing');
                            return;
                        }
                        throw profileError;
                    }
                }

                if (active) setStatus('authorized');
            } catch (requestError) {
                if (requestError.response?.status === 401) {
                    localStorage.removeItem('access');
                    if (active) setStatus('unauthorized');
                    return;
                }
                if (active) {
                    setError(requestError.message || 'Unable to verify your account.');
                    setStatus('error');
                }
            }
        };

        checkAccess();
        return () => {
            active = false;
        };
    }, [requireProfile]);

    if (status === 'checking') {
        return <Loading/>;
    }

    if (status === 'unauthorized') {
        return <Navigate to='/login' replace/>;
    }

    if (status === 'profile-missing') {
        return <Navigate to='/complete-profile' replace/>;
    }

    if (status === 'error') {
        return <p role="alert">{error}</p>;
    }


    return children;
}
export default ProtectedRoute;