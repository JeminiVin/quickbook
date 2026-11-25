
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      // Registration creates the account; login separately.
      router.replace("/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="qb-register-page">
      <div className="qb-register-card">
        <div className="qb-register-brand">
          <div className="qb-register-logo">
            <i className="bi bi-calendar2-check-fill"></i>
          </div>
          <h1>QuickBook</h1>
          <p>Appointment Management Platform</p>
        </div>

        <div className="qb-register-heading">
          <h2>Create Admin Account</h2>
          <p>Set up your QuickBook workspace.</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="qb-register-field">
            <label htmlFor="name">Full Name</label>
            <div className="qb-register-input">
              <i className="bi bi-person"></i>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="qb-register-field">
            <label htmlFor="email">Email Address</label>
            <div className="qb-register-input">
              <i className="bi bi-envelope"></i>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="qb-register-field">
            <label htmlFor="password">Password</label>
            <div className="qb-register-input">
              <i className="bi bi-lock"></i>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="qb-register-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="qb-register-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="qb-register-input">
              <i className="bi bi-shield-lock"></i>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="qb-register-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="qb-register-footer">
          <i className="bi bi-shield-check me-1"></i>
          Secure Admin Registration
        </div>

        <p className="qb-register-login">
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </div>

      <style jsx>{`
        .qb-register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          background: linear-gradient(135deg, #f5f4ff, #f8faff);
        }

        .qb-register-card {
          width: 100%;
          max-width: 460px;
          padding: 38px;
          background: #fff;
          border: 1px solid #eeeef5;
          border-radius: 22px;
          box-shadow: 0 20px 60px rgba(35, 30, 90, 0.08);
        }

        .qb-register-brand {
          text-align: center;
          margin-bottom: 30px;
        }

        .qb-register-logo {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          border-radius: 17px;
          background: #6558e8;
          color: white;
          font-size: 24px;
        }

        .qb-register-brand h1 {
          font-size: 25px;
          font-weight: 750;
          color: #202039;
          margin: 0;
        }

        .qb-register-brand p,
        .qb-register-heading p {
          color: #88889a;
          font-size: 13px;
          margin-top: 6px;
        }

        .qb-register-heading {
          margin-bottom: 22px;
        }

        .qb-register-heading h2 {
          font-size: 22px;
          font-weight: 700;
          color: #24243d;
          margin: 0;
        }

        .qb-register-field {
          margin-bottom: 17px;
        }

        .qb-register-field label {
          display: block;
          font-size: 13px;
          font-weight: 650;
          color: #414157;
          margin-bottom: 8px;
        }

        .qb-register-input {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 14px;
          border: 1px solid #e6e6ef;
          border-radius: 10px;
          color: #9292a6;
        }

        .qb-register-input:focus-within {
          border-color: #6558e8;
          box-shadow: 0 0 0 3px rgba(101, 88, 232, 0.09);
        }

        .qb-register-input input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #28283d;
          font-size: 14px;
        }

        .qb-register-toggle {
          border: 0;
          background: transparent;
          color: #85859a;
        }

        .qb-register-submit {
          width: 100%;
          height: 49px;
          margin-top: 8px;
          border: 0;
          border-radius: 10px;
          background: #6558e8;
          color: white;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .qb-register-submit:hover:not(:disabled) {
          background: #5144d2;
          transform: translateY(-1px);
        }

        .qb-register-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .qb-register-footer {
          margin-top: 23px;
          text-align: center;
          color: #85859a;
          font-size: 12px;
        }

        .qb-register-login {
          margin: 18px 0 0;
          text-align: center;
          font-size: 13px;
          color: #77778d;
        }

        .qb-register-login a {
          color: #6558e8;
          font-weight: 650;
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .qb-register-card {
            padding: 28px 22px;
          }
        }
      `}</style>
    </main>
  );
}
