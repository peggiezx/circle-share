import { Timeline, type TimelineRef } from "./components/Timeline";
import { Login } from "./components/Login";
import { useEffect, useRef, useState } from "react";
import { clearStoredToken, getStoredToken } from "./services/api";
import { PostCreationForm } from "./components/PostCreationForm";
import { Register } from "./components/Register";
import { MyCircle } from "./components/MyCircle";
import { Invitations } from "./components/Invitations";

type View = "my-days" | "their-days" | "my-circle" | "register" | "login" | "invitations";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>("login");

  // Check authentication on app load
  useEffect(() => {
    const token = getStoredToken();
    setIsLoggedIn(!!token);
    if (token) {
      setCurrentView("my-days"); // Go to timeline if already logged in
    }
  }, []);

  // Auth handlers
  const handleRegisterSuccess = () => {
    setCurrentView("login");
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView("my-days");
  };

  const handleLoginError = () => {
    setCurrentView("register");
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsLoggedIn(false);
    setCurrentView("login");
  };

  // Timeline refresh handler
  const timelineRef = useRef<TimelineRef>(null);
  const handlePostSuccess = () => {
    timelineRef.current?.refreshTimeline();
  };

  // Auth flow - clean separation
  if (!isLoggedIn) {
    return (
      <div className="font-sans min-h-screen bg-stone-50">
        {currentView === "login" ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView("register")}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView("login")}
          />
        )}
      </div>
    );
  }

  // Main app - authenticated user
  return (
    <div className="font-sans min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#B3EBF2] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">C</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">
              CircleShare
            </h1>{" "}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-stone-200 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === "my-days"
                  ? "border-[#85D1DB] text-[#85D1DB]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setCurrentView("my-days")}
            >
              My Days
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === "their-days"
                  ? "border-[#85D1DB] text-[#85D1DB]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setCurrentView("their-days")}
            >
              Their Days
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === "my-circle"
                  ? "border-[#85D1DB] text-[#85D1DB]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setCurrentView("my-circle")}
            >
              My Circle
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === "invitations"
                  ? "border-[#85D1DB] text-[#85D1DB]"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setCurrentView("invitations")}
            >
              Invitations
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentView === "my-days" && (
          <div className="space-y-6">
            <PostCreationForm onPostSuccess={handlePostSuccess} />
            <Timeline ref={timelineRef} type="my-days" />
          </div>
        )}
        {currentView === "their-days" && (
          <div className="space-y-6">
            <Timeline ref={timelineRef} type="their-days" />
          </div>
        )}

        {currentView === "my-circle" && <MyCircle />}
        {currentView === "invitations" && <Invitations />}
      </main>
    </div>
  );
}

export default App;
