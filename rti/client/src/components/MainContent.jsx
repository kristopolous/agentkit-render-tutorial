import { useState, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import PhoneCallRequest from "./PhoneCallRequest";

function MainContent({ selectedRole }) {
  const [markdownSource, setMarkdownSource] = useState("");
  const [showMarkdownResult, setShowMarkdownResult] = useState(false);
  const [showVideoCallMessage, setShowVideoCallMessage] = useState(false);

  // Listen for markdown rendering events
  useEffect(() => {
    const handleMarkdownRender = (event) => {
      setMarkdownSource(event.detail.originalMarkdown);
      setShowMarkdownResult(true);
    };

    window.addEventListener("markdown-render", handleMarkdownRender);

    return () => {
      window.removeEventListener("markdown-render", handleMarkdownRender);
    };
  }, []);

  return (
    <div className="main-content">
      <div
        className="docs-title"
        style={{ display: "block", textAlign: "center" }}
      >
        <img src="furnicular.png" alt="Furnicular Logo" className="logo" />
        <h1>
          Welcome to Furnicular, the easy ramp-up for devs to get going with
          your API!
        </h1>
        <p>Get started with either a video call or a phone call:</p>
      </div>
    </div>
  );
}

export default MainContent;
