import { useState, useEffect } from "react";
import api from "./api";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import LeadsList from "./components/LeadsList";

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
      
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showRegister ? (
            <Register onRegister={() => setShowRegister(false)} />
          ) : (
            <Login onLogin={setUser} />
          )}
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="w-full mt-4 text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {showRegister
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={() => setUser(null)} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <LeadsList />
      </main>
    </div>
  );
}

export default App;