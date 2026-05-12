// Copy this file to `environment.local.ts` and customize per developer.
// Do NOT commit `environment.local.ts` — it's gitignored.
export const environment = {
  production: false,
  spotify: {
    // Public in frontend apps; safe to keep here
    clientId: 'YOUR_SPOTIFY_CLIENT_ID',
    // Local dev redirect (must be in Spotify Dashboard > Redirect URIs)
    redirectUri: 'http://localhost:4200/auth/callback',
    scopes: [
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'streaming'
    ]
  }
};

