// จัดการ LIFF SDK
const LiffHelper = {
  user: { userId: '', displayName: '' },

  async init() {
    try {
      await liff.init({ liffId: CONFIG.LIFF_ID });
      if (!liff.isLoggedIn()) {
        liff.login();
        return false;
      }
      const profile = await liff.getProfile();
      this.user.userId = profile.userId;
      this.user.displayName = profile.displayName;
      return true;
    } catch (err) {
      // ในกรณีทดสอบนอก LIFF ให้ใช้ค่า mock
      console.warn('LIFF init failed, using mock user:', err);
      this.user.userId = 'TEST_USER_' + Date.now();
      this.user.displayName = 'ผู้ทดสอบ';
      return true;
    }
  }
};
