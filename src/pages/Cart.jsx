import React, {useContext, useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import {api} from "../api.js";
import UserContext from "../components/UserContext.jsx";
import Loading from "../components/Loading.jsx";

export default function Cart() {
    const {user} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    const navigate = useNavigate();

    async function fetchCart() {
        setLoading(true);
        try{
            await api.get(`api/cart/`)
                .then(res => {
                    setCartItems(res.data);
                    setLoading(false);
                    console.log('new',res.data);
                });
        }catch(err){
            console.log(err)
            setError(err);
        }finally {
            setLoading(false);
        }
    }

    async function More(event_id) {
        setLoading(true)
        try{
            await api.put('api/cart/add/', {event_id: event_id, amount: 1})
                .then(res => {
                    setCartItems({...cartItems, amount: res.data.amount});
                })

        }catch (e) {
            setError(e);
        }finally {
            setLoading(false)
        }
    }
    async function Less(event_id) {
        setLoading(true)
        try{
            await api.put('api/cart/add/', {event_id: event_id, amount: -1})
                .then(res => {
                    setCartItems({...cartItems, amount: res.data.amount});
                })

        }catch (e) {
            setError(e);
        }finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCart();
    }, [])



    async function handleDelete(item_id) {
        setLoading(true);
        try{
            await api.delete(`api/cart/add/`, {item_id: item_id}).then(res => {alert(res.data.message)})
        }catch (err) {
            setError(err);
            console.log(err)
        }finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (<Loading />)
    }
    console.log('add',cartItems)



    return(
        <div className="bg-gray-200">
            <div className='flex flex-col '>
                <h2>Shopping Cart</h2>
                <p>Review and set you favorite items in one place</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-5 '>
                <div className='col-span-3 flex flex-col'>
                    {cartItems.length > 0 ? cartItems.map((item) => (
                        <div key={item.event.id} className='flex gap-3 w-full p-3 border bg-white shadow-xl rounded-xl my-3  border-gray-300'>
                            <div className='w-15 h-15 rounded-xl'>
                                <img src={item.event.banner} alt={item.event.name}
                                className='w-full h-full rounded-xl object-cover object-center'/>

                            </div>
                            <div className='flex flex-col'>
                                <p>{item.event.venue.name}</p>
                                <h4>{item.event.name}</h4>
                            </div>
                            <div className='flex gap-3  justify-center items-center mx-5'>
                                <button className='texy-5xl font-bold border border-gray-300 px-4 py-4 rounded-xl text-indigo-700 ' onClick={() => {More(item.event.id)}}>+</button>
                                <h3>{item.event.price == 0 ? 'Free' : `${item.amount}`}</h3>
                                <button className='texy-5xl font-bold border border-gray-300 px-4 py-4 rounded-xl text-indigo-700 ' onClick={() => {Less(item.event.id)}}>-</button>
                                <button onClick={() => {handleDelete(item.event.id)}}>Remove</button>
                            </div>
                        </div>

                    )) : "No Cart Item to show"}
                </div>
            </div>
        </div>
    )





}