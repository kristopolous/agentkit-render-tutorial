import { useState, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { marked } from "marked";

function MainContent({ selectedRole }) {
  const [markdownSource, setMarkdownSource] = useState("");
  const [showMarkdownResult, setShowMarkdownResult] = useState(false);
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [convo, setConvo] = useState(false);
  const [markdownHtml, setMarkdownHtml] = useState("");

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
    setConvo(true);
    fetchMarkdownContent();
  };

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
          {!convo && (
            <button
              className="login-button start"
              onClick={startCall}
              style={{
                display: 'block',
                margin: '0 auto 20px auto',
                width: '200px'
              }}
            >
              Get Started
            </button>
          )}

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
