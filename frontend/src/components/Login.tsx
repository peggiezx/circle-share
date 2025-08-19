import { useState } from "react";
import { loginAndStoreToken } from "../services/api";

interface LoginProps {
  onLoginSuccess: () => void;
  onLoginError?:() => void;
}

export function Login({onLoginSuccess, onLoginError}: LoginProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginAndStoreToken(email, password);
            onLoginSuccess();
        } catch (err) {
            const errorMessage = (err as Error).message;

            if (errorMessage === "USER_NOT_FOUND") {
                setError("Account not found");
                onLoginError?.();
            } else if (errorMessage === "INVALID_CREDENTIALS") {
                setError("Invalid password");
            } else {
                setError("Login failed");
            }
        }
        setLoading(false);
    };


    return (
    <form onSubmit={handleSubmit}>
        {loading && <p>Logining</p>}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>

        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>

        <button type="submit">Login</button>

        {error && <p>Error: {error} </p>}

    </form>
    );
}
