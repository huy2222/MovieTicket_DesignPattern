import { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {
  createAdminCinema,
  deleteAdminCinema,
  getAdminCinemas,
  updateAdminCinema,
} from "../../services/cinemaAdminService";
import "./AdminCinemaPage.css";

const emptyForm = {
  name: "",
  phoneNumber: "",
  area: "",
  address: "",
  status: "ACTIVE",
};

export default function AdminCinemaPage() {
  const [cinemas, setCinemas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminCinemas();
      setCinemas(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load cinemas from server.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCinemas = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return cinemas;
    }

    return cinemas.filter((cinema) =>
      [cinema.name, cinema.area, cinema.address, cinema.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [cinemas, query]);

  const activeCount = cinemas.filter((cinema) => cinema.status === "ACTIVE").length;
  const maintenanceCount = cinemas.filter((cinema) => cinema.status === "MAINTENANCE").length;
  const closedCount = cinemas.filter((cinema) => cinema.status === "CLOSED").length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        const response = await updateAdminCinema(editingId, form);
        setCinemas((current) =>
          current.map((cinema) => (cinema.id === editingId ? response.data : cinema))
        );
      } else {
        const response = await createAdminCinema(form);
        setCinemas((current) => [...current, response.data]);
      }

      handleReset();
    } catch (err) {
      console.error(err);
      setError("Unable to save cinema. Please check the backend server.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cinema) => {
    setEditingId(cinema.id);
    setForm({
      name: cinema.name,
      phoneNumber: cinema.phoneNumber,
      area: cinema.area,
      address: cinema.address,
      status: cinema.status,
    });
  };

  const handleDelete = async (cinemaId) => {
    try {
      setError("");
      await deleteAdminCinema(cinemaId);
      setCinemas((current) => current.filter((cinema) => cinema.id !== cinemaId));

      if (editingId === cinemaId) {
        handleReset();
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete cinema. Please try again.");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="admin-cinema-page">
      <Header />

      <main className="admin-cinema-main">
        <section className="admin-cinema-hero">
          <div>
            <span className="admin-eyebrow">Admin Workspace</span>
            <h1>Cinema Management</h1>
          </div>

          <div className="admin-stat-row">
            <div className="admin-stat">
              <span>{cinemas.length}</span>
              <p>Total</p>
            </div>
            <div className="admin-stat">
              <span>{activeCount}</span>
              <p>Active</p>
            </div>
            <div className="admin-stat">
              <span>{maintenanceCount}</span>
              <p>Maintenance</p>
            </div>
            <div className="admin-stat">
              <span>{closedCount}</span>
              <p>Closed</p>
            </div>
          </div>
        </section>

        <section className="admin-cinema-workspace">
          <form className="cinema-form-panel" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <h2>{editingId ? "Edit Cinema" : "Add Cinema"}</h2>
              {editingId && (
                <button type="button" className="ghost-action" onClick={handleReset}>
                  Cancel
                </button>
              )}
            </div>

            <label>
              Cinema name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="CineMax Central"
                required
              />
            </label>

            <label>
              Phone number
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="028 0000 0000"
                required
              />
            </label>

            <label>
              Area
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="District 1"
                required
              />
            </label>

            <label>
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, ward, district"
                required
              />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>

            {error && <div className="admin-error">{error}</div>}

            <button className="primary-action" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Cinema"}
            </button>
          </form>

          <div className="cinema-list-panel">
            <div className="list-toolbar">
              <h2>Cinemas</h2>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
              />
            </div>

            <div className="cinema-table">
              <div className="cinema-table-head">
                <span>Name</span>
                <span>Area</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {loading && <div className="empty-state">Loading cinemas...</div>}

              {!loading && filteredCinemas.map((cinema) => (
                <div className="cinema-table-row" key={cinema.id}>
                  <div>
                    <strong>{cinema.name}</strong>
                    <small>{cinema.address}</small>
                    <small>{cinema.phoneNumber}</small>
                  </div>
                  <span>{cinema.area}</span>
                  <span className={`status-pill status-${cinema.status.toLowerCase()}`}>
                    {cinema.status}
                  </span>
                  <div className="row-actions">
                    <button type="button" onClick={() => handleEdit(cinema)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(cinema.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {!loading && filteredCinemas.length === 0 && (
                <div className="empty-state">No cinema found</div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
