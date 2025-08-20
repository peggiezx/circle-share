import { Timeline, type TimelineRef } from "./components/Timeline";
import { Login } from "./components/Login";
import { useEffect, useRef, useState } from "react";
import { clearStoredToken, getStoredToken } from "./services/api";
import { PostCreationForm } from "./components/PostCreationForm";
import { Register } from "./components/Register";
import { MyCircle } from "./components/MyCircle";
import "./App.css";
import { Invitations } from "./components/Invitations";

type View = 'timeline' | 'my-circle' | 'register' |'login' | 'invitations';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<View>("login");

    useEffect(() => {
        const token = getStoredToken();
        setIsLoggedIn(!!token);
    }, []
    );

    const handleRegisterSuccess = () => {
        setCurrentView("login")
    }

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setCurrentView("timeline")
    }

    const handleLoginError = () => {
        setCurrentView("register");
    }

    const timelineRef = useRef<TimelineRef>(null);

    const handlePostSuccess = () => {
       timelineRef.current?.refreshTimeline();
    };

    const handleLogout = () => {
        clearStoredToken();
        setIsLoggedIn(false);
        setCurrentView("login");
    }


    if (isLoggedIn) {
        return (
          <div className="app-container">
            <div className="tab-navigation">
              <h1>Circle Share</h1>
              <button onClick={handleLogout} style={{ padding: "8px 16px" }}>
                Logout
              </button>
              <button
                className={`tab ${currentView === "timeline" ? "active" : ""}`}
                onClick={() => setCurrentView("timeline")}
              >
                My Days
              </button>

              <button
                className={`tab ${currentView === "my-circle" ? "active" : ""}`}
                onClick={() => setCurrentView("my-circle")}
              >
                My Circle
              </button>
              <button
                className={`tab ${currentView === "invitations" ? "active" : ""}`}
                onClick={() => setCurrentView("invitations")}
              >
                Invitations
              </button>
            </div>

            {currentView === "timeline" && (
              <>
                <PostCreationForm onPostSuccess={handlePostSuccess} />
                <Timeline ref={timelineRef} />
              </>
            )}
            {currentView === "my-circle" && <MyCircle />}
            {currentView === "invitations" && <Invitations/>}
          </div>
        );
    }

    return (
      <div>
        <h1>Circle Share</h1>
        {currentView === "login" ? (
            <div>
                <Login onLoginSuccess={handleLoginSuccess}
                onLoginError={handleLoginError}/>
                <p>Don't have an account?
                <button onClick={()=> setCurrentView("register")}>Register here</button>
                </p>
            </div>
        ):(
            <div>
                <Register onRegisterSuccess={handleRegisterSuccess} />
                <p>
                    Already have an account?
                    <button onClick={() => setCurrentView("login")}>
                        Login here
                    </button>
                </p>
            </div>
        )}
      </div>
    );
    
}

export default App;