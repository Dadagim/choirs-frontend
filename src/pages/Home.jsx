import Loading from '../components/Loading';
import {useEffect, useState} from "react";
import {api} from "../api.js";
import Card from '../components/ui/Card.jsx';
import ChoirCard from "../components/ChoirCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

function Home() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [choirs, setChoirs] = useState([]);

    const fetchChoirs = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.get('api/choirs/');
            const choirData = Array.isArray(res.data)
                ? res.data
                : res.data && typeof res.data === 'object'
                    ? [res.data]
                    : null;

            if (choirData === null) {
                throw new Error("Unexpected response from choir API");
            }

            setChoirs(choirData);
            console.log("Data from API:", res.data);
        } catch (err) {
            console.error("API Error:", err);
            setError(err.message || "Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChoirs();
    }, []);


    if (loading) {
        return <Loading/>
    }
    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className="row-span-6 flex flex-col h-full w-full items-center">

            <Card className=''>
                <div className={'text-left'}>
                    <h1 className=''>Choir Management system</h1>
                    <p>Manage every thing from one place</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                    
                    {
                        choirs && choirs.length > 0 ? choirs.map(choir => {

                            return <ChoirCard key={choir.id} choir={choir}/>
                        }) : <EmptyState/>
                    }
                </div>

            </Card>

        </div>
    )
}

export default Home