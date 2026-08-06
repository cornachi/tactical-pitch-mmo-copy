import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId,
  token: token || import.meta.env.VITE_BASE44_TOKEN || '',
  functionsVersion,
  serverUrl: 'https://tactical-pitch-mmo-copy-c24c4540.base44.app',
  requiresAuth: false,
  checkAuthStateOnInit: false,
  appBaseUrl
});
