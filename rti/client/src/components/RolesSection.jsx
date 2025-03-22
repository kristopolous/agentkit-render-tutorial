import MarkdownTest from "./MarkdownTest";

function RolesSection({ selectedRole, onRoleSelect }) {
  const roles = [
    { id: "manager", label: "Manager" },
    { id: "technician", label: "Technician" },
  ];

  return (
    <div className="roles-section">
      <div className="roles-header">Roles</div>
      {roles.map((role) => (
        <button
          key={role.id}
          className={`role-button ${selectedRole === role.id ? "active" : ""}`}
          onClick={() => onRoleSelect(role.id)}
        >
          {role.label}
        </button>
      ))}

      <div className="separator"></div>
    </div>
  );
}

export default RolesSection;
