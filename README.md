# ESP32 Alcohol Detection + ntfy + Vercel

## Folder structure (repository root)
```
index.html
package.json
vercel.json
api/
  health.js
  notify.js
```
Do not put the files under `api/api/`.

## ntfy setup
1. Install the official ntfy app on your phone.
2. Generate a long random topic name (at least 32 random characters). Keep it private; anyone who knows a public ntfy.sh topic can subscribe to it.
3. In Vercel Project Settings → Environment Variables, add `NTFY_TOPIC` = that exact topic.
4. Subscribe in the phone app to `https://ntfy.sh/YOUR_RANDOM_TOPIC` using the exact same topic.
5. Optionally set `ACCESS_CODE` to a private password. If set, enter the same value in the dashboard Access code box. If unset, leave the box empty.
6. Redeploy after changing environment variables.
7. Open `https://YOUR-DOMAIN.vercel.app/api/health`; expect `{"ok":true,"provider":"ntfy"}`.

## Use
1. Open the dashboard over HTTPS.
2. Add vehicle name and optional access code.
3. Connect ESP32 using Chrome/Edge Web Serial. Pair Bluetooth Classic on Windows and choose the outgoing COM port. Use the ESP32 Bluetooth baud rate (the supplied earlier sketch uses 115200).
5. Click Send test notification and check your phone.
6. Keep the dashboard tab open and connected for browser-bridged alerts.

## ESP32 firmware
The existing ESP32 alcohol detection sketch does not need changes to its sensor threshold, hysteresis, LCD, LEDs, buzzer or relay logic. The dashboard reads serial text from the ESP32 and forwards alert events to Vercel, which publishes to ntfy.

If you want notifications when the dashboard is closed, implement direct ESP32 → Vercel/ntfy HTTP posting separately; this project intentionally sends notifications through the open dashboard connection.

## Security and limits
- ntfy notifications are internet push notifications, not SMS.
- ntfy.sh public topics are public to anyone who knows the topic. Use a high-entropy random topic; do not publish it, commit it, or share screenshots showing it.
- The Vercel endpoint has no user authentication unless you configure ACCESS_CODE. Use a strong access code and protect access to the dashboard.
- For stronger privacy and rate limiting, use a private/self-hosted ntfy server with authentication and adjust this API accordingly.
- Test with harmless simulated alerts first. This prototype is not a certified breathalyser or vehicle immobilizer.
