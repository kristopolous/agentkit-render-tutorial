import {
  useVideoTrack,
  DailyVideo,
  DailyProvider,
} from "@daily-co/daily-react";
import { cn } from "@/lib/utils";

import { useEffect } from "react";
function Conversation({ meetingID, setMeetingID }) {
  useEffect(() => {
    const createConversation = async () => {
      try {
        const options = {
          method: "POST",
          headers: {
            //"x-api-key": "SECRET",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replica_id: "r79e1c033f",
            persona_id: "p9a95912",
            conversation_name: "A Meeting with Hassaan",
            conversational_context:
              "You are here to talk to someone about how to use Youtube",
            custom_greeting:
              "Hey there, what can I help you with on Youtube today?",
            properties: {
              max_call_duration: 3600,
              participant_left_timeout: 0,
              participant_absent_timeout: 30,
              language: "english",
            },
          }),
        };

        const response = await fetch(
          "https://tavusapi.com/v2/conversations",
          options
        );
        const responseJSON = await response.json();

        // Now you can access the conversation_url property
        setMeetingID(responseJSON.conversation_url);

        console.log("Response status:", response.status);
        console.log("Response JSON:", responseJSON);
        console.log("Conversation URL:", responseJSON.conversation_url);
      } catch (err) {
        console.log(err);
      }
    };

    createConversation();
  }, []);

  console.log(meetingID);

  return (
    <iframe
      title="fuck"
      allow="camera; microphone; fullscreen; speaker; display-capture"
      className="video-placeholder"
      src={meetingID}
    >
      {" "}
    </iframe>
  );
}

export default Conversation;
