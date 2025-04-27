// src/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8085',
  realm: 'master',
  clientId: '789456123', // Replace with the actual client ID you’ll set up in Keycloak admin panel
});

export default keycloak;
  