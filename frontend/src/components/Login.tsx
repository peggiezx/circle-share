import { useState } from "react";
import { loginAndStoreToken } from "../services/api";

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function Login({
  onLoginSuccess,
  onSwitchToRegister,
}: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!email.includes("@") || !email.includes(".")) {
      return "Enter a valid email like name@example.com";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Handle field validation on blur
  const handleEmailBlur = () => {
    const emailError = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: emailError, general: "" }));
  };

  const handlePasswordBlur = () => {
    const passwordError = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: passwordError, general: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields first
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await loginAndStoreToken(email, password);
      onLoginSuccess();
    } catch (err) {
      const errorMessage = (err as Error).message;

      if (errorMessage === "Invalid password") {
        setErrors({ general: "Incorrect password. Please try again." });
      } else if (
        errorMessage.includes("User not found") ||
        errorMessage.includes("not found")
      ) {
        setErrors({
          general: "Account not found. Check your email or create an account.",
        });
        onLoginError?.();
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#B3EBF2] rounded-full mb-4 shadow-sm">
            <span className="text-2xl font-bold text-gray-800">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
            CircleShare
          </h1>
          <p className="text-gray-600 font-sans">
            Log into CircleShare
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
          {/* General Error Message */}
          {errors.general && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-2 font-sans"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-200 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed font-sans ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-stone-300 focus:border-[#85D1DB] focus:ring-4 focus:ring-[#B3EBF2]/20"
                }`}
                disabled={loading}
                aria-describedby={errors.email ? "email-error" : "email-help"}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-red-600 flex items-center"
                  role="alert"
                >
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
              {!errors.email && (
                <p id="email-help" className="mt-2 text-sm text-gray-500">
                  Use your work or personal email
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800 mb-2 font-sans"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-base transition-all duration-200 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#85D1DB] focus:ring-4 focus:ring-[#B3EBF2]/30"
                  }`}
                  disabled={loading}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />

                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-red-600 flex items-center"
                  role="alert"
                >
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}

              {/* Forgot Password Link */}
              <div className="mt-3 text-right">
                <button
                  type="button"
                  className="text-sm text-[#85D1DB] hover:text-[#B6F2D1] font-medium focus:outline-none focus:underline transition-colors"
                  onClick={() =>
                    alert("Forgot password functionality coming soon!")
                  }
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-[#B3EBF2] text-gray-900 py-3.5 px-6 rounded-xl text-base font-semibold hover:bg-[#85D1DB] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#B3EBF2]/30 min-h-[52px] flex items-center justify-center shadow-sm hover:shadow-md font-sans"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 font-sans">
              New to CircleShare?{" "}
              <button
                className="text-[#85D1DB] hover:text-[#B6F2D1] font-semibold focus:outline-none focus:underline transition-colors"
                onClick={onSwitchToRegister}
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Trust & Privacy */}
          {/* <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>We never share or post without your permission.</span>
            </div>
            <div className="mt-2 text-center">
              <button className="text-xs text-[#85D1DB] hover:text-[#B6F2D1] focus:outline-none focus:underline">
                Privacy Policy
              </button>
              {" • "}
              <button className="text-xs text-[#85D1DB] hover:text-[#B6F2D1] focus:outline-none focus:underline">
                Terms of Service
              </button>
            </div>
          </div> */}
        </div>

        {/* Demo Helper - Remove in production
        <div className="mt-6 p-4 bg-stone-100 rounded-xl border border-stone-200">
          <p className="text-sm text-gray-700 font-medium mb-2 font-sans">
            ✨ Demo Tips:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 font-sans">
            <li>• Use any valid email format</li>
            <li>• Password must be 6+ characters</li>
            <li>• Test validation by leaving fields empty</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
