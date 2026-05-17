type AuthTokenManager = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
};

let manager: AuthTokenManager = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
};

export function setAuthTokenManager(nextManager: AuthTokenManager) {
  manager = nextManager;
}

export function getAccessToken() {
  return manager.getAccessToken();
}

export function refreshAccessToken() {
  return manager.refreshAccessToken();
}
