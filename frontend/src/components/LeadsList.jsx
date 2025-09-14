import { useEffect, useState } from "react";
import api from "../api";
import LeadForm from "./LeadForm";

export default function LeadsList() {
  const [leads, setLeads] =useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/leads?page=${pageNum}&limit=10`);
      setLeads(res.data.leads);
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

  const handleLeadAdded = (newLead) => {
   
    fetchLeads(page);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <LeadForm onLeadAdded={handleLeadAdded} />
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center p-4">Loading leads...</td></tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"> {`${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "N/A"}</td>
                    <td className="px-6 py-4">{lead.email}</td>
                    <td className="px-6 py-4">{lead.status}</td>
                    <td className="px-6 py-4">{lead.source || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center p-4">No leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => fetchLeads(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchLeads(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}