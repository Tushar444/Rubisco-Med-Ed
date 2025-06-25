import "./App.css";
import { Routes, Route } from "react-router";
import Home from "./pages/home/Home";
import Subject from "./pages/subject/Subject";
import PaymentSuccess from "./pages/paymentsuccess/PaymentSuccess";
import PaymentFailure from "./pages/paymentfailure/PaymentFailure";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subject />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
      </Routes>
    </div>
  );
};

export default App;
