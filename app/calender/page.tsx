
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QuickBookSidebar from "@/app/components/QuickBookSidebar";

type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

type Booking = {
  _id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDate(value: string) {
  if (!value) return "";

  // Handle both YYYY-MM-DD and ISO date strings.
  return value.slice(0, 10);
}

function formatTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;

  return `${String(formattedHour).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
}

function normalizeStatus(status: string): BookingStatus {
  if (status === "Confirmed" || status === "Cancelled") {
    return status;
  }

  return "Pending";
}

async function fetchBookings(): Promise<Booking[]> {
  const response = await fetch("/api/bookings", {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to load bookings.");
  }

  const records = Array.isArray(result) ? result : result.data;

  if (!Array.isArray(records)) {
    throw new Error("Invalid bookings response from server.");
  }

  return records.map((booking: Record<string, unknown>) => ({
    _id: String(booking._id ?? booking.id ?? ""),
    name: String(booking.name ?? ""),
    email: String(booking.email ?? ""),
    service: String(booking.service ?? ""),
    date: normalizeDate(String(booking.date ?? "")),
    time: String(booking.time ?? ""),
    status: normalizeStatus(String(booking.status ?? "Pending")),
  }));
}

export default function CalendarPage() {
  const [today, setToday] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize calendar dates.
  useEffect(() => {
    const now = new Date();

    setToday(now);
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(dateKey(now));
  }, []);

  // Fetch bookings from MongoDB API.
  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchBookings();

        if (isMounted) {
          setBookings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    // Refresh data when the user returns to this page.
    const handleFocus = () => {
      loadBookings();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const monthName = currentDate
    ? currentDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  const days = useMemo(() => {
    if (!currentDate) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [currentDate]);

  const selectedBookings = bookings
    .filter((booking) => booking.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const monthBookings = bookings.filter((booking) => {
    if (!currentDate) return false;

    const date = booking.date.split("-");

    return (
      Number(date[0]) === currentDate.getFullYear() &&
      Number(date[1]) === currentDate.getMonth() + 1
    );
  });

  const confirmedCount = monthBookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const pendingCount = monthBookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const goToPreviousMonth = () => {
    if (!currentDate) return;

    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    if (!currentDate) return;

    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    if (!today) return;

    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(dateKey(today));
  };

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  if (!today || !currentDate) {
    return (
      <div className="qb-app-shell">
        <QuickBookSidebar active="calendar" />
        <main className="qb-modern-page">
          <p>Loading calendar...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="qb-app-shell">
      <QuickBookSidebar active="calendar" />

      <main className="qb-modern-page">
        <div className="qb-modern-header">
          <div>
            <span className="qb-eyebrow">
              <i className="bi bi-calendar3" />
              APPOINTMENT MANAGEMENT
            </span>

            <h1>
              Calendar <span>& Scheduling</span>
            </h1>

            <p>
              View appointments, manage schedules and track your daily
              bookings.
            </p>
          </div>

          <Link href="/bookings" className="qb-modern-primary">
            <i className="bi bi-plus-lg" />
            Create Booking
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="calendar-stats">
          <div className="calendar-stat-card">
            <div className="calendar-stat-icon purple">
              <i className="bi bi-calendar-event" />
            </div>

            <div>
              <small>This Month</small>
              <h3>{loading ? "..." : monthBookings.length}</h3>
              <span>Total appointments</span>
            </div>
          </div>

          <div className="calendar-stat-card">
            <div className="calendar-stat-icon green">
              <i className="bi bi-check-circle" />
            </div>

            <div>
              <small>Confirmed</small>
              <h3>{loading ? "..." : confirmedCount}</h3>
              <span>Confirmed appointments</span>
            </div>
          </div>

          <div className="calendar-stat-card">
            <div className="calendar-stat-icon orange">
              <i className="bi bi-clock" />
            </div>

            <div>
              <small>Pending</small>
              <h3>{loading ? "..." : pendingCount}</h3>
              <span>Awaiting confirmation</span>
            </div>
          </div>
        </div>

        {/* Calendar and Daily Schedule */}
        <div className="calendar-layout">
          <section className="calendar-main-panel">
            <div className="calendar-toolbar">
              <div>
                <h5>{monthName}</h5>
                <p>Select a date to view appointments</p>
              </div>

              <div className="calendar-navigation">
                <button onClick={goToToday}>Today</button>

                <button
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                >
                  <i className="bi bi-chevron-left" />
                </button>

                <button
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 mb-0">Loading appointments...</p>
              </div>
            ) : (
              <>
                <div className="calendar-grid">
                  {weekdays.map((day) => (
                    <div className="calendar-weekday" key={day}>
                      {day}
                    </div>
                  ))}

                  {days.map((day, index) => {
                    if (day === null) {
                      return (
                        <div
                          className="calendar-day empty"
                          key={`empty-${index}`}
                        />
                      );
                    }

                    const cellDate = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    );

                    const key = dateKey(cellDate);

                    const dayBookings = bookings.filter(
                      (booking) => booking.date === key
                    );

                    const isToday = key === dateKey(today);
                    const isSelected = key === selectedDate;

                    return (
                      <button
                        key={key}
                        className={`calendar-day ${
                          isToday ? "today" : ""
                        } ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedDate(key)}
                      >
                        <span className="calendar-day-number">{day}</span>

                        {dayBookings.length > 0 && (
                          <>
                            <div className="calendar-day-events">
                              {dayBookings.slice(0, 3).map((booking) => (
                                <span
                                  key={booking._id}
                                  className={`event-dot ${booking.status.toLowerCase()}`}
                                />
                              ))}
                            </div>

                            <small className="calendar-day-count">
                              {dayBookings.length}{" "}
                              {dayBookings.length === 1
                                ? "booking"
                                : "bookings"}
                            </small>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="calendar-legend">
                  <span>
                    <i className="legend-dot confirmed" />
                    Confirmed
                  </span>

                  <span>
                    <i className="legend-dot pending" />
                    Pending
                  </span>

                  <span>
                    <i className="legend-dot cancelled" />
                    Cancelled
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Daily Schedule */}
          <aside className="calendar-agenda">
            <span className="qb-eyebrow">DAILY SCHEDULE</span>

            <h5>{selectedDateLabel}</h5>

            <p className="agenda-subtitle">
              {loading ? "Loading..." : selectedBookings.length} appointments
              scheduled
            </p>

            <div className="agenda-calendar-icon">
              <i className="bi bi-calendar2-week" />
            </div>

            <div className="agenda-bookings">
              {!loading && selectedBookings.length > 0 ? (
                selectedBookings.map((booking) => (
                  <div
                    className={`agenda-card ${booking.status.toLowerCase()}`}
                    key={booking._id}
                  >
                    <div className="agenda-time">
                      {formatTime(booking.time)}
                    </div>

                    <div className="agenda-card-content">
                      <div className="agenda-card-top">
                        <strong>{booking.name}</strong>

                        <span
                          className={`booking-status ${booking.status.toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p>{booking.service}</p>
                      <small>{booking.email}</small>
                    </div>
                  </div>
                ))
              ) : (
                !loading && (
                  <div className="agenda-empty">
                    <i className="bi bi-calendar-x" />

                    <h6>No appointments</h6>

                    <p>
                      There are no bookings scheduled for this date.
                    </p>

                    <Link href="/bookings">Create a booking</Link>
                  </div>
                )
              )}
            </div>

            <Link href="/bookings" className="agenda-view-all">
              Manage all bookings
              <i className="bi bi-arrow-right" />
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
