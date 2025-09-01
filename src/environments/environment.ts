export const environment = {
  production: false,
  spotify: {
    // It is fine to keep Client ID public in a SPA
    clientId: 'e7b98e9c42d8487aa7cedaa2060de245',
    // Use a local redirect during development, make sure it's added in Spotify dashboard
    redirectUri: 'https://127.0.0.1/auth/callback',
    scopes: [
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'streaming'
    ]
  }
};

