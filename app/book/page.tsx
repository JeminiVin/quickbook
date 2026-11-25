"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Service = {
  _id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
  description?: string;
};

type Settings = {
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;
  currency?: string;
  slotDuration?: string;
  advanceBooking?: string;
  cancellationNotice?: string;
  startTime?: string;
  endTime?: string;
  workingDays?: string[];
};

type Booking = {
  _id: string;
  service: string;
  date: string;
  time: string;
  status: string;
};

const defaultSettings: Settings = {
  businessName: "QuickBook",
  currency: "INR",
  slotDuration: "30",
  advanceBooking: "30",
  startTime: "09:00",
  endTime: "18:00",
  workingDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

const getLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  const suffix = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;

  return `${formattedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export default function BookPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Current date is initialized only after client mount.
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    setCurrentDate(new Date());

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [servicesRes, settingsRes, bookingsRes] =
          await Promise.all([
            fetch("/api/services", { cache: "no-store" }),
            fetch("/api/settings", { cache: "no-store" }),
            fetch("/api/bookings", { cache: "no-store" }),
          ]);

        const servicesJson = await servicesRes.json();
        const settingsJson = await settingsRes.json();
        const bookingsJson = await bookingsRes.json();

        if (!isMounted) return;

        if (!servicesRes.ok) {
          throw new Error(
            servicesJson.message || "Unable to load services."
          );
        }

        if (!settingsRes.ok) {
          throw new Error(
            settingsJson.message || "Unable to load business settings."
          );
        }

        if (!bookingsRes.ok) {
          throw new Error(
            bookingsJson.message || "Unable to load available slots."
          );
        }

        const serviceList = Array.isArray(servicesJson)
          ? servicesJson
          : servicesJson.data || [];

        const bookingList = Array.isArray(bookingsJson)
          ? bookingsJson
          : bookingsJson.data || [];

        setServices(
          serviceList.filter(
            (service: Service) => service.status === "Active"
          )
        );

        setSettings({
          ...defaultSettings,
          ...(settingsJson.data || {}),
        });

        setBookings(bookingList);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeService = services.find(
    (service) => service._id === selectedService
  );

  // Generate available dates after client mount.
  const availableDates = useMemo(() => {
    if (!currentDate) return [];

    const days = Number(settings.advanceBooking || 30);

    const result: {
      value: string;
      label: string;
    }[] = [];

    const workingDays =
      settings.workingDays || defaultSettings.workingDays!;

    for (let i = 0; i <= Math.min(days, 90); i++) {
      const date = new Date(currentDate);

      date.setDate(date.getDate() + i);

      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (workingDays.includes(dayName)) {
        result.push({
          value: getLocalDate(date),
          label: date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
        });
      }
    }

    return result;
  }, [settings, currentDate]);

  // Generate available appointment slots.
  const availableSlots = useMemo(() => {
    if (!currentDate || !activeService || !selectedDate) {
      return [];
    }

    const slotDuration = Math.max(
      1,
      Number(settings.slotDuration || 30)
    );

    const serviceDuration = Math.max(
      1,
      Number(activeService.duration || 30)
    );

    const start = getMinutes(settings.startTime || "09:00");
    const end = getMinutes(settings.endTime || "18:00");

    const existingBookings = bookings.filter(
      (booking) =>
        booking.date?.slice(0, 10) === selectedDate &&
        booking.service === activeService.name &&
        booking.status !== "Cancelled"
    );

    const slots: string[] = [];

    const todayDate = getLocalDate(currentDate);

    const currentMinutes =
      currentDate.getHours() * 60 + currentDate.getMinutes();

    for (
      let minutes = start;
      minutes + serviceDuration <= end;
      minutes += slotDuration
    ) {
      const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
      const mins = String(minutes % 60).padStart(2, "0");

      const time = `${hours}:${mins}`;

      const slotEnd = minutes + serviceDuration;

      const isBooked = existingBookings.some((booking) => {
        const bookedStart = getMinutes(booking.time);
        const bookedEnd = bookedStart + serviceDuration;

        return minutes < bookedEnd && slotEnd > bookedStart;
      });

      const isPast =
        selectedDate === todayDate && minutes <= currentMinutes;

      if (!isBooked && !isPast) {
        slots.push(time);
      }
    }

    return slots;
  }, [
    currentDate,
    activeService,
    selectedDate,
    bookings,
    settings,
  ]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!activeService) {
      setError("Please select a service.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Please select an appointment date and time.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          service: activeService.name,
          date: selectedDate,
          time: selectedTime,
          status: "Pending",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create booking."
        );
      }

      setSuccess(true);
      setSelectedTime("");
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Booking failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currency = settings.currency || "INR";

  return (
    <main className="public-booking-page">
      <nav className="public-nav">
        <Link href="/" className="public-brand">
          <span className="brand-icon">
            <i className="bi bi-calendar2-check-fill" />
          </span>
          {settings.businessName || "QuickBook"}
        </Link>

        <Link href="/" className="back-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </Link>
      </nav>

      <section className="booking-hero">
        <span className="booking-eyebrow">
          <i className="bi bi-stars" /> SIMPLE & SMART SCHEDULING
        </span>

        <h1>
          Book Your <span>Appointment</span>
        </h1>

        <p>
          Choose your service, select a convenient time and confirm your
          appointment in just a few steps.
        </p>
      </section>

      <section className="booking-container">
        <div className="booking-form-card">
          {success ? (
            <div className="booking-success">
              <div className="success-icon">
                <i className="bi bi-check-lg" />
              </div>

              <h2>Booking Submitted!</h2>

              <p>
                Your appointment request has been received. The business
                will review and confirm your booking.
              </p>

              <button
                className="booking-submit"
                onClick={() => {
                  setSuccess(false);
                  setSelectedService("");
                  setSelectedDate("");
                  setSelectedTime("");
                }}
              >
                Book Another Appointment
                <i className="bi bi-arrow-right" />
              </button>

              <Link href="/" className="success-home">
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="booking-form-heading">
                <div>
                  <span className="form-step">BOOKING FORM</span>
                  <h2>Make a Reservation</h2>
                  <p>Fill in your details to schedule an appointment.</p>
                </div>

                <div className="form-heading-icon">
                  <i className="bi bi-calendar2-week" />
                </div>
              </div>

              {error && (
                <div className="booking-error">
                  <i className="bi bi-exclamation-circle" />
                  {error}
                </div>
              )}

              {loading ? (
                <div className="booking-loading">
                  <div className="spinner-border text-primary" />
                  <p>Loading available services...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-section-title">
                    <span>01</span>
                    <div>
                      <h3>Select a Service</h3>
                      <p>Choose the service you need.</p>
                    </div>
                  </div>

                  {services.length === 0 ? (
                    <div className="booking-empty">
                      No active services are currently available.
                    </div>
                  ) : (
                    <div className="public-service-grid">
                      {services.map((service) => (
                        <button
                          type="button"
                          key={service._id}
                          className={`public-service-option ${
                            selectedService === service._id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedService(service._id);
                            setSelectedTime("");
                          }}
                        >
                          <span className="service-option-icon">
                            <i className="bi bi-briefcase" />
                          </span>

                          <span className="service-option-content">
                            <strong>{service.name}</strong>

                            <small>
                              {service.duration} min · {service.category}
                            </small>

                            <b>
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency,
                                maximumFractionDigits: 0,
                              }).format(service.price)}
                            </b>
                          </span>

                          <i
                            className={`bi ${
                              selectedService === service._id
                                ? "bi-check-circle-fill"
                                : "bi-circle"
                            } service-select-icon`}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="form-divider" />

                  <div className="form-section-title">
                    <span>02</span>
                    <div>
                      <h3>Choose Date & Time</h3>
                      <p>Select an available appointment slot.</p>
                    </div>
                  </div>

                  <label className="public-label">
                    Appointment Date
                  </label>

                  <select
                    className="public-input"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                    required
                    disabled={!activeService || !currentDate}
                  >
                    <option value="">Select a date</option>

                    {availableDates.map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>

                  <label className="public-label time-label">
                    Available Time Slots
                  </label>

                  {!activeService || !selectedDate ? (
                    <p className="slot-hint">
                      Select a service and date to view available time slots.
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="slot-hint">
                      No available slots for this date. Please choose another
                      date.
                    </p>
                  ) : (
                    <div className="public-slots">
                      {availableSlots.map((time) => (
                        <button
                          type="button"
                          key={time}
                          className={`public-slot ${
                            selectedTime === time ? "selected" : ""
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="form-divider" />

                  <div className="form-section-title">
                    <span>03</span>
                    <div>
                      <h3>Your Information</h3>
                      <p>Enter your contact details.</p>
                    </div>
                  </div>

                  <div className="public-form-grid">
                    <div className="public-field full-width">
                      <label className="public-label">Full Name</label>

                      <input
                        className="public-input"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={80}
                      />
                    </div>

                    <div className="public-field">
                      <label className="public-label">Email Address</label>

                      <input
                        className="public-input"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="public-field">
                      <label className="public-label">Phone Number</label>

                      <input
                        className="public-input"
                        type="tel"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <button
                    className="booking-submit"
                    type="submit"
                    disabled={
                      submitting ||
                      !activeService ||
                      !selectedDate ||
                      !selectedTime
                    }
                  >
                    {submitting ? "Submitting..." : "Confirm Appointment"}

                    {!submitting && (
                      <i className="bi bi-arrow-right" />
                    )}
                  </button>

                  <p className="booking-secure-note">
                    <i className="bi bi-shield-check" /> Your information is
                    securely submitted for appointment processing.
                  </p>
                </form>
              )}
            </>
          )}
        </div>

        <aside className="booking-side-card">
          <div className="side-card-top">
            <span className="side-card-icon">
              <i className="bi bi-calendar-check" />
            </span>

            <h3>Appointment Summary</h3>
            <p>Review your selection before confirming.</p>
          </div>

          <div className="summary-item">
            <span>Business</span>
            <strong>{settings.businessName || "QuickBook"}</strong>
          </div>

          <div className="summary-item">
            <span>Selected Service</span>
            <strong>{activeService?.name || "Not selected"}</strong>
          </div>

          <div className="summary-item">
            <span>Duration</span>
            <strong>
              {activeService
                ? `${activeService.duration} minutes`
                : "—"}
            </strong>
          </div>

          <div className="summary-item">
            <span>Date</span>
            <strong>{selectedDate || "Not selected"}</strong>
          </div>

          <div className="summary-item">
            <span>Time</span>
            <strong>
              {selectedTime ? formatTime(selectedTime) : "Not selected"}
            </strong>
          </div>

          <div className="summary-total">
            <span>Service Price</span>

            <strong>
              {activeService
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 0,
                  }).format(activeService.price)
                : "—"}
            </strong>
          </div>

          <div className="side-help">
            <i className="bi bi-info-circle" />

            <p>
              Your booking will remain pending until the business confirms
              your appointment.
            </p>
          </div>

          {settings.businessPhone && (
            <div className="side-contact">
              <i className="bi bi-telephone" />
              <span>{settings.businessPhone}</span>
            </div>
          )}
        </aside>
      </section>

      <footer className="public-booking-footer">
        © {currentDate?.getFullYear() ?? ""}{" "}
        {settings.businessName || "QuickBook"}. All rights reserved.
      </footer>
            <style jsx>{`
        .public-booking-page {
          min-height: 100vh;
          background: #f7f8fc;
          color: #20243a;
          font-family: inherit;
          padding-bottom: 30px;
        }

        .public-nav {
          height: 78px;
          padding: 0 7%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-bottom: 1px solid #ececf4;
        }

        .public-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 21px;
          font-weight: 800;
          color: #20243a;
          text-decoration: none;
        }

        .brand-icon,
        .form-heading-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #6657e8;
          color: #fff;
          font-size: 19px;
        }

        .back-link {
          color: #666b82;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .booking-hero {
          text-align: center;
          padding: 65px 20px 45px;
        }

        .booking-eyebrow,
        .form-step {
          color: #6657e8;
          font-size: 11px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .booking-hero h1 {
          font-size: clamp(32px, 5vw, 46px);
          font-weight: 800;
          margin: 13px 0;
          letter-spacing: -1.5px;
        }

        .booking-hero h1 span {
          color: #6657e8;
        }

        .booking-hero p {
          max-width: 600px;
          margin: auto;
          color: #7a7e91;
          font-size: 15px;
          line-height: 1.7;
        }

        .booking-container {
          max-width: 1120px;
          margin: auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 25px;
          align-items: start;
        }

        .booking-form-card,
        .booking-side-card {
          background: #fff;
          border: 1px solid #ededf4;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 8px 35px rgba(33, 35, 75, 0.035);
        }

        .booking-form-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .booking-form-heading h2 {
          font-size: 24px;
          font-weight: 800;
          margin: 7px 0;
        }

        .booking-form-heading p,
        .form-section-title p {
          color: #85899a;
          font-size: 13px;
          margin: 0;
        }

        .form-heading-icon {
          width: 52px;
          height: 52px;
          font-size: 22px;
        }

        .form-section-title {
          display: flex;
          gap: 13px;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-section-title > span {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f0efff;
          color: #6657e8;
          font-size: 13px;
          font-weight: 800;
        }

        .form-section-title h3 {
          font-size: 16px;
          font-weight: 750;
          margin: 0 0 4px;
        }

        .public-service-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .public-service-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border: 1px solid #e9e9f1;
          border-radius: 12px;
          background: #fff;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
          min-width: 0;
        }

        .public-service-option:hover,
        .public-service-option.selected {
          border-color: #6657e8;
          background: #f9f8ff;
        }

        .service-option-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f0efff;
          color: #6657e8;
          font-size: 17px;
        }

        .service-option-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }

        .service-option-content strong {
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .service-option-content small {
          color: #85899a;
          font-size: 11px;
        }

        .service-option-content b {
          color: #6657e8;
          font-size: 13px;
        }

        .service-select-icon {
          color: #6657e8;
        }

        .form-divider {
          height: 1px;
          background: #eeeef4;
          margin: 28px 0;
        }

        .public-label {
          display: block;
          margin: 0 0 8px;
          color: #35394d;
          font-size: 12px;
          font-weight: 700;
        }

        .public-input {
          width: 100%;
          min-height: 47px;
          padding: 11px 13px;
          border: 1px solid #e5e5ee;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #303449;
          font-size: 13px;
        }

        .public-input:focus {
          border-color: #6657e8;
          box-shadow: 0 0 0 3px rgba(102, 87, 232, 0.09);
        }

        .time-label {
          margin-top: 20px;
        }

        .public-slots {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .public-slot {
          padding: 10px 13px;
          border: 1px solid #e6e6ef;
          border-radius: 8px;
          background: #fff;
          color: #555a70;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .public-slot:hover,
        .public-slot.selected {
          color: #6657e8;
          border-color: #6657e8;
          background: #f5f3ff;
        }

        .slot-hint,
        .booking-empty {
          padding: 14px;
          border-radius: 9px;
          background: #f7f7fb;
          color: #85899a;
          font-size: 12px;
        }

        .public-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .public-field.full-width {
          grid-column: 1 / -1;
        }

        .booking-submit {
          width: 100%;
          margin-top: 25px;
          min-height: 51px;
          border: none;
          border-radius: 10px;
          background: #6657e8;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .booking-submit:hover {
          background: #5546d4;
        }

        .booking-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .booking-secure-note {
          text-align: center;
          color: #9295a5;
          font-size: 11px;
          margin: 14px 0 0;
        }

        .booking-secure-note i {
          color: #26a269;
          margin-right: 5px;
        }

        .booking-side-card {
          padding: 25px;
          position: sticky;
          top: 20px;
        }

        .side-card-top {
          text-align: center;
          padding-bottom: 23px;
          border-bottom: 1px solid #eeeef4;
        }

        .side-card-icon {
          width: 53px;
          height: 53px;
          display: grid;
          place-items: center;
          margin: 0 auto 13px;
          border-radius: 15px;
          background: #f0efff;
          color: #6657e8;
          font-size: 23px;
        }

        .side-card-top h3 {
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .side-card-top p {
          font-size: 12px;
          color: #898d9e;
          margin: 0;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f5;
        }

        .summary-item span,
        .summary-total span {
          color: #9295a5;
          font-size: 11px;
        }

        .summary-item strong {
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 19px 0;
        }

        .summary-total strong {
          color: #6657e8;
          font-size: 19px;
        }

        .side-help {
          display: flex;
          gap: 10px;
          padding: 13px;
          border-radius: 10px;
          background: #f5f4ff;
          color: #6657e8;
        }

        .side-help p {
          margin: 0;
          font-size: 11px;
          line-height: 1.6;
          color: #686b81;
        }

        .side-contact {
          display: flex;
          gap: 9px;
          align-items: center;
          margin-top: 17px;
          color: #686b81;
          font-size: 12px;
        }

        .booking-error {
          display: flex;
          gap: 9px;
          padding: 13px;
          margin-bottom: 20px;
          border-radius: 9px;
          background: #fff0f0;
          color: #b42318;
          font-size: 13px;
        }

        .booking-loading {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 14px;
          color: #777b8f;
          font-size: 13px;
        }

        .booking-success {
          text-align: center;
          padding: 35px 15px;
        }

        .success-icon {
          width: 75px;
          height: 75px;
          margin: auto auto 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e8f8ef;
          color: #20965b;
          font-size: 35px;
        }

        .booking-success h2 {
          font-size: 25px;
          font-weight: 800;
        }

        .booking-success p {
          max-width: 430px;
          margin: 10px auto;
          color: #85899a;
          font-size: 14px;
          line-height: 1.7;
        }

        .success-home {
          display: block;
          margin-top: 17px;
          color: #6657e8;
          text-decoration: none;
          font-size: 13px;
        }

        .public-booking-footer {
          text-align: center;
          padding: 35px 15px 10px;
          color: #999cac;
          font-size: 12px;
        }

        @media (max-width: 850px) {
          .booking-container {
            grid-template-columns: 1fr;
            max-width: 680px;
          }

          .booking-side-card {
            position: static;
          }
        }

        @media (max-width: 560px) {
          .public-nav {
            padding: 0 18px;
            height: 68px;
          }

          .booking-hero {
            padding: 45px 18px 30px;
          }

          .booking-form-card,
          .booking-side-card {
            padding: 20px;
          }

          .public-service-grid,
          .public-form-grid {
            grid-template-columns: 1fr;
          }

          .public-field.full-width {
            grid-column: auto;
          }

          .booking-form-heading h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </main>
  );
}