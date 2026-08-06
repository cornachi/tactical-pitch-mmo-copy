import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const BACKEND_URL = appParams.serverUrl || 'https://tactical-pitch-mmo-copy-c24c4540.base44.app';
const APP_ID = appParams.appId || '6a6a15126ba98b43c24c4540';

export const base44 = createClient({
  serverUrl: BACKEND_URL,
  appId: APP_ID,
});

export default base44;
