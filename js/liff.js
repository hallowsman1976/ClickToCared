// จัดการ LIFF SDK
const LiffHelper = {
  user: { userId: '', displayName: '' },
  isInitialized: false,
  isInClient: false,

  /**
   * เริ่มต้น LIFF
   * - ถ้าเปิดใน LINE App: ดึง profile ทันที
   * - ถ้าเปิดใน External Browser: ให้ login ก่อน
   */
  async init() {
    // ถ้า init แล้ว ไม่ต้อง init ซ้ำ
    if (this.isInitialized) return true;

    try {
      // ตรวจสอบว่ามี LIFF SDK โหลดมาหรือไม่
      if (typeof liff === 'undefined') {
        console.warn('LIFF SDK ไม่ได้โหลด - ใช้ mock user');
        this._setMockUser();
        return true;
      }

      // ตรวจสอบว่ามี LIFF_ID หรือไม่
      if (!CONFIG.LIFF_ID || CONFIG.LIFF_ID === 'YOUR_LIFF_ID') {
        console.warn('ยังไม่ได้ตั้งค่า LIFF_ID - ใช้ mock user');
        this._setMockUser();
        return true;
      }

      // เริ่มต้น LIFF
      await liff.init({ liffId: CONFIG.LIFF_ID });
      this.isInClient = liff.isInClient();

      // ตรวจสอบการ login
      if (!liff.isLoggedIn()) {
        // ถ้าเปิดใน External Browser ให้ redirect ไป login
        // หลัง login จะกลับมาที่ URL ปัจจุบัน
        liff.login({ redirectUri: window.location.href });
        return false; // หยุดรอ redirect
      }

      // ดึง profile
      const profile = await liff.getProfile();
      this.user.userId = profile.userId;
      this.user.displayName = profile.displayName;
      this.isInitialized = true;

      // บันทึก userId ลง sessionStorage เพื่อใช้ข้ามหน้า (ลด API call)
      sessionStorage.setItem('line_user_id', this.user.userId);
      sessionStorage.setItem('line_display_name', this.user.displayName);

      console.log('✅ LIFF init สำเร็จ:', this.user.displayName);
      return true;

    } catch (err) {
      console.error('LIFF init error:', err);

      // ถ้าเปิดในเบราว์เซอร์ปกติ (ทดสอบ) ให้ใช้ mock
      this._setMockUser();
      return true;
    }
  },

  /**
   * ตั้งค่า mock user สำหรับทดสอบนอก LINE
   */
  _setMockUser() {
    // ลองดึงจาก sessionStorage ก่อน
    const savedId = sessionStorage.getItem('line_user_id');
    const savedName = sessionStorage.getItem('line_display_name');

    if (savedId) {
      this.user.userId = savedId;
      this.user.displayName = savedName || 'ผู้ทดสอบ';
    } else {
      // สร้าง user id แบบสุ่มและบันทึกไว้
      const mockId = 'TEST_' + Math.random().toString(36).substring(2, 10);
      this.user.userId = mockId;
      this.user.displayName = 'ผู้ทดสอบ';
      sessionStorage.setItem('line_user_id', mockId);
      sessionStorage.setItem('line_display_name', this.user.displayName);
    }
    this.isInitialized = true;
  },

  /**
   * ปิด LIFF (กลับไปที่ LINE Chat)
   */
  close() {
    if (typeof liff !== 'undefined' && liff.isInClient()) {
      liff.closeWindow();
    } else {
      window.history.back();
    }
  }
};
