import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { Menu, X, Settings, CircleUser, Package, LogOut } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const { currentUser, logout } = usePhotoBoothContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-gradient-to-r from-photobooth-primary to-photobooth-primary-dark text-white h-20 px-6 shadow-md flex items-center">
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-white no-underline border-none outline-none bg-transparent shadow-none">
            Photo Kiosk
          </Link>
        </div>
        
        {isMobile ? (
          <>
            <div className="flex items-center gap-2">
              {currentUser && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center text-white hover:bg-white/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="block">Logout</span>
                </Button>
              )}
              
              <button 
                onClick={toggleMenu} 
                className="text-white hover:text-blue-200 transition-colors"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
            {isMenuOpen && (
              <div className="absolute top-14 right-0 left-0 bg-white shadow-lg z-50 animate-in fade-in slide-in-from-top-5">
                <div className="flex flex-col p-4">
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-2 p-2 text-photobooth-primary font-semibold">
                        <CircleUser className="h-5 w-5" />
                        <span>{currentUser.name} ({currentUser.role})</span>
                      </div>
                      <Link to="/profile" className="p-2 hover:bg-blue-50 rounded flex items-center gap-2 text-photobooth-primary" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="h-5 w-5" />
                        <span>Profile Settings</span>
                      </Link>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      className="p-2 bg-photobooth-primary text-white rounded hover:bg-photobooth-primary-dark transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center">
                  <CircleUser className="mr-1 h-5 w-5" />
                  {currentUser.name} ({currentUser.role})
                </span>
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="block">Settings</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="text-white border-white bg-transparent font-semibold"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="block">Logout</span>
                </Button>
              </div>
            ) : (
              <Link to="/login" className="ml-auto">
                <CircleUser className="h-14 w-14 text-white" />
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
