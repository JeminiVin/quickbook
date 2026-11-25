

"use client";

import { useEffect, useMemo, useState } from "react";

import QuickBookSidebar from "@/app/components/QuickBookSidebar";

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

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

async function fetchApiData<T>(url: string): Promise<T[]> {
  const response = await fetch(url, { cache: "no-store" });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || result?.error || `Failed to load ${url}`);
  }

  const records = Array.isArray(result) ? result : result?.data;
  return Array.isArray(records) ? records : [];
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
const [customers, setCustomers] = useState<Customer[]>([]);
const [services, setServices] = useState<Service[]>([]);
const [period, setPeriod] = useState("30");
const [loaded, setLoaded] = useState(false);
const [error, setError] = useState("");
const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Load analytics data from MongoDB APIs
  useEffect(() => {
  let isMounted = true;

  setCurrentDate(new Date());

  const loadData = async () => {
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
          name: item.name ?? "",
          email: item.email ?? "",
          service: item.service ?? "",
          date:
            typeof item.date === "string"
              ? item.date.slice(0, 10)
              : "",
          time: item.time ?? "",
          status: item.status ?? "Pending",
        }))
      );

      setCustomers(
        customerData.map((item, index) => ({
          id: index + 1,
          name: item.name ?? "",
          email: item.email ?? "",
          phone: item.phone ?? "",
          address: item.address ?? "",
          createdAt: item.createdAt ?? item.created_at ?? "",
        }))
      );

      setServices(
        serviceData.map((item, index) => ({
          id: index + 1,
          name: item.name ?? "",
          category: item.category ?? "",
          duration: Number(item.duration ?? 0),
          price: Number(item.price ?? 0),
          status: item.status ?? "Inactive",
          description: item.description ?? "",
        }))
      );
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics data."
        );
      }
    } finally {
      if (isMounted) setLoaded(true);
    }
  };

  loadData();

  window.addEventListener("focus", loadData);

  return () => {
    isMounted = false;
    window.removeEventListener("focus", loadData);
  };
}, []);
    

  // Date range

  const dateRange = useMemo(() => {
  if (!currentDate) return null;

  const days = Number(period);

  const today = new Date(currentDate);
  today.setHours(23, 59, 59, 999);

  const start = new Date(currentDate);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return { start, today };
}, [period, currentDate]);

  // Filter bookings

  const filteredBookings = useMemo(() => {
  if (!dateRange) return [];

  return bookings.filter((booking) => {
    const date = new Date(`${booking.date}T00:00:00`);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= dateRange.start &&
      date <= dateRange.today
    );
  });
}, [bookings, dateRange]);

  // Booking statistics

  const totalBookings = filteredBookings.length;

  const confirmed = filteredBookings.filter(

    (booking) => booking.status === "Confirmed"

  ).length;

  const pending = filteredBookings.filter(

    (booking) => booking.status === "Pending"

  ).length;

  const cancelled = filteredBookings.filter(

    (booking) => booking.status === "Cancelled"

  ).length;

  const confirmationRate = totalBookings

    ? Math.round((confirmed / totalBookings) * 100)

    : 0;

  // Estimated booking value, not actual revenue

  const estimatedValue = filteredBookings

    .filter((booking) => booking.status !== "Cancelled")

    .reduce((total, booking) => {

      const service = services.find(

        (item) => item.name === booking.service

      );

      return total + (service?.price ?? 0);

    }, 0);

  const activeServices = services.filter(

    (service) => service.status === "Active"

  ).length;

  // Customer growth

  const customerGrowth = customers.filter((customer) => {
  if (!dateRange) return false;

  const created = new Date(customer.createdAt);

  return (
    !Number.isNaN(created.getTime()) &&
    created >= dateRange.start &&
    created <= dateRange.today
  );
}).length;

  // Chart data

  const chartData = useMemo(() => {
  if (!currentDate) return [];

  const days = Number(period);

  const result: {
    label: string;
    fullDate: string;
    count: number;
  }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate);

    date.setDate(date.getDate() - i);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    result.push({
      label:
        days === 7
          ? date.toLocaleDateString("en-IN", {
              weekday: "short",
            })
          : date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),

      fullDate: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),

      count: filteredBookings.filter(
        (booking) => booking.date === key
      ).length,
    });
  }

  return result;
}, [filteredBookings, period, currentDate]);

  const maxCount = Math.max(

    ...chartData.map((item) => item.count),

    1

  );

  // Service performance

  const servicePerformance = useMemo(() => {

    return services

      .map((service) => ({

        ...service,

        count: filteredBookings.filter(

          (booking) => booking.service === service.name

        ).length,

      }))

      .sort((a, b) => b.count - a.count);

  }, [services, filteredBookings]);

  const topService = servicePerformance.find(

    (service) => service.count > 0

  );

  const maxServiceCount = Math.max(

    ...servicePerformance.map((service) => service.count),

    1

  );

  // Stats cards

  const stats = [

    {

      title: "Total Bookings",

      value: totalBookings,

      icon: "bi-calendar2-check",

      color: "purple",

      note: `Last ${period} days`,

    },

    {

      title: "Confirmed Bookings",

      value: confirmed,

      icon: "bi-check-circle",

      color: "green",

      note: `${confirmationRate}% confirmation rate`,

    },

    {

      title: "Total Customers",

      value: customers.length,

      icon: "bi-people",

      color: "blue",

      note: `+${customerGrowth} in selected period`,

    },

    {

      title: "Active Services",

      value: activeServices,

      icon: "bi-briefcase",

      color: "orange",

      note: `Out of ${services.length} services`,

    },

  ];

  if (!loaded) {

    return (

      <div className="qb-app-shell">

        <QuickBookSidebar active="analytics" />

        <main className="qb-modern-page">

          <div className="qb-analytics-loading">

            <span className="qb-loading-spinner" />

            <p>Preparing your analytics...</p>

          </div>

        </main>

      </div>

    );

  }

  return (

    <div className="qb-app-shell qb-analytics-app">

      <QuickBookSidebar active="analytics" />

      <main className="qb-modern-page qb-analytics-page">

        {/* PAGE HEADER */}

        <header className="qb-modern-header qb-analytics-header">

          <div>

            <span className="qb-eyebrow">

              <i className="bi bi-bar-chart-line" />

              BUSINESS INSIGHTS

            </span>

            <h1>

              Analytics <span>Overview</span>

            </h1>

            <p>

              Track your bookings, customers and service performance.

            </p>

          </div>

          <div className="qb-period-wrapper">

            <i className="bi bi-calendar3" />

            <select

              className="form-select"

              value={period}

              onChange={(e) => setPeriod(e.target.value)}

              aria-label="Select analytics period"

            >

              <option value="7">Last 7 Days</option>

              <option value="30">Last 30 Days</option>

              <option value="90">Last 90 Days</option>

            </select>

          </div>

        </header>

        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
            <span>{error}</span>
            <button type="button" className="btn btn-sm btn-outline-danger flex-shrink-0" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* STATS */}

        <section className="qb-modern-stats qb-analytics-stats">

          {stats.map((stat) => (

            <article className="qb-modern-stat" key={stat.title}>

              <div className={`qb-stat-icon ${stat.color}`}>

                <i className={`bi ${stat.icon}`} />

              </div>

              <div className="qb-analytics-stat-info">

                <span>{stat.title}</span>

                <strong>

                  {stat.value.toLocaleString("en-IN")}

                </strong>

                <small>{stat.note}</small>

              </div>

            </article>

          ))}

        </section>

        {/* MAIN ANALYTICS GRID */}

        <div className="qb-analytics-grid">

          {/* BOOKING TRENDS */}

          <section className="qb-modern-panel qb-analytics-chart">

            <div className="qb-analytics-panel-head">

              <div>

                <h2>Booking Trends</h2>

                <p>Daily bookings in the selected period</p>

              </div>

              <span className="qb-analytics-icon">

                <i className="bi bi-graph-up-arrow" />

              </span>

            </div>

            <div className="qb-chart-summary">

              <div>

                <strong>{totalBookings}</strong>

                <span>Total bookings</span>

              </div>

              <div className="qb-chart-legend">

                <span />

                Daily bookings

              </div>

            </div>

            <div className="qb-analytics-bars">

              {chartData.map((item, index) => {

                const showLabel =

                  chartData.length <= 7 ||

                  index % (chartData.length <= 30 ? 5 : 10) === 0 ||

                  index === chartData.length - 1;

                const barHeight = item.count

                  ? Math.max((item.count / maxCount) * 100, 5)

                  : 2;

                return (

                  <div

                    className="qb-analytics-bar-item"

                    key={`${item.fullDate}-${index}`}

                    title={`${item.fullDate}: ${item.count} bookings`}

                  >

                    <strong>{item.count || ""}</strong>

                    <div className="qb-analytics-bar-track">

                      <div

                        className="qb-analytics-bar-fill"

                        style={{

                          height: `${barHeight}%`,

                        }}

                      />

                    </div>

                    <span>

                      {showLabel ? item.label : ""}

                    </span>

                  </div>

                );

              })}

            </div>

            {totalBookings === 0 && (

              <div className="qb-chart-empty">

                <i className="bi bi-bar-chart" />

                <span>No bookings in this period yet</span>

              </div>

            )}

          </section>

          {/* BOOKING STATUS */}

          <section className="qb-modern-panel qb-analytics-status">

            <div className="qb-analytics-panel-head">

              <div>

                <h2>Booking Status</h2>

                <p>Distribution of bookings</p>

              </div>

              <span className="qb-analytics-icon">

                <i className="bi bi-pie-chart" />

              </span>

            </div>

            <div className="qb-status-content">

              <div

                className="qb-status-donut"

                style={{

                  background: totalBookings

                    ? `conic-gradient(

                        #6558e8 0% ${confirmed / totalBookings * 100}%,

                        #f2a541 ${confirmed / totalBookings * 100}% ${(confirmed + pending) / totalBookings * 100}%,

                        #ed6b75 ${(confirmed + pending) / totalBookings * 100}% 100%

                      )`

                    : "#eeedf5",

                }}

              >

                <div>

                  <strong>{totalBookings}</strong>

                  <span>Total Bookings</span>

                </div>

              </div>

              <div className="qb-status-legend">

                <div>

                  <span className="qb-legend-dot purple-dot" />

                  <span>Confirmed</span>

                  <strong>{confirmed}</strong>

                </div>

                <div>

                  <span className="qb-legend-dot orange-dot" />

                  <span>Pending</span>

                  <strong>{pending}</strong>

                </div>

                <div>

                  <span className="qb-legend-dot red-dot" />

                  <span>Cancelled</span>

                  <strong>{cancelled}</strong>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* LOWER ANALYTICS GRID */}

        <div className="qb-analytics-grid qb-analytics-lower">

          {/* SERVICE PERFORMANCE */}

          <section className="qb-modern-panel">

            <div className="qb-analytics-panel-head">

              <div>

                <h2>Service Performance</h2>

                <p>Bookings received by each service</p>

              </div>

              <span className="qb-analytics-icon">

                <i className="bi bi-layers" />

              </span>

            </div>

            {servicePerformance.length > 0 ? (

              <div className="qb-service-performance">

                {servicePerformance.map((service, index) => (

                  <div

                    className="qb-service-performance-item"

                    key={service.id}

                  >

                    <div className="qb-service-performance-info">

                      <div className="qb-service-name">

                        <span className="qb-service-rank">

                          {index + 1}

                        </span>

                        <div>

                          <strong>{service.name}</strong>

                          <span>{service.category}</span>

                        </div>

                      </div>

                      <strong className="qb-service-count">

                        {service.count} bookings

                      </strong>

                    </div>

                    <div className="qb-performance-track">

                      <div

                        className="qb-performance-fill"

                        style={{

                          width: `${(service.count / maxServiceCount) * 100

                            }%`,

                        }}

                      />

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="qb-analytics-empty">

                <i className="bi bi-briefcase" />

                <strong>No services available</strong>

                <span>Add services to see their performance.</span>

              </div>

            )}

          </section>

          {/* BUSINESS INSIGHTS */}

          <section className="qb-modern-panel qb-analytics-insights">

            <div className="qb-analytics-panel-head">

              <div>

                <h2>Business Insights</h2>

                <p>A quick performance summary</p>

              </div>

              <span className="qb-analytics-icon">

                <i className="bi bi-lightbulb" />

              </span>

            </div>

            <div className="qb-insight-item">

              <span className="qb-insight-icon purple">

                <i className="bi bi-trophy" />

              </span>

              <div>

                <small>Top Service</small>

                <strong>

                  {topService?.name || "No data yet"}

                </strong>

              </div>

            </div>

            <div className="qb-insight-item">

              <span className="qb-insight-icon green">

                <i className="bi bi-check2-circle" />

              </span>

              <div>

                <small>Confirmation Rate</small>

                <strong>{confirmationRate}%</strong>

              </div>

            </div>

            <div className="qb-insight-item">

              <span className="qb-insight-icon blue">

                <i className="bi bi-currency-rupee" />

              </span>

              <div>

                <small>Estimated Booking Value</small>

                <strong>{money(estimatedValue)}</strong>

              </div>

            </div>

            <p className="qb-analytics-disclaimer">

              <i className="bi bi-info-circle" />

              Estimated from service prices for non-cancelled bookings.

              This is not actual collected revenue.

            </p>

          </section>

        </div>

      </main>

      <style jsx>{`

        .qb-analytics-app {

          width: 100%;

          max-width: 100%;

          min-width: 0;

          overflow-x: clip;

        }

        .qb-analytics-page {

          flex: 1 1 0%;

          width: 0;

          min-width: 0;

          max-width: 100%;

          padding: 36px clamp(20px, 2.5vw, 42px) 50px;

          overflow-x: clip;

        }

        .qb-analytics-header {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 24px;

          margin-bottom: 30px;

        }

        .qb-analytics-header h1 {

          font-size: clamp(25px, 2.5vw, 34px);

          font-weight: 800;

          letter-spacing: -1.4px;

          color: #20243a;

          margin: 13px 0 8px;

        }

        .qb-analytics-header h1 span {

          color: #6558e8;

        }

        .qb-analytics-header p {

          color: #9298aa;

          font-size: 13px;

          margin: 0;

        }

        .qb-period-wrapper {

          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 175px;

          padding: 0 12px;

          background: #fff;

          border: 1px solid #e8e9f1;

          border-radius: 12px;

          color: #6558e8;

        }

        .qb-period-wrapper select {

          min-width: 0;

          border: none;

          box-shadow: none;

          font-size: 13px;

          font-weight: 600;

          color: #34344a;

          padding: 11px 5px;

          background-color: transparent;

        }

        .qb-analytics-stats {

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 18px;

        }

        .qb-analytics-stats .qb-modern-stat {

          min-width: 0;

          padding: 22px;

          border-radius: 17px;

          box-shadow: 0 5px 20px rgba(35, 35, 70, .035);

          transition: transform .2s ease, box-shadow .2s ease;

        }

        .qb-analytics-stats .qb-modern-stat:hover {

          transform: translateY(-3px);

          box-shadow: 0 10px 25px rgba(35, 35, 70, .07);

        }

        .qb-analytics-stat-info {

          display: flex;

          flex-direction: column;

          min-width: 0;

          gap: 5px;

        }

        .qb-analytics-stat-info span {

          color: #858ba0;

          font-size: 12px;

        }

        .qb-analytics-stat-info strong {

          color: #252943;

          font-size: 27px;

          font-weight: 800;

          letter-spacing: -.7px;

        }

        .qb-analytics-stat-info small {

          color: #9298aa;

          font-size: 11px;

        }

        .qb-analytics-grid {

          display: grid;

          grid-template-columns: minmax(0, 1.55fr) minmax(290px, .85fr);

          gap: 20px;

          margin-top: 22px;

          width: 100%;

          min-width: 0;

        }

        .qb-analytics-grid > section {

          min-width: 0;

          overflow: hidden;

        }

        .qb-analytics-lower {

          grid-template-columns: minmax(0, 1.2fr) minmax(290px, .8fr);

          margin-bottom: 30px;

        }

        .qb-analytics-chart,

        .qb-analytics-status,

        .qb-analytics-insights {

          display: flex;

          flex-direction: column;

        }

        .qb-analytics-panel-head {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          margin-bottom: 23px;

        }

        .qb-analytics-panel-head h2 {

          font-size: 17px;

          font-weight: 750;

          color: #252943;

          margin: 0 0 6px;

        }

        .qb-analytics-panel-head p {

          font-size: 12px;

          color: #9293a3;

          margin: 0;

        }

        .qb-analytics-icon {

          display: grid;

          place-items: center;

          width: 40px;

          height: 40px;

          border-radius: 12px;

          background: #f0efff;

          color: #6558e8;

          flex-shrink: 0;

        }

        .qb-chart-summary {

          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          margin-bottom: 8px;

        }

        .qb-chart-summary > div:first-child {

          display: flex;

          flex-direction: column;

          gap: 3px;

        }

        .qb-chart-summary strong {

          font-size: 23px;

          color: #252943;

          font-weight: 800;

        }

        .qb-chart-summary span {

          font-size: 11px;

          color: #9298aa;

        }

        .qb-chart-legend {

          display: flex;

          align-items: center;

          gap: 7px;

        }

        .qb-chart-legend span {

          width: 8px;

          height: 8px;

          border-radius: 3px;

          background: #6558e8;

        }

        .qb-analytics-bars {

          height: 225px;

          display: flex;

          align-items: stretch;

          gap: 7px;

          padding-top: 12px;

          border-bottom: 1px solid #eeeef3;

          min-width: 0;

        }

        .qb-analytics-bar-item {

          flex: 1 1 0;

          min-width: 0;

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 7px;

        }

        .qb-analytics-bar-item > strong {

          height: 14px;

          font-size: 10px;

          color: #6558e8;

          font-weight: 700;

        }

        .qb-analytics-bar-track {

          flex: 1;

          width: min(26px, 75%);

          display: flex;

          align-items: flex-end;

          overflow: hidden;

          border-radius: 8px 8px 2px 2px;

          background: #f3f2fb;

          transition: background .2s ease;

        }

        .qb-analytics-bar-item:hover .qb-analytics-bar-track {

          background: #e9e6ff;

        }

        .qb-analytics-bar-fill {

          width: 100%;

          min-height: 3px;

          background: linear-gradient(180deg, #9d92ff, #6558e8);

          border-radius: 8px 8px 2px 2px;

          transition: height .3s ease;

        }

        .qb-analytics-bar-item > span {

          height: 14px;

          font-size: 10px;

          color: #9293a3;

          white-space: nowrap;

        }

        .qb-chart-empty {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          color: #9999a8;

          font-size: 12px;

          padding-top: 13px;

        }

        .qb-chart-empty i {

          color: #6558e8;

        }

        .qb-status-content {

          display: flex;

          align-items: center;

          justify-content: center;

          flex: 1;

          gap: 22px;

          min-height: 230px;

          flex-wrap: wrap;

        }

        .qb-status-donut {

          width: 148px;

          height: 148px;

          border-radius: 50%;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          box-shadow: 0 5px 18px rgba(35, 35, 70, .05);

        }

        .qb-status-donut > div {

          width: 108px;

          height: 108px;

          border-radius: 50%;

          background: white;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

        }

        .qb-status-donut strong {

          font-size: 27px;

          font-weight: 800;

          color: #272638;

        }

        .qb-status-donut span {

          color: #9293a3;

          font-size: 11px;

        }

        .qb-status-legend {

          display: grid;

          gap: 19px;

          min-width: 125px;

        }

        .qb-status-legend > div {

          display: grid;

          grid-template-columns: 9px 1fr auto;

          align-items: center;

          gap: 9px;

          font-size: 12px;

          color: #77778a;

        }

        .qb-status-legend strong {

          color: #29283a;

          font-size: 13px;

        }

        .qb-legend-dot {

          width: 8px;

          height: 8px;

          border-radius: 50%;

        }

        .purple-dot { background: #6558e8; }

        .orange-dot { background: #f2a541; }

        .red-dot { background: #ed6b75; }

        .qb-service-performance {

          display: grid;

          gap: 24px;

        }

        .qb-service-performance-item {

          min-width: 0;

        }

        .qb-service-performance-info {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          margin-bottom: 10px;

        }

        .qb-service-name {

          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;

        }

        .qb-service-rank {

          display: grid;

          place-items: center;

          width: 29px;

          height: 29px;

          border-radius: 9px;

          background: #f0efff;

          color: #6558e8;

          font-size: 11px;

          font-weight: 750;

          flex-shrink: 0;

        }

        .qb-service-name > div {

          display: grid;

          gap: 4px;

          min-width: 0;

        }

        .qb-service-name strong {

          color: #343348;

          font-size: 12px;

          overflow-wrap: anywhere;

        }

        .qb-service-name span {

          color: #9999a8;

          font-size: 11px;

        }

        .qb-service-count {

          color: #6558e8;

          font-size: 11px;

          white-space: nowrap;

          flex-shrink: 0;

        }

        .qb-performance-track {

          height: 8px;

          background: #f0eff6;

          border-radius: 20px;

          overflow: hidden;

          margin-left: 40px;

        }

        .qb-performance-fill {

          height: 100%;

          background: linear-gradient(90deg, #a69dfb, #6558e8);

          border-radius: 20px;

          transition: width .3s ease;

        }

        .qb-insight-item {

          display: flex;

          align-items: center;

          gap: 14px;

          padding: 16px 0;

          border-bottom: 1px solid #f0eff4;

        }

        .qb-insight-icon {

          width: 43px;

          height: 43px;

          border-radius: 13px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          font-size: 16px;

        }

        .qb-insight-icon.purple {

          color: #6558e8;

          background: #f0efff;

        }

        .qb-insight-icon.green {

          color: #1da779;

          background: #e9f8f1;

        }

        .qb-insight-icon.blue {

          color: #3888d9;

          background: #edf5ff;

        }

        .qb-insight-item > div {

          display: grid;

          gap: 5px;

          min-width: 0;

        }

        .qb-insight-item small {

          color: #9293a3;

          font-size: 11px;

        }

        .qb-insight-item strong {

          color: #302f42;

          font-size: 14px;

          overflow-wrap: anywhere;

        }

        .qb-analytics-disclaimer {

          display: flex;

          gap: 8px;

          align-items: flex-start;

          font-size: 10px;

          line-height: 1.7;

          color: #89899b;

          background: #f8f8fc;

          padding: 12px;

          border-radius: 10px;

          margin: 16px 0 0;

        }

        .qb-analytics-disclaimer i {

          color: #6558e8;

          flex-shrink: 0;

          margin-top: 2px;

        }

        .qb-analytics-empty {

          min-height: 170px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 8px;

          color: #9999a8;

          font-size: 12px;

          text-align: center;

        }

        .qb-analytics-empty i {

          font-size: 25px;

          color: #aaa4ec;

        }

        .qb-analytics-empty strong {

          color: #343348;

        }

        .qb-analytics-loading {

          min-height: 70vh;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 13px;

          color: #9293a3;

          font-size: 13px;

        }

        .qb-loading-spinner {

          width: 32px;

          height: 32px;

          border: 3px solid #eceaff;

          border-top-color: #6558e8;

          border-radius: 50%;

          animation: qb-spin .7s linear infinite;

        }

        @keyframes qb-spin {

          to { transform: rotate(360deg); }

        }

        @media (max-width: 1200px) {

          .qb-analytics-stats {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }

          .qb-analytics-grid,

          .qb-analytics-lower {

            grid-template-columns: minmax(0, 1fr);

          }

          .qb-analytics-status {

            min-height: 300px;

          }

        }

        @media (max-width: 768px) {

          .qb-analytics-page {

            width: 100%;

            padding: 24px 18px 35px;

          }

          .qb-analytics-header {

            align-items: flex-start;

            flex-direction: column;

            gap: 18px;

          }

          .qb-period-wrapper {

            width: 100%;

          }

          .qb-period-wrapper select {

            width: 100%;

          }

          .qb-analytics-bars {

            gap: 4px;

          }

          .qb-status-content {

            gap: 18px;

          }

        }

        @media (max-width: 480px) {

          .qb-analytics-page {

            padding: 20px 13px 30px;

          }

          .qb-analytics-stats {

            grid-template-columns: 1fr;

            gap: 12px;

          }

          .qb-analytics-stats .qb-modern-stat {

            padding: 17px;

          }

          .qb-analytics-header h1 {

            font-size: 27px;

          }

          .qb-status-content {

            flex-direction: column;

            padding: 10px 0;

          }

          .qb-status-legend {

            width: 100%;

            max-width: 230px;

          }

          .qb-service-performance-info {

            align-items: flex-start;

          }

          .qb-analytics-bars {

            gap: 3px;

          }

          .qb-analytics-bar-item > span {

            font-size: 8px;

          }

        }

      `}</style>

    </div>

  );

}
