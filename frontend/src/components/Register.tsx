import { useState } from "react";
import { registerUser } from "../services/api";

interface RegisterProps {
    onRegisterSuccess: () => void;
}

export function Register({onRegisterSuccess}: RegisterProps) {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerUser(name, email, password);
            onRegisterSuccess();
        } catch (err) {
            setError("Registration failed");
        }
        setLoading(false);
    };

    return (
      <form onSubmit={handleSubmit}>
        {loading && <p>Registering User</p>}
        <div>
          <input
            type="name"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Register</button>
        {error && <p>Error: {error}</p>}
      </form>
    );
};

