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
    <div className="font-sans min-h-screen bg-gradient-to-br from-[#B3EBF2]/10 to-[#B3EBF2]/20 flex flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-[#B3EBF2]/30 shadow-lg flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b border-[#B3EBF2]/20">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="CircleShare logo"
              className="h-4 w-auto object-contain"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {[
                { id: "my-days", label: "My Days", icon: "📝" },
                { id: "their-days", label: "Their Days", icon: "👥"},
                { id: "my-circle", label: "My Circle", icon: "🔗"},
                { id: "notifications", label: "Notifications", icon: "🔔" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentView === item.id
                      ? "bg-[#B3EBF2] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800 hover:bg-[#B3EBF2]/10"
                  }`}
                  onClick={() => setCurrentView(item.id as View)}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* User Status & Logout */}
        <div className="p-4 border-t border-[#B3EBF2]/20 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#B3EBF2]/10 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">Online</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-white hover:bg-[#B3EBF2] rounded-xl transition-all duration-200 font-medium border border-[#B3EBF2]/30"
          >
            Logout
          </button>
        </div>
      </aside>

        {/* Three Column Layout */}
        <div className="flex-1 flex overflow-hidden">
        {/* Middle Column - Feed of Cards */}
        <main className="flex-1 overflow-auto border-r-2 border-[#B3EBF2]/30 relative">
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#B3EBF2]/20 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentView === "my-days" && "My Days"}
                  {currentView === "their-days" && "Their Days"}  
                  {currentView === "my-circle" && "My Circle"}
                  {currentView === "notifications" && "Notifications"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {currentView === "my-days" && "Share your thoughts and moments"}
                  {currentView === "their-days" && "See what your circle is sharing"}
                  {currentView === "my-circle" && "Manage your connections"}
                  {currentView === "notifications" && "Manage your notifications"}
                </p>
              </div>
              
              {/* Add Post Button - Only show on My Days */}
              {currentView === "my-days" && (
                <button
                  onClick={() => setShowPostForm(!showPostForm)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    showPostForm
                      ? "bg-gray-100 text-gray-700 border border-gray-300"
                      : "bg-[#B3EBF2] text-white shadow-md hover:shadow-lg border border-[#B3EBF2]"
                  }`}
                >
                  <span className="text-lg">{showPostForm ? "✕" : "+"}</span>
                  <span className="hidden sm:inline">{showPostForm ? "Cancel" : "Add Post"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 space-y-6">
            {/* My Days - Post Creation Form */}
            {currentView === "my-days" && showPostForm && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#B3EBF2]/30 shadow-sm animate-in slide-in-from-top duration-200">
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
          
          {/* Elegant Divider */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#B3EBF2]/50 via-[#B3EBF2]/20 to-transparent pointer-events-none"></div>
        </main>

        {/* Right Column - Expanded Post View */}
        <aside className="w-96 bg-white/50 backdrop-blur-sm overflow-auto shadow-inner border-l border-[#B3EBF2]/10">
          {selectedPost ? (
            <div className="p-6 h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Post Details</h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Expanded Post Card */}
              <div className="bg-white rounded-xl border border-[#B3EBF2]/30 shadow-sm mb-6">
                <div className="p-6">
                  {/* Author Section */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#B3EBF2] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedPost.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{selectedPost.author_name}</h3>
                      <p className="text-sm text-gray-500">
                        Posted on {new Date(selectedPost.created_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="prose prose-sm max-w-none mb-6">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Post Stats */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Post ID: {selectedPost.post_id}</span>
                      <span>{selectedPost.content.length} characters</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Actions</h3>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200">
                  <span>💬</span>
                  <span>Reply to post</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200">
                  <span>❤️</span>
                  <span>Like post</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200">
                  <span>🔗</span>
                  <span>Share post</span>
                </button>

                {currentView === "my-days" && selectedPost.author_name === "You" && (
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200">
                    <span>🗑️</span>
                    <span>Delete post</span>
                  </button>
                )}
              </div>

              {/* Coming Soon Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 text-center">
                  More features like comments and reactions coming soon!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">👁️</div>
                <h3 className="font-medium text-gray-700 mb-2">Select a post</h3>
                <p className="text-sm">Click on any post in the feed to view detailed information and actions here</p>
              </div>
            </div>
          )}
        </aside>
        </div>
      </div>

      {/* Footer */}
      {/* <footer className="mt-auto border-t border-[#B3EBF2]/20 px-6 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            CircleShare - Mindful connections with the people who matter
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default App;
