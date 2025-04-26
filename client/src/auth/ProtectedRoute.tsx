import { JSX, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/KeycloakProvider';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { username, initialized } = useContext(AuthContext);

  if (!initialized) {
    return <div>Loading...</div>; // can show a spinner here
  }

  return username ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
