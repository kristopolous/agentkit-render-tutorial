import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Navbar from './components/Navbar';

function App() {
  const [selectedRole, setSelectedRole] = useState('manager');
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const popover = document.querySelector('.login-popover');
      const loginButton = document.querySelector('.login-button');
      
      if (popover && popover.classList.contains('active') &&
          !popover.contains(event.target) &&
          !loginButton.contains(event.target)) {
        popover.classList.remove('active');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="app-container">
      <Sidebar selectedRole={selectedRole} onRoleSelect={handleRoleSelect} />
      <Navbar />
      <MainContent selectedRole={selectedRole} />
    </div>
  );
}

export default App;
