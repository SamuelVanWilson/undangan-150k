/**
 * firebase-config.js
 * ==================
 * Konfigurasi Firebase untuk fitur Ucapan & Doa real-time.
 *
 * CARA SETUP FIREBASE (GRATIS):
 * 1. Buka https://console.firebase.google.com
 * 2. Klik "Add project" → beri nama (misal: "undangan-rizky-aulia")
 * 3. Nonaktifkan Google Analytics (opsional) → Create project
 * 4. Di sidebar kiri klik "Firestore Database" → Create database
 *    - Pilih "Start in test mode" (untuk development)
 *    - Pilih server region: asia-southeast1 (Singapore)
 * 5. Di sidebar kiri klik ikon "</>" (Web app) → Register app
 * 6. Salin konfigurasi firebaseConfig ke bawah ini
 * 7. Di Firestore, buat collection bernama "wishes"
 *
 * RULES FIRESTORE (Production):
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /wishes/{doc} {
 *       allow read: if true;
 *       allow create: if request.resource.data.name is string
 *                     && request.resource.data.text is string
 *                     && request.resource.data.name.size() <= 100
 *                     && request.resource.data.text.size() <= 500;
 *     }
 *   }
 * }
 */

// ─── GANTI DENGAN KONFIGURASI FIREBASE ANDA ───
// Setelah setup, paste nilai dari Firebase Console di sini:
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ─── NAMA COLLECTION FIRESTORE ───
const COLLECTION_NAME = "wishes";

// ─── EXPORT ke script.js ───
window.FIREBASE_CONFIG    = FIREBASE_CONFIG;
window.COLLECTION_NAME    = COLLECTION_NAME;
window.IS_FIREBASE_READY  = (FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY");
