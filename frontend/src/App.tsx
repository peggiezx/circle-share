import { Timeline, type TimelineRef } from "./components/Timeline";
import { Login } from "./components/Login";
import { useEffect, useRef, useState } from "react";
import { clearStoredToken, getStoredToken } from "./services/api";
import { PostCreationForm } from "./components/PostCreationForm";
import { Register } from "./components/Register";
import { MyCircle } from "./components/MyCircle";
import { Invitations } from "./components/Invitations";
import type { Post } from "./types";

type View = "my-days" | "their-days" | "my-circle" | "register" | "login" | "notifications";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>("login");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState<boolean>(false);

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


  const handleLogout = () => {
    clearStoredToken();
    setIsLoggedIn(false);
    setCurrentView("login");
  };

  // Timeline refresh handler
  const timelineRef = useRef<TimelineRef>(null);
  const handlePostSuccess = () => {
    timelineRef.current?.refreshTimeline();
    setShowPostForm(false); // Hide the form after successful post
  };

  // Post selection handler
  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
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
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="CircleShare logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Middle - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search people, places, posts…"
          />
        </div>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Post Button - Only show on My Days */}
          {currentView === "my-days" && (
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{showPostForm ? "✕" : "+"}</span>
              <span className="hidden sm:inline">
                {showPostForm ? "Cancel" : "Post"}
              </span>
            </button>
          )}

          {/* Notification Button */}
          <button
            onClick={() => setCurrentView("notifications")}
            className={`p-2 rounded-lg transition-colors ${
              currentView === "notifications"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="Notifications"
          >
            🔔
          </button>

          {/* User Avatar / Logout Button */}
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors flex items-center justify-center"
            aria-label="Logout"
            title="Logout"
          >
            👤
          </button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: "my-days", label: "My Days", icon: "📝" },
              { id: "their-days", label: "Their Days", icon: "👥" },
              { id: "my-circle", label: "My Circle", icon: "🔗" },
              { id: "notifications", label: "Notifications", icon: "🔔" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === item.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Status */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Middle Column - Feed of Cards */}
          <main className="flex-1 overflow-auto">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentView === "my-days" && "My Days"}
                  {currentView === "their-days" && "Their Days"}
                  {currentView === "my-circle" && "My Circle"}
                  {currentView === "notifications" && "Notifications"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentView === "my-days" &&
                    "Share your thoughts and moments"}
                  {currentView === "their-days" &&
                    "See what your circle is sharing"}
                  {currentView === "my-circle" && "Manage your connections"}
                  {currentView === "notifications" &&
                    "Manage your notifications"}
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {/* My Days - Post Creation Form */}
              {currentView === "my-days" && showPostForm && (
                <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
                  <PostCreationForm onPostSuccess={handlePostSuccess} />
                </div>
              )}

              {/* Timeline/Feed Cards */}
              {(currentView === "my-days" || currentView === "their-days") && (
                <Timeline
                  ref={timelineRef}
                  type={currentView}
                  onPostSelect={handlePostSelect}
                />
              )}

              {/* My Circle Content */}
              {currentView === "my-circle" && <MyCircle />}

              {/* Notifications Content */}
              {currentView === "notifications" && <Invitations />}
            </div>
          </main>

          {/* Right Column - Expanded Post View */}
          <aside className="w-96 bg-white border-l border-gray-200 overflow-auto">
            {selectedPost ? (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Post Details
                  </h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Expanded Post Card */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  {/* Author Section */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedPost.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedPost.author_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Posted on{" "}
                        {new Date(selectedPost.created_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Post Stats */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Post ID: {selectedPost.post_id}</span>
                      <span>{selectedPost.content.length} characters</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Actions
                  </h3>

                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <span>💬</span>
                    <span>Reply to post</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <span>❤️</span>
                    <span>Like post</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <span>🔗</span>
                    <span>Share post</span>
                  </button>

                  {currentView === "my-days" &&
                    selectedPost.author_name === "You" && (
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                        <span>🗑️</span>
                        <span>Delete post</span>
                      </button>
                    )}
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">
                    More features like comments and reactions coming soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">👁️</div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Select a post
                  </h3>
                  <p className="text-sm">
                    Click on any post in the feed to view detailed information and
                    actions here
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
