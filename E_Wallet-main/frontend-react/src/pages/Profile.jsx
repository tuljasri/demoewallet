import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Profile() {

  const [user, setUser] = useState({ username: "" });
  const [email, setEmail] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [balance, setBalance] = useState(0);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // 🔁 Fetch profile data
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired. Login again.");
      navigate("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/user/details", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      const data = await res.json();

      console.log("USER DATA:", data);

      if (data.error || data.message) {
        alert(data.error || data.message);
        navigate("/");
        return;
      }

      setUser({ username: data.username || "" });
      setEmail(data.email || "");
      setMfaEnabled(data.mfaEnabled || false);

    } catch (err) {
      console.error(err);
      alert("Backend not reachable / token invalid");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/wallet/balance", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
      }
    } catch (err) { }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 📧 CHANGE EMAIL
  const handleChangeEmail = async () => {

    if (!newEmail) {
      alert("Enter email");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8080/user/change-email", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ email: newEmail })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setShowEmailModal(false);
      setNewEmail("");
      fetchProfile(); // 🔥 refresh from backend
    }
  };

  // 🔐 CHANGE PASSWORD
  const handleChangePassword = async () => {

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8080/user/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #A28dd2, #FBC2EB)",
        padding: "40px",
        fontFamily: "'Inter', sans-serif"
      }}
    >

      {/* NAVBAR */}
      <nav className="d-flex justify-content-between align-items-center px-4 py-3 mb-5 shadow-sm"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderRadius: "16px" }}>
        <h4 className="fw-bolder m-0 text-dark">E-Wallet Workspace</h4>
        <div className="d-flex gap-3">
          <Link to="/dashboard" className="btn btn-outline-dark rounded-pill px-4 fw-semibold">Dashboard</Link>
          <button onClick={handleLogout} className="btn btn-dark rounded-pill px-4 fw-semibold shadow-sm">Logout</button>
        </div>
      </nav>

      {/* MAIN GRID */}
      <div className="container" style={{ maxWidth: "1100px" }}>
        <div className="row g-4 align-items-stretch">

          {/* LEFT: AVATAR CARD */}
          <div className="col-md-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(15px)",
                borderRadius: "24px",
                padding: "50px 30px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                textAlign: "center",
                height: "100%"
              }}
            >
              <div
                className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg"
                style={{ width: "130px", height: "130px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontSize: "3.5rem", fontWeight: "bold" }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>

              <h2 className="fw-bolder mb-1 text-dark">{user.username || "User"}</h2>
              <p className="text-muted fw-medium mb-4 fs-5">{email || "No email linked"}</p>

              <div className={`badge ${mfaEnabled ? 'bg-success' : 'bg-secondary'} rounded-pill px-4 py-2 fw-semibold fs-6 shadow-sm`}>
                {mfaEnabled ? "🔒 MFA Secured" : "⚠️ Standard Security"}
              </div>
            </motion.div>

            {/* NEW QUICK WALLET STATS */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4"
              style={{
                background: "linear-gradient(135deg, #111827, #374151)",
                borderRadius: "24px",
                padding: "35px 30px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                textAlign: "center",
                color: "white"
              }}
            >
              <h6 className="text-white-50 text-uppercase fw-bold mb-2" style={{ letterSpacing: "1.5px", fontSize: "12px" }}>
                Active Wallet Balance
              </h6>
              <h2 className="fw-bolder mb-4" style={{ fontSize: "2.5rem" }}>
                ₹ {Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <Link to="/addmoney" className="btn btn-light rounded-pill px-4 fw-bold shadow-sm w-100 py-2">
                + Add Money
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: SETTINGS */}
          <div className="col-md-7">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                padding: "40px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                height: "100%"
              }}
            >
              <h4 className="fw-bold mb-4 text-dark">Account Settings</h4>

              {/* EMAIL SECTION */}
              <div className="d-flex justify-content-between align-items-center p-4 mb-3" style={{ background: "#f8f9fa", borderRadius: "16px", border: "1px solid #e9ecef" }}>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Email Address</h6>
                  <small className="text-muted">Manage your primary contact email</small>
                </div>
                <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold" onClick={() => setShowEmailModal(true)}>
                  Change
                </button>
              </div>

              {/* PASSWORD SECTION */}
              <div className="d-flex justify-content-between align-items-center p-4 mb-4" style={{ background: "#f8f9fa", borderRadius: "16px", border: "1px solid #e9ecef" }}>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Password</h6>
                  <small className="text-muted">Ensure your account is secure</small>
                </div>
                <button className="btn btn-outline-dark rounded-pill px-4 fw-semibold" onClick={() => setShowPasswordModal(true)}>
                  Update
                </button>
              </div>

              <h4 className="fw-bold mb-3 mt-5 text-dark">Security Preferences</h4>

              {/* MFA SECTION */}
              <div className="d-flex justify-content-between align-items-center p-4" style={{ background: mfaEnabled ? "#f0fdf4" : "#fef2f2", borderRadius: "16px", border: `1px solid ${mfaEnabled ? "#bbf7d0" : "#fecaca"}` }}>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Two-Factor Auth (MFA)</h6>
                  <small className="text-muted">{mfaEnabled ? "Your account is highly protected." : "Add an extra layer of security."}</small>
                </div>
                <button className={`btn ${mfaEnabled ? 'btn-success' : 'btn-danger'} rounded-pill px-4 fw-semibold shadow-sm`} onClick={() => navigate("/mfa-setup")}>
                  {mfaEnabled ? "Manage Settings" : "Enable OTP"}
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* EMAIL MODAL */}
      {showEmailModal && (
        <div className="modal d-block d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
          <div className="modal-dialog" style={{ width: "400px" }}>
            <div className="modal-content p-4" style={{ borderRadius: "20px", border: "none", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>

              <h4 className="fw-bold mb-3 text-dark">Change Email</h4>
              <p className="text-muted small mb-4">Enter a new secure email address for your account.</p>

              <input
                type="email"
                className="form-control mb-4 py-2 px-3"
                style={{ borderRadius: "12px", border: "1px solid #ced4da" }}
                placeholder="Ex. mail@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />

              <button className="btn btn-primary w-100 mb-2 rounded-pill fw-semibold py-2 shadow-sm" onClick={handleChangeEmail}>
                Update Email
              </button>

              <button
                className="btn btn-light w-100 rounded-pill fw-semibold py-2"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal d-block d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
          <div className="modal-dialog" style={{ width: "400px" }}>
            <div className="modal-content p-4" style={{ borderRadius: "20px", border: "none", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>

              <h4 className="fw-bold mb-3 text-dark">Update Password</h4>

              <input
                type="password"
                className="form-control mb-3 py-2 px-3"
                style={{ borderRadius: "12px", border: "1px solid #ced4da" }}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                className="form-control mb-3 py-2 px-3"
                style={{ borderRadius: "12px", border: "1px solid #ced4da" }}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                className="form-control mb-4 py-2 px-3"
                style={{ borderRadius: "12px", border: "1px solid #ced4da" }}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button className="btn btn-dark w-100 rounded-pill fw-semibold py-2 mb-2 shadow-sm" onClick={handleChangePassword}>
                Save Password
              </button>

              <button
                className="btn btn-light w-100 rounded-pill fw-semibold py-2"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;
