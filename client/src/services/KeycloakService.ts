// services/KeycloakService.ts
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8085',
  realm: 'master',
  clientId: '789456123',
});

const initKeycloak = (onAuthenticatedCallback: () => void) => {
  keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
  }).then((authenticated) => {
    if (authenticated) {
      onAuthenticatedCallback();
    } else {
      keycloak.login();
    }
  });
};

const KeycloakService = {
  callLogin: () => keycloak.login(),
  callLogout: () => keycloak.logout(),
  getToken: () => keycloak.token,
  getUsername: () => keycloak.tokenParsed?.preferred_username,
  isLoggedIn: () => !!keycloak.token,
  initKeycloak,
};

export default KeycloakService;
