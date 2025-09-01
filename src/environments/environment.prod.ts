export const environment = {
  production: true,
  spotify: {
    clientId: 'e7b98e9c42d8487aa7cedaa2060de245',
    // Must match an allowed redirect in Spotify dashboard (prod URL)
    redirectUri: 'https://saxjax.dk/musician_practice_tool/auth/callback',
    scopes: [
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'streaming'
    ]
  }
};

