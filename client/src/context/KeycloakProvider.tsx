import { createContext, useEffect, useState, useRef, ReactNode } from 'react';
import KeycloakService from '../services/KeycloakService';

interface AuthContextProps {
  username: string | null;
  initialized: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  username: null,
  initialized: false,
});

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      KeycloakService.initKeycloak(() => {
        setUsername(KeycloakService.getUsername());
        setInitialized(true);
      });
      isInitializedRef.current = true;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ username, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};
