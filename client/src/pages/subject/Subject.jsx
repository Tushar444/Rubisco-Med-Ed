import Navbar from "../../components/navbar/Navbar";
import PdfViewer from "../../components/pdfviewer/PdfViewer.jsx";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { makeRequest } from "../../../axios.js";
import { useAuth0 } from "@auth0/auth0-react";
import "./subject.css";

const Subject = () => {
  const audience = import.meta.env.VITE_AUTH0_API_IDENTIFIER;

  const navigate = useNavigate();
  const location = useLocation();
  const subject = location.state?.subjectName || "No subject chosen";
  const [modelOpen, setModelOpen] = useState(false);
  const [chapterId, setChapterId] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [purchasedChapters, setPurchasedChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, isAuthenticated, loginWithPopup, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await makeRequest.get(`/chapters/${subject}`);
        setChapters(res.data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setError("Something went wrong. Please try again");
      } finally {
        setLoading(false);
      }
    };

    if (subject !== "No subject chosen") {
      fetchChapters();
    }
  }, [subject]);

  useEffect(() => {
    const fetchPurchased = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const token = await getAccessTokenSilently();
        const res = await makeRequest.get(`/purchases/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const purchasedIds = res.data.purchasedChapters;
        setPurchasedChapters(purchasedIds);
      } catch (err) {
        console.error("Error fetching purchases:", err);
      }
    };

    fetchPurchased();
  }, [user, isAuthenticated, getAccessTokenSilently]);

  const handleClick = async (id) => {
    if (!isAuthenticated || !user) {
      await loginWithPopup({
        authorizationParams: {
          audience: audience,
          scope: "openid profile email offline_access",
        },
      });
    } else {
      setModelOpen(true);
      setChapterId(id);
    }
  };

  const handleBuy = async (chapter, amount) => {
    if (!isAuthenticated || !user) {
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
    } else {
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
    }
  };

  return (
    <div className="subjectContainer">
      <Navbar />
      <div className="subjectName">{subject}</div>
      <div className="chapterListWrapper">
        {loading && (
          <div className="chapter-loading">
            <img
              src="/microscope.png"
              alt="Loading..."
              className="loading-icon"
            />
            <span>Locating your notes at the molecular level! 🔬</span>
          </div>
        )}

        {error && <div className="chapter-error">{error}</div>}

        {!loading && !error && (
          <div className="chapterList">
            <ul>
              {chapters.map((chapter, index) => {
                const isBought = purchasedChapters.includes(chapter.id);
                return (
                  <div
                    key={index}
                    className={`chapter${isBought ? "-bought-chapter" : ""}`}
                  >
                    <li onClick={() => handleClick(chapter.id)}>
                      {chapter.chapter_name}
                    </li>
                    {!isBought && (
                      <button
                        className="buyBtn"
                        onClick={() => handleBuy(chapter, chapter.price)}
                      >
                        ₹{chapter.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </ul>
          </div>
        )}
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
