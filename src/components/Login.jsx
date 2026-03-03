import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "./logo.png";

const Login = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err?.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else {
        setError(err?.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: #f4f4f5;
          min-height: 100vh;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.6s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card {
          width: 100%;
          max-width: 540px;
          background: #ffffff;
          border-radius: 26px;
          padding: 40px 36px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.06);
          transition: 0.3s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.08);
        }

        .logo {
          width: clamp(180px, 50vw, 280px);
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto 16px;
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          color: #111;
          text-align: center;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 15px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        /* AUTHENTIC GOOGLE BUTTON */
        .google-btn {
          width: 100%;
          height: 58px;
          border-radius: 14px;
          border: 1px solid #dadce0;
          background: #ffffff;
          color: #3c4043;
          font-size: 15.5px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .google-btn:hover:not(:disabled) {
          background: #f8f9fa;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .google-btn:active:not(:disabled) {
          background: #f1f3f4;
        }

        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid #e0e0e0;
          border-top: 2.5px solid #4285f4;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .features {
          margin-top: 28px;
          display: grid;
          gap: 12px;
          font-size: 14.5px;
          color: #374151;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feature-item svg {
          width: 18px;
          height: 18px;
          color: #22c55e;
          flex-shrink: 0;
        }

        .error {
          margin-top: 18px;
          padding: 12px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 10px;
          text-align: center;
          font-size: 14px;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
        }

        @media (max-width: 480px) {
          .card {
            padding: 32px 22px;
          }

          .logo {
            width: clamp(150px, 55vw, 220px);
            margin-bottom: 12px;
          }

          .title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="card">
          <img src={logo} alt="Expense Tracker Logo" className="logo" />

          <div className="title">Welcome Back</div>
          <div className="subtitle">
            Securely track expenses, split bills, and get powerful insights instantly.
          </div>

          <button
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width="22"
                  height="22"
                />
                Continue with Google
              </>
            )}
          </button>

          {error && <div className="error">{error}</div>}

          <div className="features">
            <div className="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Know exactly where your money goes every month
            </div>
            <div className="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Share and track expenses with family
            </div>
            <div className="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Beautiful, clean spending insights
            </div>
            <div className="feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Never lose track of borrowed money
            </div>
          </div>

          <div className="footer">
            © 2026 Expense Tracker
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;