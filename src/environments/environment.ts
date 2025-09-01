export const environment = {
  production: false,
  spotify: {
    // It is fine to keep Client ID public in a SPA
    clientId: 'e7b98e9c42d8487aa7cedaa2060de245',
    // Use 127.0.0.1 instead of localhost for Spotify compliance
    redirectUri: 'https://127.0.0.1:4200/auth/callback',
    scopes: [
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'streaming'
    ]
  }
};

