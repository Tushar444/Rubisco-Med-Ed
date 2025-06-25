import { Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import "./paymentsuccess.css";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.verified) {
      navigate("/");
    }
  }, [location, navigate]);

  return (
    <div className="paymentContainer success">
      <div className="paymentCard">
        <h1>✅ Payment Successful</h1>
        <p>Thank you for your purchase! You now have access to your notes.</p>
        <Link to="/" className="paymentBtn">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
