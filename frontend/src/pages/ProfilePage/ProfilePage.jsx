import { useEffect, useState } from "react";
import { getCustomerById } from "../../services/customerService";

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCustomerById();
        const result = response.data;
        console.log("Fetched customer data:", result);
        setData(result);
        setForm(JSON.parse(JSON.stringify(result))); // Deep clone để tránh lỗi tham chiếu state
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen text-slate-500 font-medium animate-pulse">
      Loading profile data...
    </div>
  );

  // Sửa lỗi ghi đè dữ liệu phức tạp của Object lồng nhau
  const handleNestedChange = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    console.log("Dữ liệu gửi lên Backend:", form);
    setData(form);
    setEditMode(false);
    // Gọi API update dữ liệu ở đây (ví dụ: updateCustomer(form))
  };

  const handleCancel = () => {
    setForm(JSON.parse(JSON.stringify(data))); // Reset form về dữ liệu cũ
    setEditMode(false);
  };

  return (
    
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden transition-all">
        
        {/* Banner trang trí phía trên */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        {/* Thân Card */}
        <div className="p-6 relative pt-0">
          
          {/* Avatar & Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-6 pb-6 border-b border-slate-100">
            <div className="w-24 h-24 bg-slate-200 border-4 border-white rounded-full shadow-md flex items-center justify-center text-slate-400 font-bold text-2xl">
              {form.profileCard?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="text-center sm:text-left flex-1">
              {editMode ? (
                <div className="space-y-2 mt-2 w-full max-w-sm">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Display Name</label>
                  <input
                    value={form.profileCard?.displayName || ""}
                    onChange={(e) => handleNestedChange("profileCard", "displayName", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-slate-800">
                  {data.profileCard?.displayName}
                </h2>
              )}

              {editMode ? (
                <div className="space-y-2 mt-3 w-full max-w-xs">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Age</label>
                  <input
                    type="number"
                    value={form.profileCard?.age || ""}
                    onChange={(e) => handleNestedChange("profileCard", "age", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <p className="text-slate-500 mt-1">Age: <span className="font-medium text-slate-700">{data.profileCard?.age}</span></p>
              )}
            </div>
          </div>

          {/* Khối Địa chỉ (Location) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3>Current Location</h3>
            </div>

            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                  <input
                    value={form.currentLocation?.address || ""}
                    onChange={(e) => handleNestedChange("currentLocation", "address", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Street Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ward</label>
                  <input
                    value={form.currentLocation?.ward || ""}
                    onChange={(e) => handleNestedChange("currentLocation", "ward", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ward"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">District</label>
                  <input
                    value={form.currentLocation?.district || ""}
                    onChange={(e) => handleNestedChange("currentLocation", "district", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="District"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
                  <input
                    value={form.currentLocation?.city || ""}
                    onChange={(e) => handleNestedChange("currentLocation", "city", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
                  <input
                    value={form.currentLocation?.country || ""}
                    onChange={(e) => handleNestedChange("currentLocation", "country", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Country"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-600 space-y-2 text-sm sm:text-base">
                <p className="font-medium text-slate-800">{data.currentLocation?.address || "No address provided"}</p>
                <p className="text-slate-500">
                  {data.currentLocation?.ward && `${data.currentLocation.ward}, `} 
                  {data.currentLocation?.district && `${data.currentLocation.district}`}
                </p>
                <p className="text-slate-500">{data.currentLocation?.city}</p>
                <p className="inline-block px-2 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md uppercase tracking-wider">{data.currentLocation?.country}</p>
              </div>
            )}
          </div>

          {/* Thanh tương tác nút bấm */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}