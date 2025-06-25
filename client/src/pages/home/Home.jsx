import Navbar from "../../components/navbar/Navbar";
import Year from "../../components/year/Year";
import "./home.css";

const Home = () => {
  return (
    <div>
      <Navbar className="navbar" />
      <hr />
      <div className="yearWiseContainer" style={{ marginTop: "60px" }}>
        <Year number="I" />
        <Year number="II" />
        <Year number="III" />
        <Year number="IV" />
      </div>
    </div>
  );
};

export default Home;
