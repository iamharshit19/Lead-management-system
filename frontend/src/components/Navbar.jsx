import api from "../api";

export default function Navbar({ user, onLogout }) {
  const handleLogout = async () => {
    await api.post("/auth/logout");
    onLogout();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-indigo-600">Lead Manager</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-gray-500">Not logged in</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}