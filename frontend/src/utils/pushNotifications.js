// Push notification utilities for Obelisco Connect

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export async function getVapidPublicKey() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/push/vapid-public-key`);
    const data = await res.json();
    return data.vapid_public_key;
  } catch (e) {
    console.error('Error getting VAPID key:', e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(userId, userType) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return { success: false, message: 'Push not supported' };
  }

  try {
    // Get permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Permission denied' };
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID key
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      return { success: false, message: 'Could not get VAPID key' };
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });

    // Send subscription to backend
    const token = localStorage.getItem('connect_token');
    const res = await fetch(`${BACKEND_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        },
        user_id: userId,
        user_type: userType
      })
    });

    if (!res.ok) throw new Error('Failed to subscribe');

    return { success: true, message: 'Subscribed to notifications' };
  } catch (e) {
    console.error('Push subscription error:', e);
    return { success: false, message: e.message };
  }
}

export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      const token = localStorage.getItem('connect_token');
      await fetch(`${BACKEND_URL}/api/push/unsubscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    return { success: true };
  } catch (e) {
    console.error('Unsubscribe error:', e);
    return { success: false, message: e.message };
  }
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (e) {
    return false;
  }
}
