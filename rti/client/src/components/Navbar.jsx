import { useState } from 'react';
import StytchLogo from './StytchLogo';

function Navbar() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  return (
    <div className="navbar">
      <div></div> {/* Empty div for flexbox spacing */}
      
      <button 
        className="login-button" 
        onClick={togglePopover}
      >
        <span className="login-text">Login with</span>
        <StytchLogo />
      </button>
      
      <div className={`login-popover ${isPopoverOpen ? 'active' : ''}`}>
        <div className="stytch-header">
          <StytchLogo />
          <h3 className="login-popover-title">Login</h3>
        </div>
        
        <div className="sso-options">
          <div className="sso-option">
            <span>Google</span>
          </div>
          <div className="sso-option">
            <span>GitHub</span>
          </div>
          <div className="sso-option">
            <span>Microsoft</span>
          </div>
          <div className="sso-option">
            <span>Apple</span>
          </div>
        </div>
        
        <div className="stytch-footer">
          <span>Powered by</span>
          <StytchLogo />
        </div>
      </div>
    </div>
  );
}

export default Navbar;