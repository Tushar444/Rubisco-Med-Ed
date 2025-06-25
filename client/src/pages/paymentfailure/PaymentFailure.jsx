import { Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import "./paymentfailure.css";

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.verified) {
      navigate("/");
    }
  }, [location, navigate]);

  return (
    <div className="paymentContainer failure">
      <div className="paymentCard">
        <h1>❌ Payment Failed</h1>
        <p>Something went wrong. Please try again or contact support.</p>
        <Link to="/" className="paymentBtn">
          Go Back
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailure;
