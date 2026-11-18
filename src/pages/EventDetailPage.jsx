import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import Loading from "../components/Loading.jsx";
import {api} from "../api.js";
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Rating from "@mui/material/Rating";
import { FaCalendar } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import Map from "../components/Map.jsx";
import UserContext from "../components/UserContext.jsx";


function EventDetailPage() {


    const {id} = useParams(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [event, setEvent] = useState(null);
    const navigate = useNavigate();

    const {user} = useContext(UserContext);


    const fetchData = async () => {
        setLoading(true);
        try{
            await api.get(`api/event/${id}`)
            .then(response => {
                console.log(response);
                setEvent(response.data)
            })

        }catch(err){
            console.log(err)
            setLoading(false);
            setError(err.response.data.errors);

        }finally {
            setLoading(false);
        }
    }



    const handleDelete = async () => {
        setLoading(true);
        if(user.id != event.posted_by){
            alert("You don't have Permission to delete this event");
            navigate(`/event/${id}`);
        }
        try{

            const conf = confirm("Do you want to delete this Event? ")
            if(conf){
                await api.delete(`api/event/${id}`)
                alert('Deleted Successfully')
                navigate("/")
            }
        }catch(err){
            console.log(err)
            alert(err)
        }finally {
            setLoading(false);
        }
    }

    const handleEdit = async () => {
        navigate(`edit-event/${id}`)
    }


    useEffect(() => {
        fetchData();
    }, [])

    if (loading){
        return <Loading />;
    }

   function formatDate(date) {

       const dateObj = new Date(date);

// Example 1: Full Date & Time (e.g., "Aug 25, 2026, 11:27 PM")
       const readableDateTime = dateObj.toLocaleDateString("en-US", {
           month: "short",
           day: "numeric",
           year: "numeric",
           hour: "numeric",
           minute: "2-digit",
           hour12: true,
       });

       return readableDateTime;
   }

    if (error){
        return <Alert severity="error">Failed to Fetch</Alert>;
    }
    if(event){
        console.log(user, event.posted_by);

    }

    return (
        <div>
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Events
            </Link>
            <div className='grid grid-cols-1 bg-gray-100 md:grid-cols-6 lg:grid-cols-6 p-4 gap-2'>

                {/* Back Link */}

                <div className='col-span-4 flex flex-col justify-center '>
                    <div className='w-full h-100'>
                        <img src={event && event.banner}
                             alt={event && event.name}
                             className='object-center object-cover w-full h-full rounded-xl'
                        />
                    </div>
                    <div className='mt-3 px-1 border-2  border-gray-200 rounded-2xl overflow-hidden'>
                        <div className='flex justify- items-start '><h1 className='text-center py-3 '>{event && event.name}</h1></div>
                        <div>
                            <Rating value={event && event.id} />(Review 4.6)
                        </div>
                        <h4>Event Type: {event && event.event_type}</h4>




                    </div>
                    <div className='p-3 '>
                        <h3>About this Event</h3>
                        <h4>{event && event.description}</h4>
                        <div className='my-5 '>
                            <img src={event && event.venue.image} alt=""/>
                        </div>

                    </div>
                </div>
                <div className={' col-span-2'}>
                    <div className='border border-gray-200 rounded-2xl overflow-hidden shadow-xl p-3 bg-white'>
                        <h3>Event Details</h3>
                        <div className='flex gap-3'>
                            <div className='p-1 bg-indigo-600 w-10 h-10 flex justify-center items-center text-white rounded-xl'><FaCalendar className='font-bold text-lg' /></div>
                            <div className='flex flex-col'>
                                <p>Start Date</p>
                                <h3 className='text-sm'>{event && formatDate(event.start_date)}</h3>
                            </div>
                        </div>
                        <div className='flex gap-3 '>
                            <div className='p-1 bg-indigo-600 w-10 h-10 flex justify-center items-center text-white rounded-xl'><FaCalendar className='font-bold text-lg' /></div>
                            <div className='flex flex-col'>
                                <p>End Date</p>
                                <h3 className='text-sm'>{event && formatDate(event.end_date)}</h3>
                            </div>
                        </div>
                        <div className='flex gap-3'>
                            <div className='p-1 bg-indigo-600 w-10 h-10 flex justify-center items-center text-white rounded-xl'><FaMapLocationDot className='font-bold text-lg' /></div>
                            <h3>{event && event.venue.name}</h3>
                        </div>
                        <div className='my-3'>
                            <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={(e) => {
                                    e.preventDefault(); // Prevents the Link from triggering when clicking the button
                                    if (onAddToCart) onAddToCart(event);
                                }}
                                className='!bg-indigo-600 my-3 hover:!bg-indigo-700 !normal-case !rounded-xl !py-2 !shadow-sm !font-bold flex items-center justify-center gap-2'
                            >Buy Ticket</Button>
                        </div>
                    </div>
                    <Map place={event && event.venue.adress} />
                    {
                        user && event ?
                            user.id == event.posted_by &&  <div className='p-4 flex gap-5 justify-center '>
                            <Link to={`/event/edit/${id}`} className='border border-indigo-700 hover:bg-indigo-400 text-indigo-700 rounded-xl py-2 px-4 '>Edit </Link>
                            <button  onClick={handleDelete} className='py-2 px-4 text-red-600 bg-red-200 border hover:bg-red-400  border-red-400 rounded-xl'>Delete</button>
                        </div>
                            : null


                    }


                </div>
            </div>
        </div>
    );
}

export default EventDetailPage;