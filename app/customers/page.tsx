
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import QuickBookSidebar from "@/app/components/QuickBookSidebar";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

type Booking = {
  _id?: string;
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: string;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");

  // Fetch customers and bookings from MongoDB APIs
  const fetchData = async () => {
    try {
      setPageError("");

      const [customerResponse, bookingResponse] = await Promise.all([
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/bookings", { cache: "no-store" }),
      ]);

      const customerResult = await customerResponse.json();
      const bookingResult = await bookingResponse.json();

      if (!customerResponse.ok) {
        throw new Error(
          customerResult.message || "Unable to fetch customers."
        );
      }

      if (!bookingResponse.ok) {
        throw new Error(
          bookingResult.message || "Unable to fetch bookings."
        );
      }

      const customerData: Customer[] = Array.isArray(customerResult)
        ? customerResult
        : customerResult.data || [];

      const bookingData: Booking[] = Array.isArray(bookingResult)
        ? bookingResult
        : bookingResult.data || [];

      setCustomers(customerData);
      setBookings(bookingData);

      // Automatically register customers who booked an appointment
      const existingEmails = new Set(
        customerData.map((customer) => customer.email.trim().toLowerCase())
      );

      const missingCustomers = new Map<string, CustomerForm>();

      bookingData.forEach((booking) => {
        const email = booking.email?.trim().toLowerCase();

        if (!email || existingEmails.has(email)) return;

        if (!missingCustomers.has(email)) {
          missingCustomers.set(email, {
            name: booking.name?.trim() || "New Customer",
            email,
            phone: "",
            address: "",
          });
        }
      });

      if (missingCustomers.size > 0) {
        await Promise.all(
          Array.from(missingCustomers.values()).map(async (customer) => {
            const response = await fetch("/api/customers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(customer),
            });

            // A duplicate email may already have been registered elsewhere.
            if (!response.ok && response.status !== 409) {
              const result = await response.json().catch(() => ({}));
              console.error(
                "Unable to register booking customer:",
                result.message || response.statusText
              );
            }
          })
        );

        // Refresh customers after automatic registration
        const refreshedResponse = await fetch("/api/customers", {
          cache: "no-store",
        });

        const refreshedResult = await refreshedResponse.json();

        if (refreshedResponse.ok) {
          setCustomers(
            Array.isArray(refreshedResult)
              ? refreshedResult
              : refreshedResult.data || []
          );
        }
      }
    } catch (err) {
      console.error("Unable to load customer data:", err);
      setPageError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search customers
  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [customers, search]);

  // Customer booking count
  const getBookingCount = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    return bookings.filter(
      (booking) =>
        booking.email?.trim().toLowerCase() === normalizedEmail
    ).length;
  };

  // New customers this month
  const newThisMonth = customers.filter((customer) => {
    if (!customer.createdAt) return false;

    const date = new Date(customer.createdAt);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  // Returning customers
  const returningCustomers = customers.filter(
    (customer) => getBookingCount(customer.email) > 1
  ).length;

  // Open add modal
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (customer: Customer) => {
    setEditingId(customer._id);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setError("");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // Create or update customer
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) {
      setError("Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const duplicate = customers.some(
      (customer) =>
        customer.email.trim().toLowerCase() === email &&
        customer._id !== editingId
    );

    if (duplicate) {
      setError("A customer with this email already exists.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        email,
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      const response = await fetch(
        editingId
          ? `/api/customers/${editingId}`
          : "/api/customers",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save customer."
        );
      }

      await fetchData();
      closeModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete customer.");
      }

      setCustomers((previous) =>
        previous.filter((customer) => customer._id !== id)
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to delete customer."
      );
    }
  };

  if (!loaded) {
    return (
      <div className="qb-app-shell">
        <main className="qb-modern-page">
          <p>Loading customers...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="qb-app-shell">
      <QuickBookSidebar active="customers" />

      <main className="qb-modern-page">
        {/* Header */}
        <div className="qb-modern-header">
          <div>
            <span className="qb-eyebrow">
              <i className="bi bi-people-fill"></i>
              CUSTOMER RELATIONSHIPS
            </span>

            <h1>
              Customers <span>Management</span>
            </h1>

            <p>
              Build stronger relationships and manage your customer
              database.
            </p>
          </div>

          <button
            type="button"
            className="qb-modern-primary"
            onClick={openAddModal}
          >
            <i className="bi bi-person-plus-fill"></i>
            Add Customer
          </button>
        </div>

        {pageError && (
          <div className="qb-modern-error" role="alert">
            <i className="bi bi-exclamation-circle"></i>
            {pageError}
            <button
              type="button"
              className="qb-modern-secondary"
              onClick={() => {
                setLoaded(false);
                fetchData();
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="qb-modern-stats">
          <div className="qb-modern-stat">
            <div className="qb-stat-icon purple">
              <i className="bi bi-people"></i>
            </div>
            <div>
              <span>Total Customers</span>
              <strong>{customers.length}</strong>
              <small>Registered customers</small>
            </div>
          </div>

          <div className="qb-modern-stat">
            <div className="qb-stat-icon green">
              <i className="bi bi-calendar-check"></i>
            </div>
            <div>
              <span>Total Bookings</span>
              <strong>{bookings.length}</strong>
              <small>All appointments</small>
            </div>
          </div>

          <div className="qb-modern-stat">
            <div className="qb-stat-icon orange">
              <i className="bi bi-person-plus"></i>
            </div>
            <div>
              <span>New Customers</span>
              <strong>{newThisMonth}</strong>
              <small>Joined this month</small>
            </div>
          </div>

          <div className="qb-modern-stat">
            <div className="qb-stat-icon blue">
              <i className="bi bi-person-check"></i>
            </div>
            <div>
              <span>Returning Customers</span>
              <strong>{returningCustomers}</strong>
              <small>More than one booking</small>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <section className="qb-modern-panel">
          <div className="qb-modern-toolbar">
            <div>
              <h2>All Customers</h2>
              <p>
                View customer profiles and their appointment activity.
              </p>
            </div>

            <div className="qb-modern-controls">
              <div className="qb-modern-search">
                <i className="bi bi-search"></i>
                <input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table qb-modern-table align-middle">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>PHONE</th>
                  <th>LOCATION</th>
                  <th>BOOKINGS</th>
                  <th>JOINED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className="qb-customer-cell">
                        <div className="qb-customer-avatar">
                          {customer.name
                            .trim()
                            .split(/\s+/)
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{customer.phone || "—"}</td>
                    <td>{customer.address || "—"}</td>

                    <td>
                      <span className="qb-booking-pill">
                        {getBookingCount(customer.email)}
                      </span>
                    </td>

                    <td>
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>

                    <td>
                      <div className="qb-customer-actions">
                        <button
                          type="button"
                          title="Edit customer"
                          aria-label={`Edit ${customer.name}`}
                          onClick={() => openEditModal(customer)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        <button
                          type="button"
                          title="Delete customer"
                          aria-label={`Delete ${customer.name}`}
                          className="danger"
                          onClick={() => deleteCustomer(customer._id)}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="qb-modern-empty">
                        <i className="bi bi-people"></i>
                        <h3>No customers found</h3>
                        <p>
                          Try another search or add a new customer.
                        </p>
                        <button
                          type="button"
                          className="qb-modern-primary"
                          onClick={openAddModal}
                        >
                          Add Customer
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="qb-footer">
          <span>© 2026 QuickBook. All rights reserved.</span>
          <span>
            Made with <i className="bi bi-heart-fill"></i> for better
            scheduling.
          </span>
        </footer>

        {/* Add / Edit Customer Modal */}
        {showModal && (
          <div
            className="qb-modern-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <div
              className="qb-modern-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-modal-title"
            >
              <div className="qb-modern-modal-head">
                <div>
                  <div className="qb-modal-heading-icon">
                    <i className="bi bi-person-plus"></i>
                  </div>

                  <h2 id="customer-modal-title">
                    {editingId ? "Edit Customer" : "Add New Customer"}
                  </h2>

                  <p>
                    {editingId
                      ? "Update customer information."
                      : "Add a customer to your database."}
                  </p>
                </div>

                <button
                  type="button"
                  className="qb-modal-x"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="qb-modern-form-grid">
                  <div className="full">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      placeholder="Enter customer name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </div>

                  <div className="full">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      maxLength={120}
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      maxLength={20}
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Address</label>
                    <input
                      maxLength={150}
                      placeholder="City, State"
                      value={form.address}
                      onChange={(event) =>
                        setForm({ ...form, address: event.target.value })
                      }
                    />
                  </div>
                </div>

                {error && (
                  <div className="qb-modern-error" role="alert">
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
                    <i className="bi bi-check2"></i>
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Add Customer"}
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
