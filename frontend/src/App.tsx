import { Timeline, type TimelineRef } from "./components/Timeline";
import { Login } from "./components/Login";
import { useEffect, useRef, useState } from "react";
import { clearStoredToken, getStoredToken } from "./services/api";
import { PostCreationForm } from "./components/PostCreationForm";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const token = getStoredToken();
        setIsLoggedIn(!!token);
    }, []
    );

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    }

    const timelineRef = useRef<TimelineRef>(null);

     const handlePostSuccess = () => {
       timelineRef.current?.refreshTimeline();
     };

     const handleLogout = () => {
        clearStoredToken();
        setIsLoggedIn(false);
     }

    
    return (
        <div>
            <h1>Circle Share</h1>
            {isLoggedIn && (
                <button onClick={handleLogout} style= {{ padding: '8px 16px'}}>
                    Logout
                </button>
            )}
            {isLoggedIn ? (
                <div> 
                    <PostCreationForm onPostSuccess={handlePostSuccess} />
                    <Timeline ref={timelineRef} />
                </div>
            ): (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;