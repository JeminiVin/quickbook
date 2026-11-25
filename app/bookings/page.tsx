
"use client";

import { useEffect, useMemo, useState } from "react";

import QuickBookSidebar from "../components/QuickBookSidebar";
import Navbar from "../components/Navbar";

import BookingModal, {
  type BookingFormData,
} from "../components/BookingModal";

import type { Booking } from "../components/BookingTable";

type Status = Booking["status"];

type BookingRecord = Booking & {
  _id: string;
};

type Service = {
  _id: string;
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
  description?: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T[];
};

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

function formatDate(dateString: string) {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function getApiData<T>(result: ApiResponse<T> | T[]): T[] {
  if (Array.isArray(result)) return result;
  return result.data || [];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingRecord | null>(null);

  // Fetch bookings and services from MongoDB
  const fetchData = async () => {
    try {
      setPageError("");

      const [bookingResponse, serviceResponse] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/services", { cache: "no-store" }),
      ]);

      const bookingResult = await bookingResponse.json();
      const serviceResult = await serviceResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingResult.message || "Unable to load bookings."
        );
      }

      if (!serviceResponse.ok) {
        throw new Error(
          serviceResult.message || "Unable to load services."
        );
      }

      const bookingData = getApiData<BookingRecord>(bookingResult);
      const serviceData = getApiData<Service>(serviceResult);

      // Preserve compatibility with existing Booking component types.
      const normalizedBookings: BookingRecord[] = bookingData.map(
        (booking, index) => ({
          ...booking,
          id: index + 1,
          _id: booking._id,
        })
      );

      const normalizedServices: Service[] = serviceData.map(
        (service, index) => ({
          ...service,
          id: index + 1,
        })
      );

      setBookings(normalizedBookings);
      setServices(normalizedServices);
    } catch (error) {
      console.error("Unable to load booking data:", error);

      setPageError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading data."
      );
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Active services only
  const activeServices = useMemo(
    () => services.filter((service) => service.status === "Active"),
    [services]
  );

  // Stable service names for BookingModal
  const activeServiceNames = useMemo(
    () => activeServices.map((service) => service.name),
    [activeServices]
  );

  // Search and status filtering
  const filteredBookings = useMemo(() => {
    const query = search.toLowerCase().trim();

    return bookings
      .filter((booking) => {
        const matchesSearch = [
          booking.name,
          booking.email,
          booking.service,
        ].some((value) => value.toLowerCase().includes(query));

        const matchesFilter =
          filter === "All" || booking.status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);

        if (dateCompare !== 0) return dateCompare;

        return a.time.localeCompare(b.time);
      });
  }, [bookings, search, filter]);

  // Booking counts
  const counts = {
    All: bookings.length,
    Confirmed: bookings.filter(
      (booking) => booking.status === "Confirmed"
    ).length,
    Pending: bookings.filter(
      (booking) => booking.status === "Pending"
    ).length,
    Cancelled: bookings.filter(
      (booking) => booking.status === "Cancelled"
    ).length,
  };

  // Open create modal
  const openCreateModal = () => {
    setSelectedBooking(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedBooking(null);
  };

  // Create or update booking
  const saveBooking = async (data: BookingFormData) => {
    if (!loaded || saving) return;

    const selectedService = activeServices.find(
      (service) => service.name === data.service
    );

    // New bookings must use an active service
    if (!selectedService && !selectedBooking) {
      window.alert("Please select an active service.");
      return;
    }

    // Existing bookings can retain their previous service
    if (
      !selectedService &&
      selectedBooking &&
      data.service !== selectedBooking.service
    ) {
      window.alert("Please select a valid active service.");
      return;
    }

    // Validate future appointment date and time
    const appointmentDateTime = `${data.date}T${data.time}`;

    const currentDateTime = `${localDate()}T${new Date()
      .toTimeString()
      .slice(0, 5)}`;

    const sameExistingDateTime =
      selectedBooking?.date === data.date &&
      selectedBooking?.time === data.time;

    if (
      appointmentDateTime <= currentDateTime &&
      !sameExistingDateTime
    ) {
      window.alert(
        "Please select a future appointment date and time."
      );
      return;
    }

    // Prevent duplicate appointments for the same service
    const conflict = bookings.some(
      (booking) =>
        booking._id !== selectedBooking?._id &&
        booking.service === data.service &&
        booking.date === data.date &&
        booking.time === data.time &&
        booking.status !== "Cancelled" &&
        data.status !== "Cancelled"
    );

    if (conflict) {
      window.alert(
        "This service already has an appointment at the selected date and time."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        service: data.service,
        date: data.date,
        time: data.time,
        status: data.status,
      };

      const response = await fetch(
        selectedBooking
          ? `/api/bookings/${selectedBooking._id}`
          : "/api/bookings",
        {
          method: selectedBooking ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save booking."
        );
      }

      await fetchData();

      setShowModal(false);
      setSelectedBooking(null);
      setFilter("All");
      setSearch("");
    } catch (error) {
      console.error("Booking save error:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to save booking."
      );
    } finally {
      setSaving(false);
    }
  };

  // Update booking status
  const updateStatus = async (id: string, status: Status) => {
    const booking = bookings.find((item) => item._id === id);

    if (!booking) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update booking status."
        );
      }

      setBookings((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update status."
      );
    }
  };

  // Delete booking
  const deleteBooking = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete booking."
        );
      }

      setBookings((previous) =>
        previous.filter((booking) => booking._id !== id)
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete booking."
      );
    }
  };

  if (!loaded) {
    return (
      <main className="qb-app">
        <section className="qb-main">
          <div className="qb-content">
            <p>Loading bookings...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="qb-app">
      {/* Sidebar */}
      <QuickBookSidebar active="bookings" />

      {/* Main Content */}
      <section className="qb-main">
        <Navbar title="Booking Management" section="Bookings" />

        <div className="qb-content">
          {/* Welcome Section */}
          <div className="welcome-row">
            <div>
              <h3>All Bookings</h3>
              <p>
                Manage, track and organize your appointments.
              </p>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-lg"></i>
              New Booking
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

          {/* Booking Count Cards */}
          <div className="booking-count-grid">
            {(
              ["All", "Confirmed", "Pending", "Cancelled"] as const
            ).map((status) => (
              <button
                type="button"
                key={status}
                className={`count-card ${filter === status ? "selected" : ""
                  }`}
                onClick={() => setFilter(status)}
              >
                <span>{status} Bookings</span>
                <strong>{counts[status]}</strong>

                <small>
                  {filter === status
                    ? "Currently viewing"
                    : "View bookings"}
                </small>
              </button>
            ))}
          </div>

          {/* Appointments Panel */}
          <div className="panel bookings-panel">
            {/* Toolbar */}
            <div className="booking-toolbar">
              <div>
                <h5>Appointments</h5>
                <p>
                  {filteredBookings.length} appointments found
                </p>
              </div>

              <div className="booking-search">
                <i className="bi bi-search"></i>

                <input
                  type="text"
                  placeholder="Search customer or service..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="booking-filters">
              {(
                ["All", "Confirmed", "Pending", "Cancelled"] as const
              ).map((status) => (
                <button
                  type="button"
                  key={status}
                  className={
                    filter === status ? "filter-active" : ""
                  }
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Bookings Table */}
            <div className="table-responsive">
              <table className="table qb-table align-middle">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>SERVICE</th>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      {/* Customer */}
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar purple">
                            {getInitials(booking.name)}
                          </div>

                          <div>
                            <strong>{booking.name}</strong>

                            <div className="booking-email">
                              {booking.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td>{booking.service}</td>

                      {/* Date */}
                      <td>{formatDate(booking.date)}</td>

                      {/* Time */}
                      <td>{formatTime(booking.time)}</td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-badge ${booking.status.toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="booking-actions">
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => openEditModal(booking)}
                            title="Edit booking"
                            aria-label={`Edit ${booking.name}'s booking`}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <select
                            value={booking.status}
                            onChange={(event) =>
                              updateStatus(
                                booking._id,
                                event.target.value as Status
                              )
                            }
                            aria-label={`Update status for ${booking.name}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              deleteBooking(booking._id)
                            }
                            aria-label={`Delete ${booking.name}'s booking`}
                            title="Delete booking"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-bookings">
                        <i className="bi bi-calendar-x"></i>

                        <strong>No bookings found</strong>

                        <span>
                          Try another search or filter.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Booking Footer */}
          <footer className="qb-footer">
            <span>
              © 2026 QuickBook. All rights reserved.
            </span>

            <span>
              Made with <i className="bi bi-heart-fill"></i> for better
              scheduling.
            </span>
          </footer>
        </div>
      </section>

      {/* Reusable Booking Modal */}
      <BookingModal
        isOpen={showModal}
        booking={selectedBooking}
        services={activeServiceNames}
        onClose={closeModal}
        onSave={saveBooking}
      />
    </main>
  );
}
