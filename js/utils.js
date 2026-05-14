const Utils = {
  // สร้างรายการวันอังคาร 8 สัปดาห์ข้างหน้า
  getNextTuesdays(weeks = 8) {
    const result = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    let d = new Date(today);
    // เลื่อนไปวันอังคารถัดไป (รวมวันนี้ถ้าวันนี้คืออังคาร)
    while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
    for (let i = 0; i < weeks; i++) {
      result.push(this.toISO(d));
      d.setDate(d.getDate() + 7);
    }
    return result;
  },

  toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  },

  toThaiDate(isoDate) {
    const d = new Date(isoDate + 'T00:00:00');
    const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    const months = ['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `วัน${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()+1]} ${d.getFullYear()+543}`;
  },

  showLoading(show = true) {
    const el = document.getElementById('loadingOverlay');
    if (el) el.style.display = show ? 'flex' : 'none';
  },

  alertSuccess(msg)   { return Swal.fire({ icon: 'success', title: 'สำเร็จ', text: msg, confirmButtonColor: '#10b981' }); },
  alertError(msg)     { return Swal.fire({ icon: 'error',   title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#ef4444' }); },
  alertWarning(msg)   { return Swal.fire({ icon: 'warning', title: 'แจ้งเตือน', text: msg, confirmButtonColor: '#f59e0b' }); }
};
