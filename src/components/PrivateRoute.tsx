import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';

const PrivateRoute: React.FC = () => {
  const { currentUser } = usePhotoBoothContext();
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute; 