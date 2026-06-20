import { useState } from "react";

export default function EditProfilePage({ data, onSave, onCancel }) {
  const [form, setForm] = useState({
    displayName: data?.profileCard?.displayName || "",
    age: data?.profileCard?.age || "",
    address: data?.currentLocation?.address || "",
    ward: data?.currentLocation?.ward || "",
    district: data?.currentLocation?.district || "",
    city: data?.currentLocation?.city || "",
    country: data?.currentLocation?.country || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Chống reload trang bất ngờ
    onSave(form);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Edit Profile Information</h2>
          <p className="text-sm text-slate-500 mt-1">Update your account detail profile card and location address.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* PHẦN THÔNG TIN CÁ NHÂN */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Profile Card</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="25"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* PHẦN ĐỊA CHỈ */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Location Address</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Nguyen Hue Street"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
                  <input
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    placeholder="Ben Nghe Ward"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="District 1"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City / Province</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ho Chi Minh City"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Vietnam"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* HÀNH ĐỘNG BUTTONS */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}