import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker";
import { makeRequest } from "../../../axios.js";
import { useAuth0 } from "@auth0/auth0-react";
import "./pdfviewer.css";

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const PdfViewer = ({ chapterId }) => {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const canvasRef = useRef();
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessTokenSilently();
        const response = await makeRequest.get(`/notes/${chapterId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        });

        const arrayBuffer = await response.data.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer })
          .promise;
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError("You haven't purchased this item.");
        } else {
          setError("Something went wrong while fetching the PDF.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, [chapterId, getAccessTokenSilently, loginWithRedirect]);

  useEffect(() => {
    let renderTask = null;
    const renderPage = () => {
      if (!pdf) return;

      pdf.getPage(pageNum).then((page) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const containerWidth =
          window.innerWidth < 768
            ? window.innerWidth * 0.9
            : window.innerWidth * 0.5;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / unscaledViewport.width;

        const outputScale = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width * outputScale;
        canvas.height = viewport.height * outputScale;

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          viewport,
          transform,
        };

        if (renderTask) {
          renderTask.cancel();
        }

        renderTask = page.render(renderContext);
      });
    };

    renderPage();

    window.addEventListener("resize", renderPage);

    return () => {
      window.removeEventListener("resize", renderPage);

      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNum]);

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum((prev) => prev - 1);
      setInputPage((prev) => String(Number(prev) - 1));
    }
  };

  const goToNextPage = () => {
    if (pageNum < totalPages) {
      setPageNum((prev) => prev + 1);
      setInputPage((prev) => String(Number(prev) + 1));
    }
  };

  const handlePageInput = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputPage(value);
    }
  };

  const goToPage = () => {
    const num = Number(inputPage);
    if (num >= 1 && num <= totalPages) {
      setPageNum(num);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      goToPage();
    }
  };

  return (
    <div className="pdfViewerContainer">
      <div className="pdfControls">
        <button onClick={goToPrevPage} disabled={pageNum <= 1}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page{" "}
          <input
            value={inputPage}
            onChange={handlePageInput}
            onKeyDown={handleKeyDown}
            style={{ width: "40px", textAlign: "center" }}
          />{" "}
          of {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={pageNum >= totalPages}>
          Next
        </button>
      </div>
      {loading && <div className="pdf-loading">Loading PDF...</div>}

      {error && <div className="pdf-error">{error}</div>}

      {!loading && !error && <canvas ref={canvasRef} className="pdf-canvas" />}
    </div>
  );
};

export default PdfViewer;
