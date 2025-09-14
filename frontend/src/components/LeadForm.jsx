import { useState, useEffect } from "react";
import api from "../api";

export default function LeadForm({
  onLeadAdded,
  leadToEdit,
  onLeadUpdated,
  onCancelEdit,
}) {
  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    status: "new",
    source: "website", // Default source
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = Boolean(leadToEdit);

  // When 'leadToEdit' prop changes, populate the form for editing
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        first_name: leadToEdit.first_name || "",
        last_name: leadToEdit.last_name || "",
        email: leadToEdit.email || "",
        phone: leadToEdit.phone || "",
        status: leadToEdit.status || "new",
        source: leadToEdit.source || "website",
      });
    } else {
      // If not in edit mode (e.g., after an edit is cancelled), reset the form
      setFormData(initialFormData);
    }
  }, [leadToEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        // --- UPDATE (PUT request) ---
        const res = await api.put(`/leads/${leadToEdit._id}`, formData);
        if (onLeadUpdated) onLeadUpdated(res.data);
      } else {
        // --- CREATE (POST request) ---
        const res = await api.post("/leads", formData);
        if (onLeadAdded) onLeadAdded(res.data);
        setFormData(initialFormData); // Reset form after creation
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} lead.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded-xl shadow-lg sticky top-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {isEditMode ? "Edit Lead" : "Add New Lead"}
      </h2>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      {/* Input fields remain largely the same, just controlled by the updated state logic */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input
          type="text" id="first_name" name="first_name" value={formData.first_name}
          onChange={handleChange} placeholder="John"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required
        />
      </div>
       <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          type="text" id="last_name" name="last_name" value={formData.last_name}
          onChange={handleChange} placeholder="Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email" id="email" name="email" value={formData.email}
          onChange={handleChange} placeholder="name@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="text" id="phone" name="phone" value={formData.phone}
          onChange={handleChange} placeholder="Phone No."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status" name="status" value={formData.status} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="lost">Lost</option>
          <option value="won">Won</option>
        </select>
      </div>
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
        <select
          id="source" name="source" value={formData.source} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="website">Website</option>
          <option value="google_ads">Google Ads</option>
          <option value="facebook_ads">Facebook Ads</option>
          <option value="events">Events</option>
          <option value="referral">Referral</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : (isEditMode ? "Update Lead" : "Add Lead")}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 font-semibold rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
