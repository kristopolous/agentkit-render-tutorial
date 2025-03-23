import { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { marked } from "marked";
import VideoPlaceholder from "./VideoPlaceholder";
import PhoneCallRequest from "./PhoneCallRequest";
import Conversation from "./Conversation";

function MainContent({ selectedRole }) {
  const [markdownSource, setMarkdownSource] = useState("");
  const [showMarkdownResult, setShowMarkdownResult] = useState(false);
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [convo, setConvo] = useState(false);
  const [markdownHtml, setMarkdownHtml] = useState("");
  const [meetingID, setMeetingID] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);
  const headerRef = useRef(null);

    // Function to fetch and convert markdown content
    const fetchMarkdownContent = async () => {
      try {
        const response = await fetch('/md.md');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdownText = await response.text();
        const html = marked(markdownText);
        setMarkdownHtml(html);
      } catch (error) {
        console.error("Error fetching markdown content:", error);
        setMarkdownHtml("<p>Error loading markdown content</p>");
      }
    };
    const startCalla = async () => {
      try {
        const apiKey = "apify_api_2jMHhDNilP44xpl141rLr1UrVMWJaz1O6Lhj";
        const actorId = "WnMxIh5j4tfg94NHT";
        const input = {
          question: "how does this work",
          rootwebsite: documentationUrl,
          previousresponse: "",
          usercontext: "",
        };
  
        const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input }),
        });
  
      
        const data = await response.json();
  
        // For demonstration purposes, we'll just set a fixed response
        setApifyResponse((data) => {
          console.log(data);
        });
        setConvo(true);
  
        // Fetch and convert markdown content
        await fetchMarkdownContent();
  
        // In a real implementation, we would need to poll for the result
        // const runId = data.data.id;
        // const resultResponse = await fetch(https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items?token=${apiKey});
        // const resultData = await resultResponse.json();
        // setApifyResponse(resultData[0].output);
      } catch (error) {
        console.error("Error calling Apify actor:", error);
        setConvo(true); // Still show the conversation, but with an error message
      }
    };
  window.ss = startCalla;
  
  const startCall = () => {
    // Start the Tavus video call
    setConvo(true);
    fetchMarkdownContent();
    
    // Slide up the header
    setHeaderVisible(false);
    
    // If there's a Tavus video API or element to trigger, it would go here
    if (window.tavusPlayer && typeof window.tavusPlayer.play === 'function') {
      window.tavusPlayer.play();
    }
  };

  // Listen for markdown rendering events and fetch markdown when convo changes
  useEffect(() => {
    const handleMarkdownRender = (event) => {
      setMarkdownSource(event.detail.originalMarkdown);
      setShowMarkdownResult(true);
    };

    window.addEventListener("markdown-render", handleMarkdownRender);

    // Fetch markdown content when convo state changes to true
    if (convo) {
      fetchMarkdownContent();
    }

    return () => {
      window.removeEventListener("markdown-render", handleMarkdownRender);
    };
  }, [convo]);

  const handleUrlChange = (event) => {
    setDocumentationUrl(event.target.value);
  };

  return (
    <div className="main-content">
      <div
        ref={headerRef}
        className="docs-title"
        style={{
          display: "block",
          textAlign: "center",
          transition: "transform 0.5s ease-out, opacity 0.5s ease-out, height 0.5s ease-out",
          transform: headerVisible ? "translateY(0)" : "translateY(-100px)",
          opacity: headerVisible ? 1 : 0,
          height: headerVisible ? "auto" : "0",
          overflow: "hidden",
          marginBottom: headerVisible ? "20px" : "0"
        }}
      >
        <img src="furnicular.png" alt="Furnicular Logo" className="logo" />
        <h1 style={{ color: '#AAA'}}>
          Welcome to Furnicular, the easy ramp-up for devs
        </h1>
        <input
          type="text"
          placeholder="Enter documentation URL"
          value={documentationUrl}
          onChange={handleUrlChange}
          className="documentation-input"
        />
        <div className="call" style={{ marginTop: '20px', maxWidth: '600px', margin: '20px auto' }}>
          {/* Video container - shows placeholder or iframe based on convo state */}
          <div className="video-container" style={{ marginBottom: '20px' }}>
            {!convo ? (
              <VideoPlaceholder />
            ) : (
              <Conversation meetingID={meetingID} setMeetingID={setMeetingID} />
            )}
          </div>
          
          {/* Phone Call Request component for video call functionality */}
          <PhoneCallRequest convo={convo} setConvo={setConvo} />
          
          {/* Markdown content - shown after video starts */}
          {convo && (
            <>
              {markdownHtml && (
                <div
                  className="markdown-content"
                  style={{ marginTop: '30px', textAlign: 'left', padding: '20px' }}
                  dangerouslySetInnerHTML={{ __html: markdownHtml }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainContent;
