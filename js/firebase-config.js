// ============================================
//  Firebase Config - ใส่ค่าจาก Firebase Console ตรงนี้
// ============================================
// วิธีได้ค่า Config:
// 1. ไป https://console.firebase.google.com
// 2. สร้างโปรเจกต์ใหม่ (หรือใช้ที่มี)
// 3. กด "เพิ่มแอป" → เลือก Web (</>)
// 4. คัดลอกค่า firebaseConfig มาวางด้านล่าง

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// เปลี่ยนเป็น true เมื่อใส่ Config จริงแล้ว
const USE_FIREBASE = false;

// ชื่อ collection ใน Firestore
const COLLECTION_SETTINGS = "settings";
const COLLECTION_MEMBERS = "members";
const DOC_SETTINGS_ID = "main";
