
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="qb-login-page">
      <div className="qb-login-card">
        <div className="qb-login-brand">
          <div className="qb-login-logo">
            <i className="bi bi-calendar2-check-fill"></i>
          </div>
          <h1>QuickBook</h1>
          <p>Appointment Management Platform</p>
        </div>

        <div className="qb-login-heading">
          <h2>Welcome back!</h2>
          <p>Sign in to access your admin dashboard.</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="qb-login-field">
            <label htmlFor="email">Email Address</label>
            <div className="qb-login-input">
              <i className="bi bi-envelope"></i>
              <input
                id="email"
                type="email"
                placeholder="admin@quickbook.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="qb-login-field">
            <label htmlFor="password">Password</label>
            <div className="qb-login-input">
              <i className="bi bi-lock"></i>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="qb-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`bi ${
                    showPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="qb-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="qb-login-footer">
          <i className="bi bi-shield-lock me-1"></i>
          Secure Admin Access
        </div>

        <Link href="/" className="qb-login-back">
          Back to QuickBook
        </Link>
      </div>

      <style jsx>{`
        .qb-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          background: linear-gradient(135deg, #f5f4ff, #f8faff);
        }

        .qb-login-card {
          width: 100%;
          max-width: 440px;
          padding: 42px;
          background: #fff;
          border: 1px solid #eeeef5;
          border-radius: 22px;
          box-shadow: 0 20px 60px rgba(35, 30, 90, 0.08);
        }

        .qb-login-brand {
          text-align: center;
          margin-bottom: 36px;
        }

        .qb-login-logo {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 17px;
          background: #6558e8;
          color: white;
          font-size: 25px;
        }

        .qb-login-brand h1 {
          font-size: 25px;
          font-weight: 750;
          color: #202039;
          margin: 0;
        }

        .qb-login-brand p,
        .qb-login-heading p {
          color: #88889a;
          font-size: 13px;
          margin-top: 6px;
        }

        .qb-login-heading {
          margin-bottom: 25px;
        }

        .qb-login-heading h2 {
          font-size: 23px;
          font-weight: 700;
          color: #24243d;
          margin: 0;
        }

        .qb-login-field {
          margin-bottom: 20px;
        }

        .qb-login-field label {
          display: block;
          font-size: 13px;
          font-weight: 650;
          color: #414157;
          margin-bottom: 8px;
        }

        .qb-login-input {
          height: 49px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 14px;
          border: 1px solid #e6e6ef;
          border-radius: 10px;
          color: #9292a6;
        }

        .qb-login-input:focus-within {
          border-color: #6558e8;
          box-shadow: 0 0 0 3px rgba(101, 88, 232, 0.09);
        }

        .qb-login-input input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #28283d;
          font-size: 14px;
        }

        .qb-password-toggle {
          border: 0;
          background: transparent;
          color: #85859a;
        }

        .qb-login-submit {
          width: 100%;
          height: 49px;
          margin-top: 8px;
          border: 0;
          border-radius: 10px;
          background: #6558e8;
          color: #fff;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .qb-login-submit:hover:not(:disabled) {
          background: #5144d2;
          transform: translateY(-1px);
        }

        .qb-login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .qb-login-footer {
          margin-top: 25px;
          text-align: center;
          color: #85859a;
          font-size: 12px;
        }

        .qb-login-back {
          display: block;
          margin-top: 18px;
          text-align: center;
          color: #6558e8;
          font-size: 13px;
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .qb-login-card {
            padding: 28px 22px;
          }
        }
      `}</style>
    </main>
  );
}
