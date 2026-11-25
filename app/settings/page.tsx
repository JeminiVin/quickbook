

"use client";



import { useEffect, useState, type FormEvent } from "react";

import QuickBookSidebar from "@/app/components/QuickBookSidebar";





type Settings = {

  adminName: string;

  email: string;

  phone: string;

  businessName: string;

  businessEmail: string;

  businessPhone: string;

  address: string;

  timezone: string;

  currency: string;

  slotDuration: string;

  advanceBooking: string;

  cancellationNotice: string;

  startTime: string;

  endTime: string;

  workingDays: string[];

  emailNotifications: boolean;

  bookingNotifications: boolean;

  reminderNotifications: boolean;

  marketingNotifications: boolean;

};



const defaultSettings: Settings = {

  adminName: "QuickBook Admin",

  email: "admin@quickbook.com",

  phone: "",

  businessName: "QuickBook Business",

  businessEmail: "",

  businessPhone: "",

  address: "",

  timezone: "Asia/Kolkata",

  currency: "INR",

  slotDuration: "30",

  advanceBooking: "30",

  cancellationNotice: "24",

  startTime: "09:00",

  endTime: "18:00",

  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  emailNotifications: true,

  bookingNotifications: true,

  reminderNotifications: true,

  marketingNotifications: false,

};



const days = [

  "Monday",

  "Tuesday",

  "Wednesday",

  "Thursday",

  "Friday",

  "Saturday",

  "Sunday",

];



export default function SettingsPage() {

  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const [loaded, setLoaded] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");



  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setError("");

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load settings.");
        }

        if (isMounted) {
          setSettings({
            ...defaultSettings,
            ...(result.data || {}),
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load settings."
          );
        }
      } finally {
        if (isMounted) setLoaded(true);
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = <K extends keyof Settings>(

    key: K,

    value: Settings[K]

  ) => {

    setSettings((previous) => ({

      ...previous,

      [key]: value,

    }));

    setSaved(false);

  };



  const toggleDay = (day: string) => {

    const updated = settings.workingDays.includes(day)

      ? settings.workingDays.filter((item) => item !== day)

      : [...settings.workingDays, day];



    updateField("workingDays", updated);

  };



  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (settings.workingDays.length === 0) {
      alert("Please select at least one working day.");
      return;
    }

    if (settings.startTime >= settings.endTime) {
      alert("Closing time must be later than opening time.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save settings.");
      }

      setSettings({
        ...defaultSettings,
        ...(result.data || settings),
      });
      setSaved(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save settings.";
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to default?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultSettings),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to reset settings.");
      }

      setSettings({
        ...defaultSettings,
        ...(result.data || {}),
      });
      setSaved(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to reset settings.";
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [

    { id: "profile", label: "Profile", icon: "bi-person" },

    { id: "business", label: "Business", icon: "bi-building" },

    { id: "booking", label: "Booking Preferences", icon: "bi-calendar-check" },

    { id: "notifications", label: "Notifications", icon: "bi-bell" },

  ];



  if (!loaded) {

    return (

      <div className="qb-app-shell">

        <QuickBookSidebar active="settings" />

        <main className="qb-modern-page qb-settings-page">

          <div className="qb-settings-loading">

            <span className="qb-settings-spinner" />

            Loading settings...

          </div>

        </main>

      </div>

    );

  }



  return (

    <div className="qb-app-shell qb-settings-app">

      <QuickBookSidebar active="settings" />



      <main className="qb-modern-page qb-settings-page">

        {/* HEADER */}

        <header className="qb-settings-header">

          <div>

            <span className="qb-eyebrow">

              <i className="bi bi-gear" /> WORKSPACE CONFIGURATION

            </span>

            <h1>

              Settings <span>& Preferences</span>

            </h1>

            <p>Manage your account, business and booking preferences.</p>

          </div>



          <button

            type="button"

            className="qb-settings-reset"

            onClick={resetSettings}
            disabled={saving}

          >

            <i className="bi bi-arrow-counterclockwise" />

            Reset Defaults

          </button>

        </header>



        <form onSubmit={handleSave}>
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}


          <div className="qb-settings-layout">

            {/* SETTINGS NAVIGATION */}

            <aside className="qb-settings-nav">

              <div className="qb-settings-nav-heading">

                SETTINGS MENU

              </div>



              {tabs.map((tab) => (

                <button

                  type="button"

                  key={tab.id}

                  className={`qb-settings-nav-item ${activeTab === tab.id ? "active" : ""

                    }`}

                  onClick={() => setActiveTab(tab.id)}

                >

                  <i className={`bi ${tab.icon}`} />

                  <span>{tab.label}</span>

                  {activeTab === tab.id && (

                    <i className="bi bi-chevron-right qb-settings-nav-arrow" />

                  )}

                </button>

              ))}



              <div className="qb-settings-nav-note">

                <i className="bi bi-shield-check" />

                <strong>Your workspace</strong>

                <span>

                  Your preferences are saved in your workspace database.

                </span>

              </div>

            </aside>



            {/* SETTINGS CONTENT */}

            <section className="qb-settings-content">

              {/* PROFILE */}

              {activeTab === "profile" && (

                <div className="qb-settings-section">

                  <div className="qb-settings-section-head">

                    <div className="qb-settings-section-icon purple">

                      <i className="bi bi-person" />

                    </div>

                    <div>

                      <h2>Profile Information</h2>

                      <p>Manage your administrator account details.</p>

                    </div>

                  </div>



                  <div className="qb-profile-preview">

                    <div className="qb-profile-avatar">

                      {settings.adminName.trim().charAt(0).toUpperCase() || "A"}

                    </div>

                    <div>

                      <strong>{settings.adminName || "Your Name"}</strong>

                      <span>Workspace Administrator</span>

                    </div>

                    <span className="qb-profile-badge">

                      <i className="bi bi-patch-check-fill" /> Admin

                    </span>

                  </div>



                  <div className="qb-settings-form-grid">

                    <div className="qb-settings-field">

                      <label>Full Name</label>

                      <input

                        value={settings.adminName}

                        onChange={(e) => updateField("adminName", e.target.value)}

                        placeholder="Enter your name"

                        required

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Email Address</label>

                      <input

                        type="email"

                        value={settings.email}

                        onChange={(e) => updateField("email", e.target.value)}

                        placeholder="admin@example.com"

                        required

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Phone Number</label>

                      <input

                        type="tel"

                        value={settings.phone}

                        onChange={(e) => updateField("phone", e.target.value)}

                        placeholder="+91 00000 00000"

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Timezone</label>

                      <select

                        value={settings.timezone}

                        onChange={(e) => updateField("timezone", e.target.value)}

                      >

                        <option value="Asia/Kolkata">India Standard Time (IST)</option>

                        <option value="Asia/Dubai">Gulf Standard Time</option>

                        <option value="Europe/London">London</option>

                        <option value="America/New_York">Eastern Time</option>

                        <option value="UTC">UTC</option>

                      </select>

                    </div>

                  </div>

                </div>

              )}



              {/* BUSINESS */}

              {activeTab === "business" && (

                <div className="qb-settings-section">

                  <div className="qb-settings-section-head">

                    <div className="qb-settings-section-icon blue">

                      <i className="bi bi-building" />

                    </div>

                    <div>

                      <h2>Business Information</h2>

                      <p>Configure your business identity and contact details.</p>

                    </div>

                  </div>



                  <div className="qb-business-preview">

                    <div className="qb-business-preview-icon">

                      <i className="bi bi-shop" />

                    </div>

                    <div>

                      <strong>{settings.businessName || "Your Business"}</strong>

                      <span>Business workspace</span>

                    </div>

                  </div>



                  <div className="qb-settings-form-grid">

                    <div className="qb-settings-field full">

                      <label>Business Name</label>

                      <input

                        value={settings.businessName}

                        onChange={(e) => updateField("businessName", e.target.value)}

                        placeholder="Enter business name"

                        required

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Business Email</label>

                      <input

                        type="email"

                        value={settings.businessEmail}

                        onChange={(e) => updateField("businessEmail", e.target.value)}

                        placeholder="business@example.com"

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Business Phone</label>

                      <input

                        type="tel"

                        value={settings.businessPhone}

                        onChange={(e) => updateField("businessPhone", e.target.value)}

                        placeholder="+91 00000 00000"

                      />

                    </div>



                    <div className="qb-settings-field full">

                      <label>Business Address</label>

                      <textarea

                        rows={3}

                        value={settings.address}

                        onChange={(e) => updateField("address", e.target.value)}

                        placeholder="Enter complete business address"

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Currency</label>

                      <select

                        value={settings.currency}

                        onChange={(e) => updateField("currency", e.target.value)}

                      >

                        <option value="INR">INR - Indian Rupee (₹)</option>

                        <option value="USD">USD - US Dollar ($)</option>

                        <option value="EUR">EUR - Euro (€)</option>

                        <option value="GBP">GBP - British Pound (£)</option>

                      </select>

                    </div>

                  </div>

                </div>

              )}



              {/* BOOKING */}

              {activeTab === "booking" && (

                <div className="qb-settings-section">

                  <div className="qb-settings-section-head">

                    <div className="qb-settings-section-icon green">

                      <i className="bi bi-calendar-check" />

                    </div>

                    <div>

                      <h2>Booking Preferences</h2>

                      <p>Set your availability and appointment rules.</p>

                    </div>

                  </div>



                  <div className="qb-settings-form-grid">

                    <div className="qb-settings-field">

                      <label>Appointment Slot Duration</label>

                      <select

                        value={settings.slotDuration}

                        onChange={(e) => updateField("slotDuration", e.target.value)}

                      >

                        <option value="15">15 Minutes</option>

                        <option value="30">30 Minutes</option>

                        <option value="45">45 Minutes</option>

                        <option value="60">60 Minutes</option>

                        <option value="90">90 Minutes</option>

                      </select>

                    </div>



                    <div className="qb-settings-field">

                      <label>Advance Booking Window</label>

                      <select

                        value={settings.advanceBooking}

                        onChange={(e) => updateField("advanceBooking", e.target.value)}

                      >

                        <option value="7">7 Days</option>

                        <option value="15">15 Days</option>

                        <option value="30">30 Days</option>

                        <option value="60">60 Days</option>

                        <option value="90">90 Days</option>

                      </select>

                    </div>



                    <div className="qb-settings-field">

                      <label>Cancellation Notice</label>

                      <select

                        value={settings.cancellationNotice}

                        onChange={(e) => updateField("cancellationNotice", e.target.value)}

                      >

                        <option value="2">2 Hours Before</option>

                        <option value="6">6 Hours Before</option>

                        <option value="12">12 Hours Before</option>

                        <option value="24">24 Hours Before</option>

                        <option value="48">48 Hours Before</option>

                      </select>

                    </div>



                    <div className="qb-settings-field">

                      <label>Opening Time</label>

                      <input

                        type="time"

                        value={settings.startTime}

                        onChange={(e) => updateField("startTime", e.target.value)}

                      />

                    </div>



                    <div className="qb-settings-field">

                      <label>Closing Time</label>

                      <input

                        type="time"

                        value={settings.endTime}

                        onChange={(e) => updateField("endTime", e.target.value)}

                      />

                    </div>

                  </div>



                  <div className="qb-settings-subsection">

                    <h3>Working Days</h3>

                    <p>Select the days your business operates.</p>



                    <div className="qb-working-days">

                      {days.map((day) => (

                        <button

                          type="button"

                          key={day}

                          className={`qb-working-day ${settings.workingDays.includes(day) ? "selected" : ""

                            }`}

                          onClick={() => toggleDay(day)}

                        >

                          {settings.workingDays.includes(day) && (

                            <i className="bi bi-check2" />

                          )}

                          {day.slice(0, 3)}

                        </button>

                      ))}

                    </div>

                  </div>

                </div>

              )}



              {/* NOTIFICATIONS */}

              {activeTab === "notifications" && (

                <div className="qb-settings-section">

                  <div className="qb-settings-section-head">

                    <div className="qb-settings-section-icon orange">

                      <i className="bi bi-bell" />

                    </div>

                    <div>

                      <h2>Notification Preferences</h2>

                      <p>Choose which notifications you want to receive.</p>

                    </div>

                  </div>



                  <div className="qb-notification-list">

                    {[

                      {

                        key: "emailNotifications" as const,

                        title: "Email Notifications",

                        description: "Receive important updates through email.",

                        icon: "bi-envelope",

                      },

                      {

                        key: "bookingNotifications" as const,

                        title: "Booking Updates",

                        description: "Get notified when a booking is created or updated.",

                        icon: "bi-calendar-check",

                      },

                      {

                        key: "reminderNotifications" as const,

                        title: "Appointment Reminders",

                        description: "Enable preferences for upcoming appointment reminders.",

                        icon: "bi-alarm",

                      },

                      {

                        key: "marketingNotifications" as const,

                        title: "Product Updates",

                        description: "Receive product news and feature announcements.",

                        icon: "bi-megaphone",

                      },

                    ].map((item) => (

                      <div className="qb-notification-item" key={item.key}>

                        <div className="qb-notification-icon">

                          <i className={`bi ${item.icon}`} />

                        </div>



                        <div className="qb-notification-copy">

                          <strong>{item.title}</strong>

                          <span>{item.description}</span>

                        </div>



                        <label className="qb-switch">

                          <input

                            type="checkbox"

                            checked={settings[item.key]}

                            onChange={(e) => updateField(item.key, e.target.checked)}

                          />

                          <span className="qb-switch-slider" />

                        </label>

                      </div>

                    ))}

                  </div>



                  <div className="qb-notification-note">

                    <i className="bi bi-info-circle" />

                    These are saved notification preferences. Actual email and

                    reminder delivery will be enabled after backend integration.

                  </div>

                </div>

              )}



              {/* FOOTER ACTIONS */}

              <div className="qb-settings-footer">

                <div className="qb-settings-save-status">

                  {saved ? (

                    <>

                      <i className="bi bi-check-circle-fill" />

                      Settings saved successfully

                    </>

                  ) : (

                    <>

                      <i className="bi bi-cloud-check" />

                      Changes are not saved yet

                    </>

                  )}

                </div>



                <button
                  type="submit"
                  className="qb-settings-save"
                  disabled={saving}
                >
                  <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-check2-circle"}`} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </section>

          </div>

        </form>

      </main>



      <style jsx>{`

        .qb-settings-app {

          width: 100%;

          max-width: 100%;

          min-width: 0;

          overflow-x: clip;

        }



        .qb-settings-page {

          flex: 1 1 0%;

          width: 0;

          min-width: 0;

          max-width: 100%;

          padding: 36px clamp(20px, 2.5vw, 42px) 50px;

          overflow-x: clip;

        }



        .qb-settings-header {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 30px;

        }



        .qb-settings-header h1 {

          font-size: clamp(26px, 2.5vw, 34px);

          font-weight: 800;

          letter-spacing: -1.4px;

          color: #20243a;

          margin: 13px 0 8px;

        }



        .qb-settings-header h1 span {

          color: #6558e8;

        }



        .qb-settings-header p {

          color: #9298aa;

          font-size: 13px;

          margin: 0;

        }



        .qb-settings-reset {

          display: flex;

          align-items: center;

          gap: 8px;

          border: 1px solid #e8e8f0;

          background: white;

          color: #65657b;

          padding: 11px 15px;

          border-radius: 10px;

          font-size: 12px;

          font-weight: 650;

          transition: .2s ease;

          white-space: nowrap;

        }



        .qb-settings-reset:hover {

          border-color: #6558e8;

          color: #6558e8;

          background: #f8f7ff;

        }



        .qb-settings-layout {

          display: grid;

          grid-template-columns: 235px minmax(0, 1fr);

          gap: 22px;

          align-items: start;

        }



        .qb-settings-nav,

        .qb-settings-content {

          background: #fff;

          border: 1px solid #ececf3;

          border-radius: 17px;

          box-shadow: 0 5px 22px rgba(35, 35, 70, .035);

        }



        .qb-settings-nav {

          padding: 18px 12px;

          position: sticky;

          top: 20px;

        }



        .qb-settings-nav-heading {

          padding: 4px 10px 13px;

          color: #a0a2b2;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 1px;

        }



        .qb-settings-nav-item {

          width: 100%;

          display: flex;

          align-items: center;

          gap: 11px;

          padding: 12px 10px;

          margin-bottom: 5px;

          border: none;

          border-radius: 10px;

          background: transparent;

          color: #77788d;

          text-align: left;

          font-size: 12px;

          font-weight: 600;

          transition: .2s ease;

        }



        .qb-settings-nav-item > i:first-child {

          font-size: 16px;

        }



        .qb-settings-nav-item:hover {

          color: #6558e8;

          background: #f8f7ff;

        }



        .qb-settings-nav-item.active {

          color: #6558e8;

          background: #f0efff;

          font-weight: 750;

        }



        .qb-settings-nav-arrow {

          margin-left: auto;

          font-size: 11px;

        }



        .qb-settings-nav-note {

          display: flex;

          flex-direction: column;

          gap: 7px;

          margin: 22px 4px 2px;

          padding: 15px 12px;

          border-radius: 12px;

          background: #f7f6ff;

          color: #77778c;

        }



        .qb-settings-nav-note > i {

          color: #6558e8;

          font-size: 19px;

        }



        .qb-settings-nav-note strong {

          font-size: 11px;

          color: #35334e;

        }



        .qb-settings-nav-note span {

          font-size: 10px;

          line-height: 1.6;

        }



        .qb-settings-content {

          min-width: 0;

          padding: 27px;

        }



        .qb-settings-section-head {

          display: flex;

          align-items: center;

          gap: 14px;

          padding-bottom: 23px;

          margin-bottom: 22px;

          border-bottom: 1px solid #f0eff5;

        }



        .qb-settings-section-icon {

          width: 46px;

          height: 46px;

          border-radius: 13px;

          display: grid;

          place-items: center;

          font-size: 19px;

          flex-shrink: 0;

        }



        .qb-settings-section-icon.purple {

          background: #f0efff;

          color: #6558e8;

        }



        .qb-settings-section-icon.blue {

          background: #edf5ff;

          color: #3888d9;

        }



        .qb-settings-section-icon.green {

          background: #e9f8f1;

          color: #1da779;

        }



        .qb-settings-section-icon.orange {

          background: #fff2e6;

          color: #f29942;

        }



        .qb-settings-section-head h2 {

          color: #292940;

          font-size: 17px;

          font-weight: 750;

          margin: 0 0 5px;

        }



        .qb-settings-section-head p {

          color: #9293a3;

          font-size: 11px;

          margin: 0;

        }



        .qb-profile-preview,

        .qb-business-preview {

          display: flex;

          align-items: center;

          gap: 13px;

          padding: 17px;

          margin-bottom: 25px;

          border-radius: 12px;

          background: #fafaff;

          border: 1px solid #f0eff8;

        }



        .qb-profile-avatar {

          width: 49px;

          height: 49px;

          border-radius: 15px;

          display: grid;

          place-items: center;

          background: linear-gradient(135deg, #8175f2, #6558e8);

          color: #fff;

          font-size: 21px;

          font-weight: 800;

        }



        .qb-profile-preview > div:nth-child(2),

        .qb-business-preview > div:nth-child(2) {

          display: flex;

          flex-direction: column;

          gap: 4px;

          min-width: 0;

        }



        .qb-profile-preview strong,

        .qb-business-preview strong {

          font-size: 13px;

          color: #303047;

        }



        .qb-profile-preview span,

        .qb-business-preview span {

          font-size: 11px;

          color: #9293a3;

        }



        .qb-profile-badge {

          display: flex;

          align-items: center;

          gap: 5px;

          margin-left: auto;

          padding: 6px 10px;

          border-radius: 20px;

          color: #6558e8 !important;

          background: #f0efff;

          font-size: 10px !important;

          font-weight: 700;

        }



        .qb-business-preview-icon {

          width: 45px;

          height: 45px;

          border-radius: 12px;

          display: grid;

          place-items: center;

          color: #3888d9;

          background: #edf5ff;

          font-size: 20px;

        }



        .qb-settings-form-grid {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 20px;

        }



        .qb-settings-field {

          display: flex;

          flex-direction: column;

          gap: 8px;

          min-width: 0;

        }



        .qb-settings-field.full {

          grid-column: 1 / -1;

        }



        .qb-settings-field label {

          color: #53536b;

          font-size: 11px;

          font-weight: 700;

        }



        .qb-settings-field input,

        .qb-settings-field select,

        .qb-settings-field textarea {

          width: 100%;

          min-width: 0;

          padding: 12px 13px;

          border: 1px solid #e8e8f0;

          border-radius: 9px;

          outline: none;

          background: #fff;

          color: #34344a;

          font-family: inherit;

          font-size: 12px;

          transition: .2s ease;

        }



        .qb-settings-field input:focus,

        .qb-settings-field select:focus,

        .qb-settings-field textarea:focus {

          border-color: #8175f2;

          box-shadow: 0 0 0 3px rgba(101, 88, 232, .09);

        }



        .qb-settings-field textarea {

          resize: vertical;

        }



        .qb-settings-subsection {

          padding-top: 25px;

          margin-top: 25px;

          border-top: 1px solid #f0eff5;

        }



        .qb-settings-subsection h3 {

          color: #33334a;

          font-size: 13px;

          font-weight: 750;

          margin: 0 0 5px;

        }



        .qb-settings-subsection > p {

          color: #9293a3;

          font-size: 11px;

          margin: 0 0 17px;

        }



        .qb-working-days {

          display: flex;

          flex-wrap: wrap;

          gap: 9px;

        }



        .qb-working-day {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 5px;

          min-width: 65px;

          padding: 10px 12px;

          border: 1px solid #e9e8f1;

          border-radius: 9px;

          background: white;

          color: #77778a;

          font-size: 11px;

          font-weight: 650;

          transition: .2s ease;

        }



        .qb-working-day.selected {

          color: #6558e8;

          border-color: #d8d3ff;

          background: #f3f1ff;

        }



        .qb-notification-list {

          display: flex;

          flex-direction: column;

        }



        .qb-notification-item {

          display: flex;

          align-items: center;

          gap: 14px;

          padding: 19px 0;

          border-bottom: 1px solid #f0eff5;

        }



        .qb-notification-icon {

          width: 42px;

          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 12px;

          background: #f3f1ff;

          color: #6558e8;

          font-size: 17px;

          flex-shrink: 0;

        }



        .qb-notification-copy {

          display: flex;

          flex-direction: column;

          gap: 5px;

          flex: 1;

          min-width: 0;

        }



        .qb-notification-copy strong {

          color: #34344a;

          font-size: 12px;

        }



        .qb-notification-copy span {

          color: #9293a3;

          font-size: 10px;

          line-height: 1.5;

        }



        .qb-switch {

          position: relative;

          display: inline-block;

          width: 42px;

          height: 23px;

          flex-shrink: 0;

        }



        .qb-switch input {

          opacity: 0;

          width: 0;

          height: 0;

        }



        .qb-switch-slider {

          position: absolute;

          inset: 0;

          cursor: pointer;

          border-radius: 30px;

          background: #dedee8;

          transition: .25s;

        }



        .qb-switch-slider::before {

          content: "";

          position: absolute;

          width: 17px;

          height: 17px;

          left: 3px;

          top: 3px;

          background: white;

          border-radius: 50%;

          transition: .25s;

          box-shadow: 0 1px 3px rgba(0,0,0,.15);

        }



        .qb-switch input:checked + .qb-switch-slider {

          background: #6558e8;

        }



        .qb-switch input:checked + .qb-switch-slider::before {

          transform: translateX(19px);

        }



        .qb-switch input:focus-visible + .qb-switch-slider {

          outline: 3px solid rgba(101, 88, 232, .2);

        }



        .qb-notification-note {

          display: flex;

          gap: 9px;

          align-items: flex-start;

          padding: 13px;

          margin-top: 20px;

          border-radius: 10px;

          background: #f7f6ff;

          color: #77758f;

          font-size: 10px;

          line-height: 1.7;

        }



        .qb-notification-note i {

          color: #6558e8;

          flex-shrink: 0;

        }



        .qb-settings-footer {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 15px;

          padding-top: 23px;

          margin-top: 27px;

          border-top: 1px solid #f0eff5;

        }



        .qb-settings-save-status {

          display: flex;

          align-items: center;

          gap: 7px;

          color: #9293a3;

          font-size: 11px;

        }



        .qb-settings-save-status i {

          color: #1da779;

        }



        .qb-settings-save {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          padding: 12px 20px;

          border: none;

          border-radius: 10px;

          background: #6558e8;

          color: white;

          font-size: 12px;

          font-weight: 700;

          box-shadow: 0 5px 13px rgba(101, 88, 232, .2);

          transition: .2s ease;

        }



        .qb-settings-save:hover {

          background: #5547d4;

          transform: translateY(-1px);

        }



        .qb-settings-loading {

          min-height: 70vh;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 12px;

          color: #9293a3;

          font-size: 13px;

        }



        .qb-settings-spinner {

          width: 25px;

          height: 25px;

          border: 3px solid #eceaff;

          border-top-color: #6558e8;

          border-radius: 50%;

          animation: qb-settings-spin .7s linear infinite;

        }



        @keyframes qb-settings-spin {

          to { transform: rotate(360deg); }

        }



        @media (max-width: 1100px) {

          .qb-settings-layout {

            grid-template-columns: 200px minmax(0, 1fr);

          }



          .qb-settings-content {

            padding: 22px;

          }

        }



        @media (max-width: 800px) {

          .qb-settings-layout {

            grid-template-columns: 1fr;

          }



          .qb-settings-nav {

            position: static;

            display: flex;

            flex-wrap: wrap;

            gap: 5px;

          }



          .qb-settings-nav-heading,

          .qb-settings-nav-note {

            display: none;

          }



          .qb-settings-nav-item {

            width: auto;

            flex: 1 1 auto;

            justify-content: center;

          }



          .qb-settings-nav-arrow {

            display: none;

          }

        }



        @media (max-width: 600px) {

          .qb-settings-page {

            width: 100%;

            padding: 22px 15px 35px;

          }



          .qb-settings-header {

            align-items: flex-start;

            flex-direction: column;

          }



          .qb-settings-content {

            padding: 18px;

          }



          .qb-settings-form-grid {

            grid-template-columns: 1fr;

          }



          .qb-settings-field.full {

            grid-column: auto;

          }



          .qb-settings-nav-item {

            flex-basis: calc(50% - 5px);

            justify-content: flex-start;

          }



          .qb-settings-footer {

            align-items: stretch;

            flex-direction: column;

          }



          .qb-settings-save {

            width: 100%;

          }



          .qb-profile-badge {

            display: none !important;

          }

        }

      `}</style>

    </div>

  );

}
