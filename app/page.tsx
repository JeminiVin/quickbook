"use client"
import Link from "next/link";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const calendarEvents = [
  { day: 0, time: "09:00", title: "Web Development", color: "blue" },
  { day: 0, time: "11:00", title: "UI Consultation", color: "purple" },
  { day: 1, time: "10:00", title: "Business Meeting", color: "orange" },
  { day: 1, time: "14:00", title: "Project Discussion", color: "blue" },
  { day: 2, time: "09:30", title: "Design Review", color: "green" },
  { day: 2, time: "13:00", title: "Client Meeting", color: "purple" },
  { day: 3, time: "10:00", title: "Consultation", color: "blue" },
  { day: 3, time: "15:00", title: "Development Call", color: "orange" },
  { day: 4, time: "11:00", title: "Project Review", color: "green" },
  { day: 4, time: "14:00", title: "Team Meeting", color: "blue" },
  { day: 5, time: "10:00", title: "Appointment", color: "purple" },
];

const features = [
  {
    icon: "bi-calendar2-check",
    title: "Easy Appointment Booking",
    description:
      "Let your customers book appointments online in just a few clicks.",
  },
  {
    icon: "bi-clock-history",
    title: "Smart Scheduling",
    description:
      "Manage your availability, working hours and appointment slots easily.",
  },
  {
    icon: "bi-graph-up-arrow",
    title: "Business Analytics",
    description:
      "Understand your bookings and track your business performance.",
  },
];

export default function Home() {
  return (
    <main className="landing-page">
      {/* NAVBAR */}
      <nav className="landing-navbar">
        <div className="landing-container nav-inner">
          <Link href="/" className="landing-brand">
            <span className="brand-icon">
              <i className="bi bi-calendar2-check-fill"></i>
            </span>
            QuickBook<span className="brand-dot">.</span>
          </Link>

          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className="nav-actions">
            <Link href="/login" className="nav-login">
              Admin Login
            </Link>
            <Link href="/register" className="nav-signup">
              Sign Up <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero" id="about">
        <div className="hero-glow"></div>

        <div className="landing-container hero-content">
          <div className="hero-tag">
            <span className="tag-dot"></span>
            Your Smart Scheduling Solution
          </div>

          <h1>
            Streamline Your <span>Appointment</span>
            <br className="desktop-break" />{" "}
            <span>Booking Services</span> Today
          </h1>

          <p className="hero-description">
            Easily manage client bookings with our seamless appointment
            scheduling platform. Save time, reduce no-shows, and keep your
            business running smoothly.
          </p>

          <div className="hero-buttons">
            <Link href="/book" className="hero-primary-btn">
              Get Started <i className="bi bi-arrow-right"></i>
            </Link>

            <a href="#features" className="hero-secondary-btn">
              Learn More
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <span>V</span>
              <span>A</span>
              <span>R</span>
              <span>S</span>
            </div>
            <p>
              <strong>Simple scheduling.</strong> Better business management.
            </p>
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="landing-container preview-container">
          <div className="dashboard-preview">
            <div className="preview-sidebar">
              <div className="preview-logo">
                <span><i className="bi bi-calendar2-check-fill"></i></span>
                QuickBook
              </div>

              <div className="preview-user">
                <div className="preview-avatar">V</div>
                <div>
                  <strong>Vinayak</strong>
                  <small>Administrator</small>
                </div>
                <i className="bi bi-chevron-down"></i>
              </div>

              <div className="preview-menu-label">WORKSPACE</div>

              <div className="preview-menu active">
                <i className="bi bi-grid"></i> Dashboard
              </div>
              <div className="preview-menu">
                <i className="bi bi-calendar3"></i> Calendar
              </div>
              <div className="preview-menu">
                <i className="bi bi-journal-check"></i> Bookings
              </div>
              <div className="preview-menu">
                <i className="bi bi-people"></i> Customers
              </div>
              <div className="preview-menu">
                <i className="bi bi-briefcase"></i> Services
              </div>

              <div className="preview-menu-label preview-bottom-label">
                GENERAL
              </div>
              <div className="preview-menu">
                <i className="bi bi-gear"></i> Settings
              </div>
            </div>

            <div className="preview-main">
              <div className="preview-topbar">
                <div>
                  <strong>Calendar</strong>
                  <small>Manage your appointments</small>
                </div>
                <div className="preview-top-actions">
                  <span className="preview-search">
                    <i className="bi bi-search"></i> Search
                  </span>
                  <span className="preview-notification">
                    <i className="bi bi-bell"></i>
                  </span>
                  <span className="preview-profile">V</span>
                </div>
              </div>

              <div className="preview-calendar-header">
                <div>
                  <h3>January 2026</h3>
                  <p>Your schedule at a glance</p>
                </div>
                <div className="preview-calendar-actions">
                  <button type="button"><i className="bi bi-chevron-left"></i></button>
                  <button type="button"><i className="bi bi-chevron-right"></i></button>
                  <button type="button" className="preview-today">Today</button>
                  <button type="button" className="preview-add">
                    <i className="bi bi-plus-lg"></i> Add Event
                  </button>
                </div>
              </div>

              <div className="preview-calendar">
                <div className="calendar-week">
                  {weekDays.map((day) => (
                    <div key={day} className="calendar-week-day">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="calendar-numbers">
                  {[12, 13, 14, 15, 16, 17, 18].map((number, index) => (
                    <div key={number} className="calendar-number">
                      <span className={index === 2 ? "selected-date" : ""}>
                        {number}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="calendar-events-grid">
                  {weekDays.map((day, index) => (
                    <div className="calendar-event-column" key={day}>
                      {calendarEvents
                        .filter((event) => event.day === index)
                        .map((event, eventIndex) => (
                          <div
                            className={`calendar-event event-${event.color}`}
                            key={`${event.day}-${eventIndex}`}
                          >
                            <small>{event.time}</small>
                            <span>{event.title}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>

                <div className="preview-calendar-footer">
                  <span><i className="event-dot blue-dot"></i> Confirmed</span>
                  <span><i className="event-dot purple-dot"></i> Pending</span>
                  <span><i className="event-dot orange-dot"></i> Upcoming</span>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-floating-card">
            <span className="floating-icon">
              <i className="bi bi-check-lg"></i>
            </span>
            <div>
              <strong>Appointment Managed!</strong>
              <small>Your schedule is organized.</small>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features" id="features">
        <div className="landing-container">
          <div className="section-heading">
            <span>POWERFUL FEATURES</span>
            <h2>Everything you need to manage bookings</h2>
            <p>
              A smarter way to organize appointments and grow your business.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#how-it-works">
                  Explore feature <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-container how-inner">
          <div>
            <span className="section-kicker">HOW IT WORKS</span>
            <h2>Appointments made simple.</h2>
            <p>
              Your customers choose a service, select a convenient time,
              and submit their appointment request. You manage everything
              from one organized dashboard.
            </p>
            <Link href="/book" className="hero-primary-btn">
              Book an Appointment <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="how-steps">
            <div className="how-step">
              <span>01</span>
              <div>
                <h3>Choose a service</h3>
                <p>Browse available services and select what you need.</p>
              </div>
            </div>
            <div className="how-step">
              <span>02</span>
              <div>
                <h3>Select date and time</h3>
                <p>Pick a suitable date and an available time slot.</p>
              </div>
            </div>
            <div className="how-step">
              <span>03</span>
              <div>
                <h3>Confirm your booking</h3>
                <p>Submit your details and receive your booking request.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" id="pricing">
        <div className="landing-container cta-content">
          <span>READY TO GET STARTED?</span>
          <h2>Make appointment management effortless.</h2>
          <p>
            Start managing your appointments with QuickBook today.
          </p>
          <Link href="/book" className="cta-button">
            Book Your Appointment <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <Link href="/" className="landing-brand">
            <span className="brand-icon">
              <i className="bi bi-calendar2-check-fill"></i>
            </span>
            QuickBook<span className="brand-dot">.</span>
          </Link>

          <p>© {new Date().getFullYear()} QuickBook. All rights reserved.</p>

          <div>
            <Link href="/login">Admin Login</Link>
            <Link href="/register">Sign Up</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          overflow: hidden;
          color: #202b43;
          background: #fff;
          font-family: Arial, Helvetica, sans-serif;
        }

        .landing-container {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .landing-navbar {
          position: relative;
          z-index: 5;
          height: 76px;
          background: rgba(255, 255, 255, .96);
          border-bottom: 1px solid #edf0f6;
        }

        .nav-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #202b43;
          font-size: 21px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #fff;
          background: #2675e9;
          font-size: 17px;
        }

        .brand-dot {
          color: #2675e9;
          margin-left: -8px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .nav-links a,
        .nav-login {
          color: #606b7f;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: color .2s ease;
        }

        .nav-links a:hover,
        .nav-login:hover {
          color: #2675e9;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .nav-signup {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 21px;
          border-radius: 8px;
          background: #2675e9;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 5px 14px rgba(38, 117, 233, .15);
          transition: .2s ease;
        }

        .nav-signup:hover,
        .hero-primary-btn:hover {
          background: #155ecb;
          color: #fff;
          transform: translateY(-2px);
        }

        .landing-hero {
          position: relative;
          padding: 66px 0 100px;
          background:
            radial-gradient(ellipse at 50% 40%, #e5f0ff 0%, #edf4ff 45%, #f7f9ff 100%);
          text-align: center;
        }

        .hero-glow {
          position: absolute;
          top: 100px;
          left: 50%;
          width: 650px;
          height: 400px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: rgba(110, 164, 255, .12);
          filter: blur(70px);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 13px;
          border: 1px solid #dce9ff;
          border-radius: 30px;
          background: rgba(255, 255, 255, .8);
          color: #3979d7;
          font-size: 11px;
          font-weight: 700;
        }

        .tag-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3985f2;
          box-shadow: 0 0 0 4px rgba(57, 133, 242, .12);
        }

        .hero-content h1 {
          margin: 23px auto 15px;
          color: #202938;
          font-size: clamp(35px, 5.1vw, 59px);
          line-height: 1.16;
          letter-spacing: -2.6px;
          font-weight: 800;
        }

        .hero-content h1 span {
          color: #2878eb;
        }

        .hero-description {
          max-width: 620px;
          margin: 0 auto;
          color: #738097;
          font-size: 14px;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          justify-content: center;
          gap: 13px;
          margin-top: 26px;
        }

        .hero-primary-btn,
        .hero-secondary-btn {
          min-height: 45px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 22px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: .2s ease;
        }

        .hero-primary-btn {
          background: #2675e9;
          color: #fff;
          box-shadow: 0 7px 18px rgba(38, 117, 233, .18);
        }

        .hero-secondary-btn {
          border: 1px solid #e1e7f0;
          background: #fff;
          color: #3c485c;
        }

        .hero-secondary-btn:hover {
          border-color: #2675e9;
          color: #2675e9;
        }

        .hero-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-top: 25px;
        }

        .trust-avatars {
          display: flex;
          padding-left: 7px;
        }

        .trust-avatars span {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          margin-left: -7px;
          border: 2px solid #f1f6ff;
          border-radius: 50%;
          background: #dce9ff;
          color: #2866bc;
          font-size: 9px;
          font-weight: 800;
        }

        .trust-avatars span:nth-child(2) { background: #f9e5d9; color: #a65e3e; }
        .trust-avatars span:nth-child(3) { background: #e5defe; color: #6a52ba; }
        .trust-avatars span:nth-child(4) { background: #d9f0e4; color: #34815c; }

        .hero-trust p {
          margin: 0;
          color: #7d8ba1;
          font-size: 10px;
        }

        .hero-trust strong {
          color: #52627a;
        }

        .preview-container {
          position: relative;
          z-index: 2;
          margin-top: 48px;
          text-align: left;
        }

        .dashboard-preview {
          min-height: 420px;
          display: grid;
          grid-template-columns: 205px minmax(0, 1fr);
          overflow: hidden;
          border: 1px solid #e0e8f3;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 25px 65px rgba(57, 90, 145, .13);
        }

        .preview-sidebar {
          padding: 22px 14px;
          border-right: 1px solid #edf0f5;
          background: #fff;
        }

        .preview-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 25px;
          color: #34445d;
          font-size: 14px;
          font-weight: 800;
        }

        .preview-logo span {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #2675e9;
          color: white;
          font-size: 12px;
        }

        .preview-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 5px 18px;
          border-bottom: 1px solid #edf0f5;
        }

        .preview-avatar,
        .preview-profile {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #e4edff;
          color: #2675e9;
          font-size: 11px;
          font-weight: 800;
        }

        .preview-user strong,
        .preview-user small {
          display: block;
        }

        .preview-user strong { font-size: 10px; }
        .preview-user small { margin-top: 3px; color: #9ba5b5; font-size: 8px; }
        .preview-user > i { margin-left: auto; color: #a3adbc; font-size: 10px; }

        .preview-menu-label {
          margin: 20px 0 10px 7px;
          color: #a4adbb;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .preview-menu {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 3px 0;
          padding: 10px 9px;
          border-radius: 7px;
          color: #7d899c;
          font-size: 10px;
        }

        .preview-menu i { font-size: 13px; }

        .preview-menu.active {
          background: #edf4ff;
          color: #2675e9;
          font-weight: 700;
        }

        .preview-bottom-label { margin-top: 35px; }

        .preview-main {
          min-width: 0;
          padding: 19px 22px;
          background: #fff;
        }

        .preview-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 17px;
          border-bottom: 1px solid #edf0f5;
        }

        .preview-topbar strong,
        .preview-topbar small { display: block; }

        .preview-topbar strong { font-size: 13px; color: #34445d; }
        .preview-topbar small { margin-top: 4px; color: #a0aabc; font-size: 9px; }

        .preview-top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #8290a3;
          font-size: 10px;
        }

        .preview-search {
          padding: 8px 12px;
          border: 1px solid #edf0f5;
          border-radius: 6px;
          color: #a0aabc;
        }

        .preview-notification { font-size: 15px; }
        .preview-profile { width: 25px; height: 25px; }

        .preview-calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 20px 0;
        }

        .preview-calendar-header h3 {
          margin: 0;
          color: #34445d;
          font-size: 15px;
          font-weight: 800;
        }

        .preview-calendar-header p {
          margin: 5px 0 0;
          color: #9aa5b6;
          font-size: 9px;
        }

        .preview-calendar-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preview-calendar-actions button {
          height: 27px;
          padding: 0 9px;
          border: 1px solid #e9edf4;
          border-radius: 5px;
          background: #fff;
          color: #66758c;
          font-size: 9px;
        }

        .preview-calendar-actions .preview-add {
          border-color: #2675e9;
          background: #2675e9;
          color: #fff;
        }

        .preview-calendar {
          overflow: hidden;
          border: 1px solid #edf0f5;
          border-radius: 8px;
        }

        .calendar-week,
        .calendar-numbers,
        .calendar-events-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }

        .calendar-week-day {
          padding: 12px 3px;
          border-bottom: 1px solid #edf0f5;
          background: #fafbfe;
          color: #8996a9;
          font-size: 9px;
          font-weight: 700;
          text-align: center;
        }

        .calendar-number {
          min-height: 35px;
          padding: 8px 7px;
          border-right: 1px solid #f0f2f7;
          color: #68768b;
          font-size: 10px;
        }

        .calendar-number:last-child { border-right: 0; }

        .selected-date {
          display: inline-grid;
          width: 21px;
          height: 21px;
          place-items: center;
          margin-top: -5px;
          border-radius: 50%;
          background: #2675e9;
          color: #fff;
          font-weight: 800;
        }

        .calendar-event-column {
          min-height: 190px;
          padding: 4px;
          border-top: 1px solid #edf0f5;
          border-right: 1px solid #edf0f5;
        }

        .calendar-event-column:last-child { border-right: 0; }

        .calendar-event {
          margin-bottom: 6px;
          padding: 7px 5px;
          overflow: hidden;
          border-left: 2px solid;
          border-radius: 3px;
          font-size: 8px;
          line-height: 1.4;
        }

        .calendar-event small,
        .calendar-event span { display: block; }
        .calendar-event small { margin-bottom: 3px; opacity: .75; font-size: 7px; }
        .calendar-event span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .event-blue { border-color: #3985ed; background: #eaf2ff; color: #326dc0; }
        .event-purple { border-color: #9173e9; background: #f0edff; color: #7255c6; }
        .event-orange { border-color: #efa65c; background: #fff3e6; color: #b97936; }
        .event-green { border-color: #48b78b; background: #e9f8f1; color: #358765; }

        .preview-calendar-footer {
          display: flex;
          gap: 18px;
          padding: 12px;
          border-top: 1px solid #edf0f5;
          color: #8996a9;
          font-size: 8px;
        }

        .preview-calendar-footer span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .event-dot {
          width: 7px;
          height: 7px;
          display: inline-block;
          border-radius: 50%;
        }

        .blue-dot { background: #3985ed; }
        .purple-dot { background: #9173e9; }
        .orange-dot { background: #efa65c; }

        .preview-floating-card {
          position: absolute;
          right: -20px;
          bottom: -25px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 19px;
          border: 1px solid #e9edf5;
          border-radius: 11px;
          background: white;
          box-shadow: 0 12px 35px rgba(40, 60, 100, .12);
        }

        .floating-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e5f8ef;
          color: #2da875;
        }

        .preview-floating-card strong,
        .preview-floating-card small { display: block; }

        .preview-floating-card strong { color: #34445d; font-size: 10px; }
        .preview-floating-card small { margin-top: 4px; color: #929eaf; font-size: 9px; }

        .landing-features {
          padding: 105px 0;
          background: #fff;
        }

        .section-heading {
          max-width: 600px;
          margin: 0 auto 45px;
          text-align: center;
        }

        .section-heading > span,
        .section-kicker {
          color: #2675e9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .section-heading h2,
        .how-inner h2 {
          margin: 13px 0;
          color: #202b43;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .section-heading p,
        .how-inner > div:first-child > p {
          color: #8490a3;
          font-size: 13px;
          line-height: 1.8;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .feature-card {
          padding: 28px;
          border: 1px solid #edf0f5;
          border-radius: 12px;
          background: #fff;
          transition: .25s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: #d7e6ff;
          box-shadow: 0 15px 35px rgba(39, 92, 165, .07);
        }

        .feature-icon {
          width: 47px;
          height: 47px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #edf4ff;
          color: #2675e9;
          font-size: 21px;
        }

        .feature-card h3 {
          margin: 22px 0 10px;
          color: #2d3b52;
          font-size: 16px;
          font-weight: 750;
        }

        .feature-card p {
          min-height: 55px;
          color: #8995a7;
          font-size: 12px;
          line-height: 1.8;
        }

        .feature-card a {
          display: inline-flex;
          gap: 8px;
          margin-top: 12px;
          color: #2675e9;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
        }

        .landing-how {
          padding: 90px 0;
          background: #f6f8fc;
        }

        .how-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 75px;
        }

        .how-inner > div:first-child > p {
          max-width: 450px;
          margin-bottom: 25px;
        }

        .how-steps {
          display: grid;
          gap: 15px;
        }

        .how-step {
          display: flex;
          gap: 18px;
          padding: 19px;
          border: 1px solid #e9edf5;
          border-radius: 10px;
          background: white;
        }

        .how-step > span {
          color: #2675e9;
          font-size: 19px;
          font-weight: 800;
        }

        .how-step h3 {
          margin: 0 0 6px;
          color: #34445d;
          font-size: 14px;
        }

        .how-step p {
          margin: 0;
          color: #8995a7;
          font-size: 11px;
          line-height: 1.7;
        }

        .landing-cta {
          padding: 80px 0;
          background: linear-gradient(120deg, #246fe0, #428af3);
          color: #fff;
          text-align: center;
        }

        .cta-content > span {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          opacity: .8;
        }

        .cta-content h2 {
          max-width: 650px;
          margin: 14px auto;
          font-size: clamp(27px, 4vw, 39px);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .cta-content p {
          margin-bottom: 25px;
          color: rgba(255, 255, 255, .8);
          font-size: 13px;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 23px;
          border-radius: 8px;
          background: #fff;
          color: #2675e9;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: .2s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          color: #155ecb;
        }

        .landing-footer {
          padding: 24px 0;
          background: #fff;
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .footer-inner p {
          margin: 0;
          color: #929daf;
          font-size: 10px;
        }

        .footer-inner > div {
          display: flex;
          gap: 20px;
        }

        .footer-inner > div a {
          color: #68768b;
          font-size: 11px;
          text-decoration: none;
        }

        @media (max-width: 850px) {
          .nav-links { gap: 17px; }
          .nav-links a { font-size: 11px; }
          .dashboard-preview { grid-template-columns: 155px minmax(0, 1fr); }
          .preview-sidebar { padding: 17px 9px; }
          .preview-main { padding: 15px 12px; }
          .calendar-event-column { min-height: 160px; }
          .preview-floating-card { right: 0; }
          .how-inner { gap: 35px; }
        }

        @media (max-width: 650px) {
          .landing-container { width: calc(100% - 30px); }
          .landing-navbar { height: 65px; }
          .nav-links { display: none; }
          .nav-actions { gap: 12px; }
          .nav-login { font-size: 10px; }
          .nav-signup { padding: 10px 12px; font-size: 10px; }
          .landing-brand { font-size: 18px; }
          .brand-icon { width: 32px; height: 32px; }
          .landing-hero { padding: 55px 0 75px; }
          .hero-content h1 { letter-spacing: -1.5px; }
          .desktop-break { display: none; }
          .hero-description { max-width: 450px; font-size: 12px; }
          .hero-trust p { font-size: 9px; }
          .preview-container { margin-top: 38px; }
          .dashboard-preview { grid-template-columns: 1fr; }
          .preview-sidebar { display: none; }
          .preview-main { padding: 14px 10px; }
          .preview-calendar-header { align-items: flex-start; flex-direction: column; }
          .preview-calendar-actions { flex-wrap: wrap; }
          .preview-search { display: none; }
          .calendar-week-day { font-size: 8px; }
          .calendar-event-column { min-height: 140px; padding: 2px; }
          .calendar-event { padding: 5px 3px; font-size: 7px; }
          .calendar-event span { font-size: 6px; }
          .preview-calendar-footer { gap: 9px; font-size: 7px; }
          .preview-floating-card { right: 5px; bottom: -37px; padding: 10px; }
          .preview-floating-card strong { font-size: 9px; }
          .preview-floating-card small { font-size: 8px; }
          .landing-features { padding: 75px 0; }
          .feature-grid { grid-template-columns: 1fr; }
          .feature-card p { min-height: auto; }
          .landing-how { padding: 70px 0; }
          .how-inner { grid-template-columns: 1fr; gap: 35px; }
          .landing-cta { padding: 65px 0; }
          .footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>
    </main>
  );
}
