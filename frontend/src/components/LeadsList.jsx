import { useEffect, useState } from "react";
import api from "../api";
import LeadForm from "./LeadForm";
import { Edit, Trash2, Search, XCircle } from 'lucide-react'; // Using lucide-react for icons

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState(null); // State to hold the lead being edited
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: ''
  });

  const fetchLeads = async (pageNum = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      // Build query parameters string
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
      });
      if (currentFilters.search) params.append('name[contains]', currentFilters.search);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.source) params.append('source', currentFilters.source);

      const res = await api.get(`/leads?${params.toString()}`);
      setLeads(res.data.data);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, []);

  // --- Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when applying new filters
    fetchLeads(1, filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { search: '', status: '', source: '' };
    setFilters(clearedFilters);
    setPage(1);
    fetchLeads(1, clearedFilters);
  };

  // --- CRUD Handlers ---
  const handleLeadAdded = (newLead) => {
    fetchLeads(page, filters); // Refetch with current filters
  };

  const handleLeadUpdated = (updatedLead) => {
    setEditingLead(null); // Exit edit mode
    setLeads(leads.map(lead => lead._id === updatedLead._id ? updatedLead : lead));
  };

  const handleDelete = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await api.delete(`/leads/${leadId}`);
        fetchLeads(page, filters); // Refetch with current filters
      } catch (error) {
        console.error("Failed to delete lead:", error);
        alert("Could not delete the lead.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <LeadForm
          onLeadAdded={handleLeadAdded}
          leadToEdit={editingLead}
          onLeadUpdated={handleLeadUpdated}
          onCancelEdit={() => setEditingLead(null)}
        />
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Leads</h2>

        {/* --- FILTER UI --- */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Name</label>
                    <input type="text" name="search" id="search" value={filters.search} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., John Doe"/>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="lost">Lost</option>
                        <option value="won">Won</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
                    <select name="source" id="source" value={filters.source} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Sources</option>
                        <option value="website">Website</option>
                        <option value="facebook_ads">Facebook Ads</option>
                        <option value="google_ads">Google Ads</option>
                        <option value="referral">Referral</option>
                        <option value="events">Events</option>
                        <option value="others">Others</option>
                    </select>
                </div>
            </div>
             <div className="flex space-x-2 mt-4">
                <button onClick={handleApplyFilters} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300"><Search size={16} className="mr-2"/>Apply Filters</button>
                <button onClick={handleClearFilters} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"><XCircle size={16} className="mr-2"/>Clear</button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Contact</th>
                <th scope="col" className="px-6 py-3">Company</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Source</th>
                <th scope="col" className="px-6 py-3">Value</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-4">Loading leads...</td></tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{`${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "N/A"}</td>
                    <td className="px-6 py-4">{lead.email || 'No Email'}<br/><span className="text-xs text-gray-500">{lead.phone}</span></td>
                    <td className="px-6 py-4">{lead.company || 'N/A'}</td>
                    <td className="px-6 py-4 capitalize">{lead.status}</td>
                    <td className="px-6 py-4">{lead.source || 'N/A'}</td>
                    <td className="px-6 py-4">${lead.lead_value || 0}</td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <button onClick={() => setEditingLead(lead)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center p-4">No leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={() => fetchLeads(page - 1, filters)} disabled={page === 1 || loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300">Previous</button>
          <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
          <button onClick={() => fetchLeads(page + 1, filters)} disabled={page === totalPages || loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300">Next</button>
        </div>
      </div>
    </div>
  );
}

