import RolesSection from "./RolesSection";
import PoweredBy from "./PoweredBy";

function Sidebar({ selectedRole, onRoleSelect }) {
  return (
    <div className="sidebar">
     
      <RolesSection selectedRole={selectedRole} onRoleSelect={onRoleSelect} />
      <PoweredBy />
    </div>
  );
}

export default Sidebar;
