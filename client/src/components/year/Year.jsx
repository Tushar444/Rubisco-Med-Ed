import { Link } from "react-router";
import { useEffect, useState } from "react";
import { makeRequest } from "../../../axios.js";
import "./year.css";

const Year = (props) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const yearNo =
    props.number === "I"
      ? 1
      : props.number === "II"
      ? 2
      : props.number === "III"
      ? 3
      : 4;

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await makeRequest.post("/subjects", {
          year: yearNo,
        });
        setSubjects(res.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setError("Something went wrong. Please try again");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [yearNo]);

  return (
    <div className="yearContainer">
      <span className="yearNo">{props.number} Year MBBS</span>
      <hr />
      <div className="subjectList">
        {loading && (
          <div className="subject-loading">
            <img src="/brain.png" alt="Loading..." className="loading-icon" />
            <span>Hold tight, the brain is buffering! 🧠</span>
          </div>
        )}

        {error && <div className="sujbect-error">{error}</div>}

        {!loading &&
          !error &&
          yearNo !== 3 &&
          yearNo !== 4 &&
          subjects.map((subjectName, index) => {
            return (
              <p key={subjectName}>
                {index + 1}.{" "}
                <Link
                  to="/subjects"
                  className="subjectLink"
                  state={{ subjectName }}
                >
                  {subjectName}
                </Link>
              </p>
            );
          })}
      </div>
    </div>
  );
};

export default Year;
