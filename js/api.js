// ฟังก์ชันเรียก Google Apps Script Web App
const API = {
  // GET request พร้อม query parameters
  async get(action, params = {}) {
    const url = new URL(CONFIG.GAS_URL);
    url.searchParams.set('action', action);
    Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
    const res = await fetch(url.toString(), { method: 'GET' });
    return await res.json();
  },

  // POST request พร้อม body JSON
  // หมายเหตุ: ใช้ text/plain เพื่อหลีกเลี่ยง CORS preflight
  async post(action, payload = {}) {
    const res = await fetch(CONFIG.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    return await res.json();
  },

  // === Wrappers ===
  ping()                                  { return this.get('ping'); },
  getSlots(date)                          { return this.get('getSlots', { date }); },
  getMyBookings(lineUserId)               { return this.get('getMyBookings', { lineUserId }); },
  createBooking(data)                     { return this.post('createBooking', { data }); },
  cancelBooking(bookingId, lineUserId, cancelReason) {
    return this.post('cancelBooking', { bookingId, lineUserId, cancelReason });
  },
  adminLogin(username, password)          { return this.post('adminLogin', { username, password }); },
  getAllBookings(adminToken)              { return this.get('getAllBookings', { adminToken }); },
  updateStatus(bookingId, status, adminToken) {
    return this.post('updateStatus', { bookingId, status, adminToken });
  }
};
