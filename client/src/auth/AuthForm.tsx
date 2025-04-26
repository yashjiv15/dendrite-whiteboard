import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/KeycloakProvider';

const AuthForm = () => {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      navigate('/session');
    }
  }, [username, navigate]);

  return <div>Authenticating with Keycloak...</div>;
};

export default AuthForm;
