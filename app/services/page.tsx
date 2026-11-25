
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QuickBookSidebar from "@/app/components/QuickBookSidebar";

type Service = {
  _id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
  description: string;
};

type ServiceForm = {
  name: string;
  category: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
  description: string;
};

const emptyForm: ServiceForm = {
  name: "",
  category: "Healthcare",
  duration: 30,
  price: 500,
  status: "Active",
  description: "",
};

const categories = [
  "Healthcare",
  "Beauty",
  "Fitness",
  "Consulting",
  "Other",
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [error, setError] = useState("");

  // Fetch services from MongoDB
  const fetchServices = useCallback(async () => {
    try {
      setApiError("");

      const response = await fetch("/api/services", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch services");
      }

      setServices(result.data);
    } catch (err) {
      console.error("Fetch Services Error:", err);

      setApiError(
        err instanceof Error
          ? err.message
          : "Unable to load services"
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Search and filters
  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);

      const matchesStatus =
        filter === "All" || service.status === filter;

      const matchesCategory =
        categoryFilter === "All" ||
        service.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [services, search, filter, categoryFilter]);

  // Statistics
  const activeCount = services.filter(
    (service) => service.status === "Active"
  ).length;

  const inactiveCount = services.length - activeCount;

  const averagePrice = services.length
    ? Math.round(
        services.reduce((sum, service) => sum + service.price, 0) /
          services.length
      )
    : 0;

  // Add service modal
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // Edit service modal
  const openEdit = (service: Service) => {
    setEditingId(service._id);

    setForm({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      status: service.status,
      description: service.description || "",
    });

    setError("");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // Create / Update service
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Please enter a service name.");
      return;
    }

    const duplicate = services.some(
      (service) =>
        service.name.toLowerCase() === name.toLowerCase() &&
        service._id !== editingId
    );

    if (duplicate) {
      setError("A service with this name already exists.");
      return;
    }

    if (
      !Number.isFinite(form.price) ||
      !Number.isFinite(form.duration) ||
      form.price < 0 ||
      form.duration < 5
    ) {
      setError("Enter a valid price and duration.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        name,
        description: form.description.trim(),
      };

      const response = await fetch(
        editingId
          ? `/api/services/${editingId}`
          : "/api/services",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save service"
        );
      }

      await fetchServices();
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Save Service Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const deleteService = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setApiError("");

      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete service"
        );
      }

      await fetchServices();
    } catch (err) {
      console.error("Delete Service Error:", err);

      setApiError(
        err instanceof Error
          ? err.message
          : "Unable to delete service"
      );
    }
  };

  // Activate / Deactivate service
  const toggleStatus = async (id: string) => {
    const service = services.find(
      (item) => item._id === id
    );

    if (!service) return;

    const updatedStatus =
      service.status === "Active" ? "Inactive" : "Active";

    try {
      setApiError("");

      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: updatedStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update service status"
        );
      }

      await fetchServices();
    } catch (err) {
      console.error("Toggle Service Error:", err);

      setApiError(
        err instanceof Error
          ? err.message
          : "Unable to update service status"
      );
    }
  };

  return (
    <div className="qb-app-shell">
      <QuickBookSidebar active="services" />

      <main className="qb-modern-page">

        {/* Header */}
        <div className="qb-modern-header">
          <div>
            <span className="qb-eyebrow">
              <i className="bi bi-grid-fill"></i>
              MANAGEMENT
            </span>

            <h1>
              Services <span>Management</span>
            </h1>

            <p>
              Manage your service catalogue, pricing and availability.
            </p>
          </div>

          <button
            type="button"
            className="qb-modern-primary"
            onClick={openAdd}
            disabled={!loaded}
          >
            <i className="bi bi-plus-lg"></i>
            Add New Service
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="qb-modern-error mb-3">
            <i className="bi bi-exclamation-circle"></i>
            {apiError}

            <button
              type="button"
              className="ms-2"
              onClick={fetchServices}
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="qb-modern-stats">

          <div className="qb-modern-stat">
            <div className="qb-stat-icon purple">
              <i className="bi bi-grid"></i>
            </div>

            <div>
              <span>Total Services</span>
              <strong>{services.length}</strong>
              <small>All listed services</small>
            </div>
          </div>

          <div className="qb-modern-stat">
            <div className="qb-stat-icon green">
              <i className="bi bi-check-circle"></i>
            </div>

            <div>
              <span>Active Services</span>
              <strong>{activeCount}</strong>
              <small>Currently available</small>
            </div>
          </div>

          <div className="qb-modern-stat">
            <div className="qb-stat-icon orange">
              <i className="bi bi-pause-circle"></i>
            </div>

            <div>
              <span>Inactive Services</span>
              <strong>{inactiveCount}</strong>
              <small>Currently unavailable</small>
            </div>
          </div>

          <div className="qb-modern-stat">
            <div className="qb-stat-icon blue">
              <i className="bi bi-currency-rupee"></i>
            </div>

            <div>
              <span>Average Price</span>
              <strong>
                ₹{averagePrice.toLocaleString("en-IN")}
              </strong>
              <small>Per service</small>
            </div>
          </div>

        </div>

        {/* Services Panel */}
        <section className="qb-modern-panel">

          <div className="qb-modern-toolbar">
            <div>
              <h2>All Services</h2>
              <p>
                Explore and manage your complete service catalogue.
              </p>
            </div>

            <div className="qb-modern-controls">

              <div className="qb-modern-search">
                <i className="bi bi-search"></i>

                <input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {/* Service Cards */}
          <div className="qb-modern-service-grid">

            {!loaded && (
              <div className="qb-modern-empty">
                <i className="bi bi-arrow-repeat"></i>
                <h3>Loading services...</h3>
                <p>Fetching services from MongoDB.</p>
              </div>
            )}

            {loaded && !apiError && filteredServices.map((service) => (
              <article
                className="qb-modern-service-card"
                key={service._id}
              >
                <div className="qb-service-card-top">
                  <div className="qb-service-symbol">
                    <i className="bi bi-layers"></i>
                  </div>

                  <span
                    className={`qb-modern-status ${service.status.toLowerCase()}`}
                  >
                    <span></span>
                    {service.status}
                  </span>
                </div>

                <div className="qb-service-card-body">
                  <span className="qb-service-category">
                    {service.category}
                  </span>

                  <h3>{service.name}</h3>

                  <p>
                    {service.description || "No description added."}
                  </p>
                </div>

                <div className="qb-service-meta">
                  <div>
                    <span>Price</span>
                    <strong>
                      ₹{service.price.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      <i className="bi bi-clock"></i>{" "}
                      {service.duration} min
                    </strong>
                  </div>
                </div>

                <div className="qb-service-card-actions">

                  <button
                    type="button"
                    onClick={() => openEdit(service)}
                  >
                    <i className="bi bi-pencil"></i> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus(service._id)}
                  >
                    <i className="bi bi-arrow-left-right"></i>{" "}
                    {service.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteService(service._id)}
                    aria-label="Delete service"
                    title="Delete service"
                  >
                    <i className="bi bi-trash3"></i>
                  </button>

                </div>
              </article>
            ))}

            {/* Empty State */}
            {loaded &&
              !apiError &&
              filteredServices.length === 0 && (
                <div className="qb-modern-empty">
                  <i className="bi bi-grid"></i>

                  <h3>No services found</h3>

                  <p>
                    Try another search or add a new service.
                  </p>

                  <button
                    type="button"
                    className="qb-modern-primary"
                    onClick={openAdd}
                  >
                    <i className="bi bi-plus-lg"></i>
                    Add Service
                  </button>
                </div>
              )}

          </div>

          <div className="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small className="text-secondary">
              Showing {filteredServices.length} of {services.length} services
            </small>

            <button
              type="button"
              className="qb-modern-secondary"
              onClick={() => {
                setSearch("");
                setFilter("All");
                setCategoryFilter("All");
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>{" "}
              Reset Filters
            </button>
          </div>

        </section>

        {/* Add / Edit Modal */}
        {showModal && (
          <div
            className="qb-modern-overlay"
            onClick={closeModal}
          >
            <div
              className="qb-modern-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="qb-modern-modal-head">

                <div className="qb-modal-heading-icon">
                  <i className="bi bi-briefcase"></i>
                </div>

                <div>
                  <h2>
                    {editingId ? "Edit Service" : "Create New Service"}
                  </h2>

                  <p>
                    Enter your service details below.
                  </p>
                </div>

                <button
                  type="button"
                  className="qb-modal-x"
                  onClick={closeModal}
                  aria-label="Close modal"
                  disabled={saving}
                >
                  <i className="bi bi-x-lg"></i>
                </button>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="qb-modern-form-grid">

                  <div className="full">
                    <label>Service Name *</label>

                    <input
                      required
                      maxLength={80}
                      placeholder="e.g. General Consultation"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>Category *</label>

                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Status</label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as Service["status"],
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label>Price (₹) *</label>

                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      required
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>Duration (minutes) *</label>

                    <input
                      type="number"
                      min="5"
                      max="1440"
                      required
                      value={form.duration}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          duration: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="full">
                    <label>Description</label>

                    <textarea
                      rows={3}
                      maxLength={300}
                      placeholder="Describe your service..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                </div>

                {error && (
                  <div className="qb-modern-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                <div className="qb-modern-modal-actions">

                  <button
                    type="button"
                    className="qb-modern-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="qb-modern-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2"></i>
                        {editingId ? "Save Changes" : "Create Service"}
                      </>
                    )}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
