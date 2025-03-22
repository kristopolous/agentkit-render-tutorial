import { useState, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import VideoPlaceholder from "./VideoPlaceholder";
import Conversation from "./Conversation";

function MainContent({ selectedRole }) {
  const [markdownSource, setMarkdownSource] = useState("");
  const [showMarkdownResult, setShowMarkdownResult] = useState(false);
  const [showVideoCallMessage, setShowVideoCallMessage] = useState(false);
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [convo, setConvo] = useState(false);
  const [meetingID, setMeetingID] = useState("");

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

  const handleUrlChange = (event) => {
    setDocumentationUrl(event.target.value);
  };

  return (
    <div className="main-content">
      <div
        className="docs-title"
        style={{ display: "block", textAlign: "center" }}
      >
        <img src="furnicular.png" alt="Furnicular Logo" className="logo" />
        <h1 style={{ color: '#AAA'}}>
          The easy ramp-up for devs to get going
        </h1>
        <input
          type="text"
          placeholder="Enter documentation URL"
          value={documentationUrl}
          onChange={handleUrlChange}
          className="documentation-input"
        />
        <div className="call">
          <button className="login-button start" onClick={() => setConvo(true)}>Start Video Call</button>
          
          {convo && (
            <Conversation meetingID={meetingID} setMeetingID={setMeetingID} />
          )}
          {!convo && <VideoPlaceholder />}
        </div>
        
      </div>
    </div>
  );
}

export default MainContent;
