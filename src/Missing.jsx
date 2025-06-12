import "./styles/404.css";

const Missing = () => {
  return (
    <div className="missing-container">
      <h1>404</h1>
      <p>The resource you requested does not exist.</p>
      <a href="/" className="home-link">
        Go back home
      </a>
    </div>
  );
};

export default Missing;
