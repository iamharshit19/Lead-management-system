import { useState } from "react";
import api from "../api";

export default function Register({ onRegister }) {
  const[name, setName]= useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      alert("Registration successful! Please sign in.");
      onRegister();
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-900">
        Create an account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
         <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}