(async function init() {
  Utils.showLoading(true);
  await LiffHelper.init();
  await loadBookings();
  Utils.showLoading(false);
})();

async function loadBookings() {
  const wrap = document.getElementById('bookingList');
  const res = await API.getMyBookings(LiffHelper.user.userId);

  if (!res.ok || !res.bookings.length) {
    wrap.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-gray-500">
      ไม่พบรายการจองของคุณ
      <br><a href="booking.html" class="text-sky-600 mt-3 inline-block">+ จองคิวใหม่</a>
    </div>`;
    return;
  }

  wrap.innerHTML = res.bookings.map(b => `
    <div class="bg-white rounded-2xl p-4 shadow">
      <div class="flex justify-between items-start mb-2">
        <div>
          <p class="font-medium text-gray-800">${b.full_name}</p>
          <p class="text-sm text-emerald-600">${b.service_type}</p>
        </div>
        <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">รอรับบริการ</span>
      </div>
      <p class="text-sm text-gray-600">📅 ${Utils.toThaiDate(b.booking_date)}</p>
      <p class="text-sm text-gray-600">⏰ ${b.booking_time}</p>
      <button data-id="${b.id}" class="cancel-btn w-full mt-3 py-2 text-red-500 border border-red-300 rounded-xl hover:bg-red-50">
        ยกเลิกคิว
      </button>
    </div>
  `).join('');

  wrap.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.onclick = () => cancelBooking(btn.dataset.id);
  });
}

async function cancelBooking(id) {
  const { isConfirmed, value: reason } = await Swal.fire({
    title: 'คุณต้องการยกเลิกคิวนี้หรือไม่?',
    input: 'select',
    inputOptions: {
      'ติดธุระ': 'ติดธุระ',
      'เปลี่ยนใจ': 'เปลี่ยนใจ',
      'ไม่สะดวก': 'ไม่สะดวก',
      'ไม่ระบุ': 'ไม่ระบุ'
    },
    inputPlaceholder: 'เหตุผลการยกเลิก',
    showCancelButton: true,
    confirmButtonText: 'ยืนยันยกเลิก',
    cancelButtonText: 'ไม่ใช่',
    confirmButtonColor: '#ef4444'
  });
  if (!isConfirmed) return;

  Utils.showLoading(true);
  const res = await API.cancelBooking(id, LiffHelper.user.userId, reason);
  Utils.showLoading(false);

  if (res.ok) {
    await Utils.alertSuccess('ยกเลิกคิวสำเร็จ');
    loadBookings();
  } else {
    Utils.alertError(res.error);
  }
}
