import { useState } from "react";
import VideoPlaceholder from "./VideoPlaceholder";
import RolesSection from "./RolesSection";
import PoweredBy from "./PoweredBy";
import PhoneCallRequest from "./PhoneCallRequest";
import Conversation from "./Conversation";

function Sidebar({ selectedRole, onRoleSelect }) {
  const [convo, setConvo] = useState(false);
  const [meetingID, setMeetingID] = useState("");
  return (
    <div className="sidebar">
      {convo && (
        <Conversation meetingID={meetingID} setMeetingID={setMeetingID} />
      )}
      {!convo && <VideoPlaceholder />}
      <PhoneCallRequest setConvo={setConvo} convo={convo} />
      <RolesSection selectedRole={selectedRole} onRoleSelect={onRoleSelect} />
      <PoweredBy />
    </div>
  );
}

export default Sidebar;
