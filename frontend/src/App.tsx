import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Timeline, type TimelineRef } from "./components/Timeline";
import { Login } from "./components/Login";
import { useEffect, useRef, useState } from "react";
import { clearStoredToken, getStoredToken, toggleLike } from "./services/api";
import { PostCreationForm } from "./components/PostCreationForm";
import { Register } from "./components/Register";
import { MyCircle } from "./components/MyCircle";
import { Invitations } from "./components/Invitations";
import { CommentSection } from "./components/CommentSection";
import type { Post } from "./types";
import Modal from "./components/Modal";


type View = "my-days" | "their-days" | "my-circle" | "register" | "login" | "notifications";

function App() {
  // Initialize based on stored token to prevent flash
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getStoredToken());
  const [currentView, setCurrentView] = useState<View>(() => 
    getStoredToken() ? "my-days" : "login"
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [isLikeToggling, setIsLikeToggling] = useState<boolean>(false);

  // Check authentication on app load
  useEffect(() => {
    const token = getStoredToken();
    setIsLoggedIn(!!token);
    if (token) {
      setCurrentView("my-days");
    }
    setIsLoading(false); // Set loading to false after auth check
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserDropdown && !target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

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
    setShowPostModal(false); // Hide the modal after successful post
  };


  // Post selection handler
  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
  };

  // Like handler
  const handleLikeToggle = async () => {
    if (!selectedPost || isLikeToggling) return;

    try {
      setIsLikeToggling(true);
      const result = await toggleLike(selectedPost.post_id);
      
      // Update the selected post with new like data
      setSelectedPost(prev => prev ? {
        ...prev,
        user_liked: result.liked,
        like_count: result.liked ? prev.like_count + 1 : prev.like_count - 1
      } : null);
      
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLikeToggling(false);
    }
  };

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 drop-shadow-sm"></div>
          <p className="text-brand-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100">
      {/* HEADER - Full width across top */}
      <header className="w-full h-16 bg-gradient-to-r from-brand-300 via-brand-200 to-brand-100 border-b border-[#B3EBF2]/30 px-6 flex items-center justify-between shadow-sm backdrop-blur-sm relative z-10">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="CircleShare logo"
            className="h-4 w-auto object-contain"
          />
        </div>

        {/* Middle - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <input
            className="w-full border border-brand-300/50 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 focus:bg-white transition-all duration-200 shadow-sm placeholder-gray-500"
            placeholder="Search people, places, posts…"
          />
        </div>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button
            onClick={() => setCurrentView("notifications")}
            className={`p-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
              currentView === "notifications"
                ? "bg-[#B3EBF2] text-gray-900 shadow-md"
                : "hover:bg-white/70 text-[#85D1DB] shadow-sm backdrop-blur-sm"
            }`}
            aria-label="Notifications"
          >
            🔔
          </button>

          {/* User Avatar / Dropdown Menu */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-8 h-8 rounded-full bg-[#B3EBF2] hover:bg-[#85D1DB] transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center text-gray-900"
              aria-label="User menu"
              title="User menu"
            >
              👤
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div
                className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                style={{
                  transform: "translate(calc(-5% + 32px), 0px)",
                  minWidth: "320px",
                  right: "0px",
                }}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    Your Account
                  </div>
                  <div className="text-xs text-gray-500">
                    Manage your profile
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    // Add profile settings handler here
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="inline-block w-4 mr-2">⚙️</span>
                  Settings
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    // Add help handler here
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="inline-block w-4 mr-2">❓</span>
                  Help & Support
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="inline-block w-4 mr-2">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar - Below header */}
      <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/70 backdrop-blur-sm flex flex-col shadow-sm">
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  currentView === item.id
                    ? "bg-[#B3EBF2] text-gray-300 font-medium shadow-md"
                    : "text-gray-600 hover:bg-[#B3EBF2]/10 hover:text-[#85D1DB] hover:shadow-sm"
                }`}
              >
                {/* <span className="text-lg">{item.icon}</span> */}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Middle Column - Feed of Cards */}
          <Panel defaultSize={50} minSize={50}>
            <main className="h-full overflow-auto">
              {/* Page Header */}
              <div className="bg-gradient-to-r from-white/90 to-brand-50/90 backdrop-blur-sm border-b border-[#B3EBF2]/15 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
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
                  
                  {/* Post Button - Only show on My Days */}
                  {currentView === "my-days" && (
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#B3EBF2] hover:bg-[#85D1DB] text-gray-900 rounded-xl transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                    >
                      <span>+</span>
                      <span>Create</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">

                {/* Timeline/Feed Cards */}
                {(currentView === "my-days" ||
                  currentView === "their-days") && (
                  <Timeline
                    ref={timelineRef}
                    type={currentView}
                    onPostSelect={handlePostSelect}
                    selectedPostId={selectedPost?.post_id}
                  />
                )}

                {/* My Circle Content */}
                {currentView === "my-circle" && <MyCircle />}

                {/* Notifications Content */}
                {currentView === "notifications" && <Invitations />}
              </div>
            </main>
          </Panel>

          <PanelResizeHandle className="w-1 bg-transparent hover:bg-[#B3EBF2]/60 transition-all duration-200 cursor-col-resize" />

          {/* Right Column - Expanded Post View */}
          <Panel defaultSize={50} minSize={50}>
            <aside className="flex-1 bg-white/70 backdrop-blur-sm overflow-auto shadow-sm">
              {selectedPost ? (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Post Details
                    </h2>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-100/50 rounded-xl transition-all duration-200 transform hover:scale-105"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Expanded Post Card */}
                  <div className="bg-gradient-to-br from-brand-50/50 to-white rounded-xl p-6 mb-6 shadow-sm border border-[#B3EBF2]/20">
                    {/* Author Section */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#B3EBF2] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-gray-900 font-semibold">
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
                      <p className="text-gray-800 leading-relaxed mb-4">
                        {selectedPost.content}
                      </p>

                      {/* Photo Display */}
                      {selectedPost.photo_url && (
                        <div className="mb-4">
                          <img
                            src={selectedPost.photo_url}
                            alt="Post photo"
                            className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      
                      {/* Like Button inside post card */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {selectedPost.like_count} {selectedPost.like_count === 1 ? 'like' : 'likes'}
                        </div>
                        <button 
                          onClick={handleLikeToggle}
                          disabled={isLikeToggling}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                            selectedPost?.user_liked
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 hover:bg-[#B3EBF2]/50"
                          } ${isLikeToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className={`transition-transform duration-200 ${selectedPost?.user_liked ? "scale-110" : ""}`}>
                            {selectedPost?.user_liked ? "❤️" : "🤍"}
                          </span>
                          <span>
                            {selectedPost?.user_liked ? "Unlike" : "Like"}
                          </span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Comment Section - Always visible, directly under post */}
                  <CommentSection 
                    postId={selectedPost.post_id}
                    isVisible={true}
                  />
                </div>
              ) : (
                <div className="p-6 h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Select a post
                    </h3>
                    <p className="text-sm">
                      Click on any post in the feed to view detailed information
                      and actions here
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </Panel>
        </PanelGroup>
      </div>
      
      {/* Post Creation Modal */}
      <Modal 
        isOpen={showPostModal} 
        onClose={() => setShowPostModal(false)}
        title="Create Post"
      >
        <PostCreationForm onPostSuccess={handlePostSuccess} />
      </Modal>
    </div>
  );
}

export default App;
