import { getEffectiveRuntime } from '@/services/demo/demoRuntime';
export const dynamic = 'force-dynamic';
export async function GET() {
  const config = await getEffectiveRuntime();
  if (!config.messaging || config.demoMode)
    return new Response('', {
      headers: {
        'content-type': 'application/javascript',
        'cache-control': 'no-store',
      },
    });
  const script = `
self.addEventListener('notificationclick', event => {
 event.notification.close();
 const url = new URL('/chat', self.location.origin).href;
 event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(async windows => {
  const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
  if (existing) { await existing.navigate(url); return existing.focus(); }
  return clients.openWindow(url);
 }));
});
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config.messaging.firebase)});
firebase.messaging().onBackgroundMessage(payload => {
 if (payload.notification) return;
 try {
  const event = JSON.parse(payload.data?.portal_event || 'null');
  if (event?.event_type !== 'notification' || typeof event.data?.title !== 'string' || typeof event.data?.body !== 'string') return;
  return self.registration.showNotification(event.data.title, { body: event.data.body, tag: event.event_id });
 } catch {}
});`;
  return new Response(script, {
    headers: {
      'content-type': 'application/javascript',
      'cache-control': 'no-store',
      'service-worker-allowed': '/',
    },
  });
}
