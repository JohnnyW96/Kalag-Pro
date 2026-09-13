import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { isTestMode } from '@/lib/mock/testMode';
import { createMockBase44 } from '@/lib/mock/mockClient';

function createRealClient() {
  const { appId, token, functionsVersion, appBaseUrl } = appParams;
  return createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: '',
    appBaseUrl
  });
}

// במצב בדיקה מוחלף הלקוח האמיתי בלקוח מדומה עם דאטא בזיכרון —
// זהו השינוי היחיד הדרוש כדי שכל האפליקציה (שמייבאת את base44 מכאן) תעבוד על נתוני דוגמה.
export const base44 = isTestMode() ? createMockBase44() : createRealClient();
