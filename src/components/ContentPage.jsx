import { useLocation, useParams } from "react-router-dom";

const ContentPage = () => {
  const location = useLocation();
  console.log(location.state);
  const { heading, title, text } = location.state;
  console.log(title, text);
  // Replace "\n" with <br />
  const formattedText = text.replace(/\n/g, "<br />");
  console.log(formattedText);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Course Title: {heading}</h2>
      <div
        style={{ fontSize: "16px", lineHeight: "1.6", color: "#444" }}
        dangerouslySetInnerHTML={{ __html: formattedText }}
      ></div>
    </div>
  );
};

export default ContentPage;
