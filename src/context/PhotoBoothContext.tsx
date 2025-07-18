import React, { createContext, useContext, useState, useEffect } from 'react';
import { Photo } from '@/models/PhotoTypes';
import { checkStorageQuota } from '../utils/imageUtils';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Cameraman';
}

interface Session {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'pending' | 'ready-for-operator' | 'completed';
  sessionKey: string;
  photos: Photo[];
  bundle?: {
    name: string;
    count: number | string;
    price: number;
  };
  deleted?: boolean;
}

interface Location {
  id: string;
  name: string;
  isActive: boolean;
}

interface PhotoBoothContextType {
  currentUser: User | null;
  sessions: Session[];
  currentSession: Session | null;
  locations: Location[];
  login: (email: string, password: string, role: string, forceLogin?: boolean) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => boolean;
  createSession: (name: string, location: string) => Session;
  deleteSession: (id: string) => void;
  recoverSession: (id: string) => void;
  setCurrentSession: (session: Session | null) => void;
  selectBundle: (bundle: { name: string; count: number | string; price: number }) => void;
  addPhoto: (sessionId: string, photo: Photo) => void;
  updatePhoto: (sessionId: string, photoId: string, updates: Partial<Photo>) => void;
  deletePhoto: (sessionId: string, photoId: string) => void;
  completeSession: (sessionId: string) => void;
  deleteAllSessions: () => void;
  deleteSessionsByDateRange: (start: Date, end: Date) => void;
  deleteSessionsByMonth: (month: number, year: number) => void;
  autoDeleteOldSessions: () => void;
  clearDeletedSessions: () => void;
  addLocation: (name: string) => void;
  toggleLocation: (id: string) => void;
  setSessionStatus: (sessionId: string, status: 'pending' | 'ready-for-operator' | 'completed') => void;
}

const PhotoBoothContext = createContext<PhotoBoothContextType | undefined>(undefined);

export const usePhotoBoothContext = () => {
  const context = useContext(PhotoBoothContext);
  if (context === undefined) {
    throw new Error('usePhotoBoothContext must be used within a PhotoBoothProvider');
  }
  return context;
};

export const PhotoBoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [storageFull, setStorageFull] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('photoBoothUser');
    const storedSessions = localStorage.getItem('photoBoothSessions');
    const storedLocations = localStorage.getItem('photoBoothLocations');
    
    console.log('Context - Loading locations from localStorage:', storedLocations);
    
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    } else {
      setSessions([]);
      localStorage.setItem('photoBoothSessions', JSON.stringify([]));
    }
    
    // Initialize locations properly
    if (storedLocations) {
      const parsedLocations = JSON.parse(storedLocations);
      console.log('Context - Parsed locations:', parsedLocations);
      // Ensure we have at least the default locations
      if (parsedLocations.length === 0) {
        const defaultLocations = [
          { id: 'loc_1', name: 'Main Entrance', isActive: true },
          { id: 'loc_2', name: 'Children\'s Play Area', isActive: true },
          { id: 'loc_3', name: 'Garden Area', isActive: true },
          { id: 'loc_4', name: 'Food Court', isActive: true },
          { id: 'loc_5', name: 'Lake View', isActive: true }
        ];
        console.log('Context - Setting default locations:', defaultLocations);
        setLocations(defaultLocations);
        localStorage.setItem('photoBoothLocations', JSON.stringify(defaultLocations));
      } else {
        setLocations(parsedLocations);
      }
    } else {
      // Set default locations if none exist
      const defaultLocations = [
        { id: 'loc_1', name: 'Main Entrance', isActive: true },
        { id: 'loc_2', name: 'Children\'s Play Area', isActive: true },
        { id: 'loc_3', name: 'Garden Area', isActive: true },
        { id: 'loc_4', name: 'Food Court', isActive: true },
        { id: 'loc_5', name: 'Lake View', isActive: true }
      ];
      console.log('Context - Setting initial default locations:', defaultLocations);
      setLocations(defaultLocations);
      localStorage.setItem('photoBoothLocations', JSON.stringify(defaultLocations));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (storageFull) return;
    try {
      localStorage.setItem('photoBoothSessions', JSON.stringify(sessions));
    } catch (e) {
      if (e && typeof e === 'object' && 'name' in e && e.name === 'QuotaExceededError') {
        if (!storageFull) {
          setStorageFull(true);
          alert('Storage is full! Please delete some sessions to continue using the app.');
        }
      }
      // Do NOT throw the error, just skip saving
    }
  }, [sessions, storageFull]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('photoBoothUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Add this new useEffect to save locations
  useEffect(() => {
    if (locations.length > 0) {
      localStorage.setItem('photoBoothLocations', JSON.stringify(locations));
      console.log('Context - Saved locations to localStorage:', locations);
    }
  }, [locations]);

  // User authentication functions
  const login = (email: string, password: string, role: string, forceLogin?: boolean): boolean => {
    if (forceLogin) {
      setCurrentUser({
        id: `user_${Date.now()}`,
        name: email.split('@')[0] || 'User',
        email,
        role: role as 'Admin' | 'Cameraman',
      });
      return true;
    }
    // In a real app, this would validate against server data
    // For this demo, we'll use localStorage
    const users = JSON.parse(localStorage.getItem('photoBoothUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.role === role);
    if (user && user.password === password) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'Admin' | 'Cameraman',
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, password: string, role: string): boolean => {
    const users = JSON.parse(localStorage.getItem('photoBoothUsers') || '[]');
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // In a real app, this would be hashed
      role
    };
    
    users.push(newUser);
    localStorage.setItem('photoBoothUsers', JSON.stringify(users));
    
    // Auto login after registration
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'Admin' | 'Cameraman'
    });
    
    return true;
  };

  // Session management functions
  const createSession = (name: string, location: string, sessionId?: string): Session => {
    // Use provided sessionId or generate a new one
    const sessionKey = sessionId || Math.floor(10000 + Math.random() * 90000).toString();
    const newSession: Session = {
      id: `session_${Date.now()}`,
      name,
      location,
      date: new Date().toISOString(),
      status: 'pending',
      sessionKey,
      photos: []
    };
    setSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSession(newSession);
    return newSession;
  };

  const deleteSession = (id: string) => {
    setSessions(prevSessions => prevSessions.map(session =>
      session.id === id ? { ...session, deleted: true } : session
    ));
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  };

  const recoverSession = (id: string) => {
    setSessions(prevSessions => prevSessions.map(session =>
      session.id === id ? { ...session, deleted: false } : session
    ));
  };

  const selectBundle = (bundle: { name: string; count: number | string; price: number }) => {
    if (currentSession) {
      const updatedSession = { ...currentSession, bundle };
      
      setCurrentSession(updatedSession);
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === currentSession.id ? updatedSession : session
        )
      );
    }
  };

  const addPhoto = (sessionId: string, photo: Photo) => {
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
        if (session.id === sessionId) {
          const updatedPhotos = [...session.photos, photo];
          // Update currentSession if this is the current one
          if (currentSession && currentSession.id === sessionId) {
            setCurrentSession({ ...session, photos: updatedPhotos });
          }
          return { ...session, photos: updatedPhotos };
        }
        return session;
      });
      
      // Check storage quota before saving
      const quota = checkStorageQuota();
      console.log('Storage quota:', quota);
      
      if (quota.percentage > 80) {
        console.warn('Storage quota nearly exceeded, cleaning up old sessions');
        // Clean up old completed sessions
        const cleanedSessions = updatedSessions.filter(session => 
          session.status === 'pending' || 
          (session.status === 'completed' && 
           new Date().getTime() - new Date(session.date).getTime() < 24 * 60 * 60 * 1000) // Keep only last 24 hours
        );
        
        try {
          localStorage.setItem('photoBoothSessions', JSON.stringify(cleanedSessions));
          return cleanedSessions;
        } catch (error) {
          console.error('Failed to save to localStorage after cleanup:', error);
          // If still failing, keep only active sessions
          const activeSessions = updatedSessions.filter(session => session.status === 'pending');
          localStorage.setItem('photoBoothSessions', JSON.stringify(activeSessions));
          return activeSessions;
        }
      } else {
        try {
          localStorage.setItem('photoBoothSessions', JSON.stringify(updatedSessions));
          return updatedSessions;
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
          
          // Try to clean up and save again
          const cleanedSessions = updatedSessions.filter(session => 
            session.status === 'pending' || 
            (session.status === 'completed' && 
             new Date().getTime() - new Date(session.date).getTime() < 60 * 60 * 1000) // Keep only last hour
          );
          
          try {
            localStorage.setItem('photoBoothSessions', JSON.stringify(cleanedSessions));
            return cleanedSessions;
          } catch (secondError) {
            console.error('Failed to save even after cleanup:', secondError);
            // Return updated sessions but don't save to localStorage
            return updatedSessions;
          }
        }
      }
    });
  };

  const updatePhoto = (sessionId: string, photoId: string, updates: Partial<Photo>) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            photos: session.photos.map(photo => 
              photo.id === photoId ? { ...photo, ...updates } : photo
            )
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        photos: currentSession.photos.map(photo => 
          photo.id === photoId ? { ...photo, ...updates } : photo
        )
      });
    }
  };

  const deletePhoto = (sessionId: string, photoId: string) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            photos: session.photos.filter(photo => photo.id !== photoId)
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        photos: currentSession.photos.filter(photo => photo.id !== photoId)
      });
    }
  };

  const completeSession = (sessionId: string) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            status: 'completed'
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        status: 'completed'
      });
    }
  };

  const deleteAllSessions = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  const deleteSessionsByDateRange = (start: Date, end: Date) => {
    setSessions(prevSessions => prevSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate < start || sessionDate > end;
    }));
  };

  const deleteSessionsByMonth = (month: number, year: number) => {
    setSessions(prevSessions => prevSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getMonth() !== month || sessionDate.getFullYear() !== year;
    }));
  };

  const autoDeleteOldSessions = () => {
    const now = new Date();
    setSessions(prevSessions => prevSessions.filter(session => {
      const sessionDate = new Date(session.date);
      // Keep sessions from the last 31 days
      return (now.getTime() - sessionDate.getTime()) < 31 * 24 * 60 * 60 * 1000;
    }));
  };

  const clearDeletedSessions = () => {
    setSessions(prevSessions => prevSessions.filter(session => !session.deleted));
  };

  // Location management functions
  const addLocation = (name: string) => {
    setLocations(prev => [
      ...prev,
      { id: `loc_${Date.now()}`, name, isActive: true }
    ]);
  };

  const toggleLocation = (id: string) => {
    setLocations(prev => prev.map(loc =>
      loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
    ));
  };

  const setSessionStatus = (sessionId: string, status: 'pending' | 'ready-for-operator' | 'completed') => {
    setSessions(prevSessions => prevSessions.map(session =>
      session.id === sessionId ? { ...session, status } : session
    ));
    if (currentSession?.id === sessionId) {
      setCurrentSession(current => current ? { ...current, status } : current);
    }
  };

  const value = {
    currentUser,
    sessions,
    currentSession,
    locations,
    login,
    logout,
    register,
    createSession,
    deleteSession,
    recoverSession,
    setCurrentSession,
    selectBundle,
    addPhoto,
    updatePhoto,
    deletePhoto,
    completeSession,
    deleteAllSessions,
    deleteSessionsByDateRange,
    deleteSessionsByMonth,
    autoDeleteOldSessions,
    clearDeletedSessions,
    addLocation,
    toggleLocation,
    setSessionStatus
  };

  return (
    <PhotoBoothContext.Provider
      value={{
        currentUser,
        sessions,
        currentSession,
        locations,
        login,
        logout,
        register,
        createSession,
        deleteSession,
        recoverSession,
        setCurrentSession,
        selectBundle,
        addPhoto,
        updatePhoto,
        deletePhoto,
        completeSession,
        deleteAllSessions,
        deleteSessionsByDateRange,
        deleteSessionsByMonth,
        autoDeleteOldSessions,
        clearDeletedSessions,
        addLocation,
        toggleLocation,
        setSessionStatus
      }}
    >
      {children}
    </PhotoBoothContext.Provider>
  );
};
