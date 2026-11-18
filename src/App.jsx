import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import ProtectedRoutes from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import AuthForm from './components/AuthForm';
import EventDetailPage from "./pages/EventDetailPage.jsx";
import CreateEvent from "./pages/CreateEventPage.jsx";
import Cart from "./pages/Cart.jsx";
import EditEvent from "./pages/EditEvent.jsx";
import {UserProvider} from "./components/UserContext.jsx";
import CalenderApp from "./pages/CalenderApp.jsx";
import ProfileCompletionPage from "./pages/ProfileCompletionPage.jsx";
import ChoirDetailPage from "./pages/ChoirDetailPage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import ChoirConversationPage from "./pages/ChoirConversationPage.jsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.jsx";
import AttendanceReviewPage from "./pages/AttendanceReviewPage.jsx";
import MemberProfilePage from "./pages/MemberProfilePage.jsx";


function App() {

    return (
        <>

            <BrowserRouter>

                <NavBar/>

                <div className=''>
                    <UserProvider>
                        <Routes>
                            <Route path='/login'
                                   element={
                                       <AuthForm/>
                                   }/>
                            <Route path='/'
                                   element={
                                       <ProtectedRoutes>
                                           <Home/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/complete-profile'
                                   element={
                                       <ProtectedRoutes requireProfile={false}>
                                           <ProfileCompletionPage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/choirs/:id'
                                   element={
                                       <ProtectedRoutes>
                                           <ChoirDetailPage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/choirs/:id/attendance'
                                   element={
                                       <ProtectedRoutes>
                                           <AttendancePage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/choirs/:id/attendance/review/:date'
                                   element={
                                       <ProtectedRoutes>
                                           <AttendanceReviewPage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/choirs/:id/conversation'
                                   element={
                                       <ProtectedRoutes>
                                           <ChoirConversationPage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/announcements'
                                   element={
                                       <ProtectedRoutes>
                                           <AnnouncementsPage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/members/:profileId'
                                   element={
                                       <ProtectedRoutes>
                                           <MemberProfilePage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/calender'
                                   element={
                                       <ProtectedRoutes>
                                           <CalenderApp/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/new-event'
                                   element={
                                       <ProtectedRoutes>
                                           <CreateEvent/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/event/:id'
                                   element={
                                       <ProtectedRoutes>
                                           <EventDetailPage/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/event/edit/:id'
                                   element={
                                       <ProtectedRoutes>
                                           <EditEvent/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='/cart'
                                   element={
                                       <ProtectedRoutes>
                                           <Cart/>
                                       </ProtectedRoutes>
                                   }/>
                            <Route path='*' element={<Navigate to='/'/>}/>
                        </Routes>
                    </UserProvider>
                </div>


            </BrowserRouter>
        </>
    )
}

export default App
