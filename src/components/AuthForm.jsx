import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../api.js";
import PleaseWait from "./PleaseWait.jsx";


function AuthForm() {

    // const no = '0923963655';

    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function changeMethod() {
        setIsLogin(!isLogin)
    }

    function handleSubmit(e) {
        e.preventDefault();
        !isLogin ? login() : register();
    }


    async function register() {
        setLoading(true);
        localStorage.clear()
        try {
            const res = await api.post('/users/register/', {
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                password: password
            })
            console.log(res)
            if (res.status === 200) {
                console.log(res.data)
                setIsLogin(true)
            } else {
                setLoading(false);
                console.log(res.statusText)
            }

        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }


    async function login() {
        setLoading(true);
        try {
            const res = await api.post('api/token/', {
                username: email,
                password: password
            })

            if (res.status === 200) {
                console.log(res.data)

                localStorage.setItem('access', res.data.access)
                localStorage.setItem('refresh', res.data.refresh)
                navigate('/')

            } else {
                setLoading(false);
            }

        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }

    return (

        <div className="column">

            <form className='column  shadow-xl  border mt-5 md:p-2 rounded-2xl border-gray-200 '
                  onSubmit={handleSubmit}>
                <h1 className='logo my-4 text-left'>{!isLogin ? 'Login' : 'Register'}</h1>


                {
                    isLogin && <input type="text"
                                      placeholder='eg. Dagim'
                                      name='firstName'
                                      value={firstName}
                                      onChange={(e) => {
                                          setFirstName(e.target.value)
                                      }}

                    />
                }

                {
                    isLogin && <input type="text"
                                      placeholder='eg.Dawit'
                                      name='lastName'
                                      value={lastName}
                                      onChange={(e) => {
                                          setLastName(e.target.value)
                                      }}

                    />
                }

                <input type="text"
                       placeholder='eg. example123'
                       name='Username'
                       value={email}
                       onChange={(e) => {
                           setEmail(e.target.value)
                       }}

                />


                {
                    isLogin && <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event
                            Title</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={email}
                            onChange={(e) => {
                                setUsername(e.target.value)
                            }}
                            placeholder="e.g., admin"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm"/>
                    </div>

                }


                <input type="password"
                       placeholder='Strong password'
                       name='password'
                       value={password}
                       onChange={(e) => {
                           setPassword(e.target.value)
                       }}

                />

                <button className="btn-primary w-[60%] mt-3 p-2" type="submit">
                    {loading ? <PleaseWait/> : !isLogin ? 'Login' : 'Register'}


                </button>

                <p className='my-3 cursor-pointer' onClick={changeMethod}>

                    {isLogin ? 'Have already an account? Login' : 'Dont have an account? Register'}
                </p>


                <div className="flex justify-center items-center gap-1 p-5">
                    <div className="border h-0 w-19 border-gray-200"></div>
                    <h1 className="text-gray-600 text-center">Log in with</h1>
                    <div className="border h-0 w-19 border-gray-200"></div>
                </div>
                <div className="flex w-full justify-evenly items-center h-30">
                    <div className="border border-gray-300 shadow-md p-3 rounded-xl">
                        <img src="https://i.pinimg.com/1200x/b7/86/79/b786795a5bfba85a9d0422b015d2a460.jpg" width='60'
                             alt=""/>
                    </div>
                    <div className="border border-gray-300 shadow-md p-3 rounded-xl">
                        <i className="fa-brands text-blue-500 font-bold text-5xl fa-facebook"></i>
                    </div>
                </div>

            </form>


        </div>
    );
}

export default AuthForm;