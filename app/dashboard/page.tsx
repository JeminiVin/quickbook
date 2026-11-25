
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import QuickBookSidebar from "../components/QuickBookSidebar";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import BookingTable from "../components/BookingTable";

type Booking = {
  id: number;
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Cancelled";
};

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

type Service = {
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
  status: "Active" | "Inactive";
  description: string;
};

const colors = ["purple", "pink", "blue", "orange", "green"];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

async function fetchApiData<T>(url: string): Promise<T[]> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const result = await response.json();

  if (Array.isArray(result)) {
    return result as T[];
  }

  if (Array.isArray(result.data)) {
    return result.data as T[];
  }

  return [];
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [todayKey, setTodayKey] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // Load live data from MongoDB APIs
  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setError("");

        const [bookingData, customerData, serviceData] =
          await Promise.all([
            fetchApiData<any>("/api/bookings"),
            fetchApiData<any>("/api/customers"),
            fetchApiData<any>("/api/services"),
          ]);

        if (!isMounted) return;

        setBookings(
          bookingData.map((item, index) => ({
            id: index + 1,
            name: item.name || "",
            email: item.email || "",
            service: item.service || "",
            date: item.date || "",
            time: item.time || "",
            status: item.status || "Pending",
          }))
        );

        setCustomers(
          customerData.map((item, index) => ({
            id: index + 1,
            name: item.name || "",
            email: item.email || "",
            phone: item.phone || "",
            address: item.address || "",
            createdAt: item.createdAt
              ? String(item.createdAt)
              : "",
          }))
        );

        setServices(
          serviceData.map((item, index) => ({
            id: index + 1,
            name: item.name || "",
            category: item.category || "",
            duration: Number(item.duration) || 0,
            price: Number(item.price) || 0,
            status: item.status || "Inactive",
            description: item.description || "",
          }))
        );

        setTodayKey(getDateKey(new Date()));
      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (isMounted) {
          setError(
            "Unable to load dashboard data. Please check your API connection."
          );
        }
      } finally {
        if (isMounted) {
          setLoaded(true);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Booking statistics
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const pendingCount = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "Cancelled"
  ).length;

  // Active services
  const activeServices = services.filter(
    (service) => service.status === "Active"
  ).length;

  // Today's appointments
  const todayBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.date === todayKey &&
          booking.status !== "Cancelled"
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, todayKey]);

  // Recent bookings
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);

        if (dateCompare !== 0) return dateCompare;

        return b.time.localeCompare(a.time);
      })
      .slice(0, 5);
  }, [bookings]);

  // Weekly booking chart
  const weeklyData = useMemo(() => {
    if (!todayKey) return [];

    const today = new Date(`${todayKey}T00:00:00`);
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dateKey = getDateKey(date);

      const count = bookings.filter(
        (booking) =>
          booking.date === dateKey &&
          booking.status !== "Cancelled"
      ).length;

      return {
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        date: String(date.getDate()),
        count,
        dateKey,
      };
    });
  }, [bookings, todayKey]);

  const weeklyTotal = weeklyData.reduce(
    (total, item) => total + item.count,
    0
  );

  const maxWeeklyCount = Math.max(
    1,
    ...weeklyData.map((item) => item.count)
  );

  // Current date
  const todayLabel = todayKey
    ? new Date(`${todayKey}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Loading date...";

  // Greeting
  const greeting = todayKey
    ? new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening"
    : "Welcome";

  // Dashboard cards
  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length.toLocaleString("en-IN"),
      icon: "bi-calendar2-check",
      color: "purple",
      note: "All appointments",
    },
    {
      title: "Confirmed",
      value: confirmedCount.toLocaleString("en-IN"),
      icon: "bi-check-circle",
      color: "green",
      note: "Confirmed appointments",
    },
    {
      title: "Pending",
      value: pendingCount.toLocaleString("en-IN"),
      icon: "bi-clock",
      color: "orange",
      note: "Awaiting confirmation",
    },
    {
      title: "Total Customers",
      value: customers.length.toLocaleString("en-IN"),
      icon: "bi-people",
      color: "blue",
      note: "Registered customers",
    },
  ];

  // Loading state
  if (!loaded) {
    return (
      <main className="qb-app">
        <section className="qb-main">
          <div className="qb-content">
            <p>Loading your dashboard...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="qb-app">
      <QuickBookSidebar active="dashboard" />

      <section className="qb-main">
        <Navbar
          title="Dashboard Overview"
          section="Dashboard"
        />

        <div className="qb-content">
          {/* Welcome Section */}
          <div className="welcome-row">
            <div>
              <h3>
                {greeting}, Vinayak <span>✌️</span>
              </h3>

              <p>
                Here's what's happening with your business today.
              </p>

              <small>{todayLabel}</small>
            </div>

            <Link href="/bookings" className="primary-btn">
              <i className="bi bi-plus-lg"></i>
              New Booking
            </Link>
          </div>

          {/* API Error */}
          {error && (
            <div
              className="alert alert-danger d-flex justify-content-between align-items-center"
              role="alert"
            >
              <span>{error}</span>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {/* Statistics */}
          <StatsCards stats={stats} />

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Weekly Booking Chart */}
            <div className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h5>Booking Overview</h5>
                  <p>Track your appointment activity</p>
                </div>

                <select
                  className="period-select"
                  defaultValue="This Week"
                >
                  <option>This Week</option>
                </select>
              </div>

              <div className="chart-summary">
                <div>
                  <h2>{weeklyTotal}</h2>
                  <span>Active bookings this week</span>
                </div>

                <div className="chart-legend">
                  <span></span> Bookings
                </div>
              </div>

              <div className="bar-chart">
                {weeklyData.map((item) => {
                  const height =
                    item.count === 0
                      ? 3
                      : Math.max(
                          12,
                          (item.count / maxWeeklyCount) * 100
                        );

                  return (
                    <div
                      className="bar-column"
                      key={item.dateKey}
                    >
                      <div className="bar-track">
                        <div
                          className={`bar-fill ${
                            item.dateKey === todayKey
                              ? "bar-highlight"
                              : ""
                          }`}
                          style={{ height: `${height}%` }}
                          title={`${item.count} bookings`}
                        ></div>
                      </div>

                      <span>{item.day}</span>
                      <small>{item.date}</small>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h5>Today's Schedule</h5>
                  <p>{todayLabel}</p>
                </div>

                <button
                  className="more-btn"
                  type="button"
                  aria-label="More options"
                >
                  <i className="bi bi-three-dots"></i>
                </button>
              </div>

              <div className="schedule-list">
                {todayBookings.length > 0 ? (
                  todayBookings.map((booking, index) => (
                    <div
                      className="schedule-item"
                      key={booking.id}
                    >
                      <span className="schedule-time">
                        {formatTime(booking.time)}
                      </span>

                      <div
                        className={`schedule-detail ${
                          colors[index % colors.length]
                        }-border`}
                      >
                        <strong>{booking.name}</strong>
                        <span>{booking.service}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-check fs-3 text-muted"></i>

                    <p className="mt-2 mb-0">
                      No appointments scheduled today.
                    </p>
                  </div>
                )}
              </div>

              <Link href="/calender" className="view-schedule">
                View full schedule
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <BookingTable bookings={recentBookings} />

          {/* Quick Summary */}
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <div className="panel p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Services Overview</h6>
                    <p className="mb-0 text-muted small">
                      Your active services
                    </p>
                  </div>

                  <i className="bi bi-briefcase fs-3 text-primary"></i>
                </div>

                <h3 className="mt-3 mb-0">
                  {activeServices}
                </h3>

                <small className="text-muted">
                  Active out of {services.length} total services
                </small>

                <div className="mt-3">
                  <Link href="/services" className="view-all">
                    Manage services
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="panel p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Booking Status</h6>
                    <p className="mb-0 text-muted small">
                      Current appointment breakdown
                    </p>
                  </div>

                  <i className="bi bi-pie-chart fs-3 text-primary"></i>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-3">
                  <div>
                    <strong className="text-success">
                      {confirmedCount}
                    </strong>

                    <small className="d-block text-muted">
                      Confirmed
                    </small>
                  </div>

                  <div>
                    <strong className="text-warning">
                      {pendingCount}
                    </strong>

                    <small className="d-block text-muted">
                      Pending
                    </small>
                  </div>

                  <div>
                    <strong className="text-danger">
                      {cancelledCount}
                    </strong>

                    <small className="d-block text-muted">
                      Cancelled
                    </small>
                  </div>
                </div>

                <div className="mt-3">
                  <Link href="/bookings" className="view-all">
                    Manage bookings
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
    </main>
  );
}
