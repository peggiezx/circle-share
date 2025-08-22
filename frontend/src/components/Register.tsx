import { useState } from "react";
import { registerUser } from "../services/api";

interface RegisterProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

export function Register({onRegisterSuccess, onSwitchToLogin}: RegisterProps) {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<{name?: string, email?: string, password?: string, general?: string | React.ReactNode;}>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] =useState<boolean>(false);
    const [hasTyped, setHasTyped] = useState({name: false, email: false, password: false})
  
    // detect input
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (!hasTyped.name && e.target.value.length > 0) {
            setHasTyped((prev) => ({ ...prev, name: true }));
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (!hasTyped.email && e.target.value.length > 0) {
            setHasTyped(prev => ({...prev, email: true}));
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if(!hasTyped.password && e.target.value.length > 0) {
            setHasTyped(prev => ({...prev, password: true}));
        }
    }

    const validateName = (name: string) => {
        if (!name) return "Your name is required"
        return undefined
    }

    const validateEmail = (email: string) => {
        if (!email) return "Email is required";
        if (!email.includes('@') || !email.includes('.')) {
            return 'Enter a valid email like name@example.com'
        }
        return undefined
    }

    const validatePassword = (password: string) => {
        // const passwordRegex: RegExp =
        //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?]).{8,}$/;
        if (password.length < 8) return "Password must be at least 8 characters"
        // if (!passwordRegex.test(password)) return "Password must contain at least a uppercase, a lowercase, a digit, and a special symbol"
        return undefined
    }

    const handleNameBlur = () => {
        if (hasTyped.name) {
            const nameError = validateName(name);
            setErrors((prev) => ({
              ...prev,
              name: nameError || undefined,
              general: undefined,
            }));
        }
    }

    const handleEmailBlur = () => {
        if (hasTyped.email) {
            const emailError = validateEmail(email);
            setErrors((prev) => ({
            ...prev,
            email: emailError || undefined,
            general: undefined,
            }));
        }
    };

    const handlePasswordBlur = () => {
        if (hasTyped.password) {
            const passwordError = validatePassword(password);
            setErrors((prev) => ({
            ...prev,
            password: passwordError || undefined,
            general: undefined,
            }));
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

    
        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
    
        if (nameError || emailError || passwordError) {
            setErrors({ name: nameError, email: emailError, password: passwordError });
            return;
        }
        setLoading(true);
        setErrors({});

        try {
        await registerUser(name, email, password);
        onRegisterSuccess();
        } catch (err) {
        const errorMessage = (err as Error).message;
        console.log("Error message: ", errorMessage)
        if (
          errorMessage === "Email already registered" ||
          errorMessage.includes("already")
        ) {
          setErrors({
            general: (
              <span>
                This email is already registered. Please{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-[#85D1DB] hover:text-[#B6F2D1] font-semibold underline focus:outline-none"
                >
                  log in
                </button>{" "}
                .
              </span>
            ),
          });
        } else if (
            errorMessage.includes("password")
        ) {
            setErrors({
                general: "Your password is too simple. Please use letters, digits, and special symbols."
            })

        } else {
          setErrors({
            general: "Registration failed. Please try again.",
          });
        }
        } finally {
        setLoading(false);
    }};
    
  

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo + Brand */}

          <div className="text-center mb-8 ">
            <div className="mb-2">
              <img
                src="/logo.svg"
                alt="CircleShare Logo"
                className="object-contain mx-auto drop-shadow-sm"
                style={{ width: "180px", height: "auto" }}
              />
            </div>
            {/* <p className="text-gray-600 font-sans">Log into CircleShare</p> */}
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
            <div className="text-center mb-8">
              <p className="text-gray-700 font-sans font-bold text-2xl">
                Create a new account
              </p>
            </div>
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
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-800 mb-2 font-sans"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur} // Add this
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-200 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed font-sans ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-stone-300 focus:border-[#85D1DB] focus:ring-4 focus:ring-[#B3EBF2]/20"
                  }`}
                  disabled={loading}
                  aria-describedby={errors.name ? "name-error" : "name-help"}
                />

                {errors.name && (
                  <p
                    id="name-error"
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
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-800 mb-2 font-sans"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur} // Add this
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
                    autoComplete="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-200 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed font-sans ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-stone-300 focus:border-[#85D1DB] focus:ring-4 focus:ring-[#B3EBF2]/20"
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
              </div>

              {/* Submit button */}

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
                    Registering...
                  </>
                ) : (
                  "Join CircleShare"
                )}
              </button>

              <div className="mt-8 text-center">
                <p className="text-gray-600 font-sans">
                  Already have an account?{" "}
                  <button
                    className="text-[#85D1DB] hover:text-[#B6F2D1] font-semibold focus:outline-none focus:underline transition-colors"
                    onClick={onSwitchToLogin}
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

