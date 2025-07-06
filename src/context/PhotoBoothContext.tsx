import React, { createContext, useContext, useState, useEffect } from 'react';
import { Photo } from '@/models/PhotoTypes';

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
  status: 'Active' | 'Completed';
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
  addPhoto: (sessionId: string, photo: Omit<Photo, 'id'>) => void;
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
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    } else {
      setSessions([]);
      localStorage.setItem('photoBoothSessions', JSON.stringify([]));
    }
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    } else {
      const defaultLocations = [
        { id: 'entrance', name: 'Entrance', isActive: true },
        { id: 'castle', name: 'Castle', isActive: true },
        { id: 'waterfall', name: 'Waterfall', isActive: true },
        { id: 'themeRide', name: 'Theme Ride', isActive: true },
      ];
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
    } else {
      localStorage.removeItem('photoBoothUser');
    }
  }, [currentUser]);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('photoBoothLocations', JSON.stringify(locations));
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
  const createSession = (name: string, location: string): Session => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      name,
      location,
      date: new Date().toISOString(),
      status: 'Active',
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

  const addPhoto = (sessionId: string, photo: Omit<Photo, 'id'>) => {
    const newPhoto: Photo = {
      ...photo,
      id: `photo_${Date.now()}`
    };
    
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            photos: [...session.photos, newPhoto]
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        photos: [...currentSession.photos, newPhoto]
      });
    }
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
            status: 'Completed'
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        status: 'Completed'
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
    toggleLocation
  };

  return <PhotoBoothContext.Provider value={value}>{children}</PhotoBoothContext.Provider>;
};
