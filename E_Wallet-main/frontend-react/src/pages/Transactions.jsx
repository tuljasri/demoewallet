import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Transactions() {

  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");


      const response = await fetch("http://localhost:8080/transactions", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setMessage("Failed to load transactions");
      }

    } catch (error) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }


  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getDirection = (t) => {
    if (t.sender === null) return "Added";
    if (t.sender == userId) return "Sent";
    return "Received";
  };

  const getStatusBadge = (status) => {
    if (status === "SUCCESS") return "badge bg-success";
    if (status === "FAILED") return "badge bg-danger";
    return "badge bg-warning text-dark";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #A28dd2, #FBC2EB)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px"
    }}>

      <div style={{
        width: "90%",
        maxWidth: "1000px",
        background: "#fff",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.15)"
      }}>

        <div className="d-flex justify-content-between mb-4">
          <h3 className="fw-bold m-0">Transaction History</h3>
          <Link to="/dashboard" className="btn btn-dark btn-sm rounded-pill px-4">
            ← Back
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark text-white rounded">
                <tr>
                  <th className="py-3">Date</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Direction</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t, index) => (
                    <tr key={index}>
                      <td className="text-muted"><small>{formatDate(t.dateTime)}</small></td>
                      <td className="fw-semibold">{t.type?.replace(/_/g, ' ')}</td>
                      <td className="fw-bold">₹ {t.amount}</td>
                      <td>
                        <span className={`badge ${getDirection(t) === 'Added' ? 'bg-primary' : getDirection(t) === 'Sent' ? 'bg-danger' : 'bg-success'} rounded-pill px-3`}>
                          {getDirection(t)}
                        </span>
                      </td>
                      <td>
                        <span className={`${getStatusBadge(t.status)} rounded-pill px-3`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted border-0">
                      No transactions found. Make a transfer to see it here!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {message && (
          <div className="alert alert-danger mt-3 text-center rounded-pill">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}

export default Transactions;
