// ค่าตั้งค่าระบบ - ไม่มี secret token ใดๆ
const CONFIG = {
  LIFF_ID: "YOUR_LIFF_ID",
  // URL ของ Google Apps Script Web App หลังจาก Deploy
  GAS_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  // ประเภทบริการ
  SERVICES: [
    { id: 's1', name: 'รับบริการฝังยาคุมกำเนิด', icon: '💉' },
    { id: 's2', name: 'รับบริการถอดยาฝังคุมกำเนิด', icon: '🩹' },
    { id: 's3', name: 'รับบริการถอดและฝังยาคุมกำเนิด', icon: '🔄' },
    { id: 's4', name: 'รับบริการล้างแผลหลังถอดหรือหลังฝังยาคุมกำเนิด', icon: '🩺' },
    { id: 's5', name: 'รับคำปรึกษาการคุมกำเนิด', icon: '💬' }
  ]
};
