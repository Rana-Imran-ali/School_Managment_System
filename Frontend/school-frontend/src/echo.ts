import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'sh7xp8eqbcxrt9yrgp0y',
  wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
  wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${apiBase}/broadcasting/auth`,
  authorizer: (channel: { name: string }) => {
    return {
      authorize: (socketId: string, callback: (error: Error | null, authData?: any) => void) => {
        const token = getAuthToken();
        fetch(`${apiBase}/broadcasting/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Broadcasting auth failed (${response.status}): ${errorText}`);
            }
            return response.json();
          })
          .then((data) => {
            callback(null, data);
          })
          .catch((error) => {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error('Channel authorization error:', err);
            callback(err);
          });
      },
    };
  },
});

export default echo;
