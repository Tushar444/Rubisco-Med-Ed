import Navbar from "../../components/navbar/Navbar";
import PdfViewer from "../../components/pdfviewer/PdfViewer.jsx";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { makeRequest } from "../../../axios.js";
import { useAuth0 } from "@auth0/auth0-react";
import "./subject.css";

const Subject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subjectName || "No subject chosen";
  const [modelOpen, setModelOpen] = useState(false);
  const [chapterId, setChapterId] = useState(0);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await makeRequest.get(`/chapters/${subject}`);
        setChapters(res.data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
      }
    };

    if (subject !== "No subject chosen") {
      fetchChapters();
    }
  }, [subject]);

  const handleClick = (id) => {
    setModelOpen(true);
    setChapterId(id);
  };

  const { user, isAuthenticated, loginWithPopup } = useAuth0();

  const handleBuy = async (chapter, amount) => {
    const audience = import.meta.env.VITE_AUTH0_API_IDENTIFIER;
    if (!isAuthenticated) {
      try {
        await loginWithPopup({
          authorizationParams: {
            audience: audience,
            scope: "openid profile email offline_access",
          },
        });
      } catch (error) {
        console.error("Login failed:", error);
      }
    }

    const res = await makeRequest.post("/payment", {
      amount,
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      amount: amount,
      currency: "INR",
      name: "Rubisco Med Ed",
      description: "",
      order_id: res.data.order.id,
      handler: async function (response) {
        try {
          const verification = await makeRequest.post("/payment/verify", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            user_id: user.sub,
            chapter_id: chapter.id,
          });

          if (verification.data.status === "success") {
            navigate("/payment-success", { state: { verified: true } });
          } else {
            navigate("/payment-failure", { state: { verified: true } });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          navigate("/payment-failure", { state: { verified: true } });
        }
      },
      theme: {
        color: "#a240e0",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="subjectContainer">
      <Navbar />
      <div className="subjectName">{subject}</div>
      <div className="chapterListWrapper">
        <div className="chapterList">
          <ul>
            {chapters.map((chapter, index) => (
              <div key={index} className="chapter">
                <li onClick={() => handleClick(chapter.id)}>
                  {chapter.chapter_name}
                </li>
                <button
                  className="buyBtn"
                  onClick={() => handleBuy(chapter, chapter.price)}
                >
                  ₹{chapter.price}
                </button>
              </div>
            ))}
          </ul>
        </div>
      </div>
      {modelOpen && (
        <div className="modalOverlay" onClick={() => setModelOpen(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeButton" onClick={() => setModelOpen(false)}>
              &times;
            </button>
            <PdfViewer chapterId={chapterId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject;
