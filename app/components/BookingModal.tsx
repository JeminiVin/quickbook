
"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Booking } from "./BookingTable";

export type BookingFormData = {
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: Booking["status"];
};

type BookingModalProps = {
  isOpen: boolean;
  booking?: Booking | null;
  services: string[];
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
};

const emptyForm: BookingFormData = {
  name: "",
  email: "",
  service: "",
  date: "",
  time: "",
  status: "Pending",
};

export default function BookingModal({
  isOpen,
  booking,
  services,
  onClose,
  onSave,
}: BookingModalProps) {
  const [form, setForm] = useState<BookingFormData>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      booking
        ? {
            name: booking.name,
            email: booking.email,
            service: booking.service,
            date: booking.date,
            time: booking.time,
            status: booking.status,
          }
        : {
            ...emptyForm,
            service: services[0] ?? "",
          }
    );

    setError("");
  }, [isOpen, booking, services]);

  if (!isOpen) return null;

  const updateField = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.service.trim() ||
      !form.date ||
      !form.time
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!services.includes(form.service) && !booking) {
      setError("Please select an active service.");
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      service: form.service.trim(),
    });
  };

  return (
    <div
      className="qb-modern-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="qb-modern-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div className="qb-modern-modal-head">
          <div>
            <div className="modal-heading-icon">
              <i className="bi bi-calendar-plus"></i>
            </div>

            <h5 id="booking-modal-title">
              {booking ? "Edit Booking" : "Create New Booking"}
            </h5>

            <p>Enter the appointment details below.</p>
          </div>

          <button
            type="button"
            className="qb-modal-x"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="qb-modern-form-grid">
            <div className="mb-3">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter customer name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                maxLength={80}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="customer@example.com"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                maxLength={120}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Service *</label>
              <select
                className="form-select"
                value={form.service}
                onChange={(event) =>
                  updateField("service", event.target.value)
                }
                required
              >
                {services.length === 0 && (
                  <option value="">No active services available</option>
                )}

                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}

                {booking && !services.includes(booking.service) && (
                  <option value={booking.service}>
                    {booking.service} (Existing booking)
                  </option>
                )}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Booking Date *</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(event) =>
                  updateField("date", event.target.value)
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Booking Time *</label>
              <input
                type="time"
                className="form-control"
                value={form.time}
                onChange={(event) =>
                  updateField("time", event.target.value)
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Booking Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as BookingFormData["status"]
                  )
                }
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="qb-modern-error" role="alert">
              <i className="bi bi-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="qb-modern-modal-actions">
            <button
              type="button"
              className="qb-modern-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="qb-modern-primary"
              disabled={services.length === 0 && !booking}
            >
              <i className="bi bi-check-lg"></i>
              {booking ? "Update Booking" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
