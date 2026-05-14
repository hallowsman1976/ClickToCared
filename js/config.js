// ค่าตั้งค่าระบบ - ไม่มี secret token ใดๆ
const CONFIG = {
  LIFF_ID: "2010079039-FNzhrYce",
  // URL ของ Google Apps Script Web App หลังจาก Deploy
  GAS_URL: "https://script.google.com/macros/s/AKfycbxyOxtOQw4sh5dsE1kZKK2wGWCimIuqyLAu_cur1gAMQzprrVjeWrNrhQOvpm1hhR36bQ/exec",
  // ประเภทบริการ
  SERVICES: [
    { id: 's1', name: 'รับบริการฝังยาคุมกำเนิด', icon: '💉' },
    { id: 's2', name: 'รับบริการถอดยาฝังคุมกำเนิด', icon: '🩹' },
    { id: 's3', name: 'รับบริการถอดและฝังยาคุมกำเนิด', icon: '🔄' },
    { id: 's4', name: 'รับบริการล้างแผลหลังถอดหรือหลังฝังยาคุมกำเนิด', icon: '🩺' },
    { id: 's5', name: 'รับคำปรึกษาการคุมกำเนิด', icon: '💬' }
  ]
};
