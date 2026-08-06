import { createClient } from '@base44/sdk';

const BACKEND_URL = 'https://tactical-pitch-mmo-copy-c24c4540.base44.app';
const APP_ID = '6a6a15126ba98b43c24c4540';

export const base44 = createClient({
  serverUrl: BACKEND_URL,
  appId: APP_ID,
});

export default base44;
