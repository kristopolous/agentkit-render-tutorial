import { useState } from "react";

function PhoneCallRequest({ convo, setConvo }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.trim() === "") {
      setMessage("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Mock API request to rime with current context
      const currentContext = {
        role:
          document
            .querySelector(".role-button.active")
            ?.textContent.toLowerCase() || "unknown",
        page:
          document.querySelector(".docs-title h1")?.textContent || "unknown",
      };

      // Simulating API call
      console.log("Sending request to rime with:", {
        phoneNumber,
        currentContext,
      });

      // Mocked API call with timeout to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage(
        "Call requested successfully. You will receive a call shortly."
      );
      setPhoneNumber("");
      
      // Automatically start the video call after successful phone request
      setConvo(true);
    } catch (error) {
      console.error("Error requesting call:", error);
      setMessage("Failed to request call. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="phone-call-request">
      <h3>Prefer a phone call?</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter your phone number"
            disabled={isLoading}
          />
        </div>
        {message && <p className="message">{message}</p>}
      </form>
      <div className="input-group">
        {convo && (
          <button
            type="submit"
            className="call-button"
            onClick={() => setConvo(false)}
          >
            {"End Video Call"}
          </button>
        )}
        {!convo && (
          <>
            <button type="submit" disabled={isLoading} className="call-button">
              {isLoading ? "Requesting..." : "Call me"}
            </button>
            <button
              type="submit"
              className="call-button"
              onClick={() => setConvo(true)}
            >
              {"Start Video Call"}
            </button>
          </>
        )}
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default PhoneCallRequest;
