import {Link, useLocation, useNavigate} from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx';


function NavBar() {


    const navigate = useNavigate();
    const {pathname} = useLocation();

    if (pathname === '/login') {
        return null;
    }

    function logout() {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login')

    }

    return (
        <header className='col-span-5  row-span-1 border-b border-gray-200 '>
            <div className="flex-around bg-gray-10 py-3">
                <div className='flex gap-2 items-center  '>
                    <img src="src/assets/logo.jpg" alt="" className='w-30 md:w-40 lg:w-50'/>
                    <h5>የዳቶ ፋሬስ ሕ/ብ/ቤተ-ክርስቲያን <br/> የመዝሙር እና የአምልኮ አገልግሎት</h5>
                </div>


                <div className="flex items-center gap-3">
                    <nav>
                        <Link to="/" className='link active'>Home</Link>
                        <Link to="/announcements" className='link'>Announcements</Link>
                        <button onClick={logout} className='link'>Logout</button>
                    </nav>
                    <ThemeToggle/>
                </div>


            </div>

        </header>
    );
}

export default NavBar;