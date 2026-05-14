// State การจอง
const state = {
  service: null,
  date: null,
  time: null
};

// เริ่มต้น
(async function init() {
  Utils.showLoading(true);
  await LiffHelper.init();
  renderServices();
  renderDates();
  Utils.showLoading(false);
})();

function renderServices() {
  const wrap = document.getElementById('serviceList');
  wrap.innerHTML = CONFIG.SERVICES.map(s => `
    <button data-service="${s.name}" class="service-btn w-full text-left p-3 border-2 border-gray-200 rounded-xl hover:border-sky-400 transition flex items-center gap-3">
      <span class="text-2xl">${s.icon}</span>
      <span class="text-gray-700">${s.name}</span>
    </button>
  `).join('');
  wrap.querySelectorAll('.service-btn').forEach(btn => {
    btn.onclick = () => {
      wrap.querySelectorAll('.service-btn').forEach(b => b.classList.remove('border-sky-500','bg-sky-50'));
      btn.classList.add('border-sky-500','bg-sky-50');
      state.service = btn.dataset.service;
    };
  });
}

function renderDates() {
  const wrap = document.getElementById('dateList');
  const dates = Utils.getNextTuesdays(8);
  wrap.innerHTML = dates.map(d => `
    <button data-date="${d}" class="date-btn w-full text-left p-3 border-2 border-gray-200 rounded-xl hover:border-emerald-400 transition">
      ${Utils.toThaiDate(d)}
    </button>
  `).join('');
  wrap.querySelectorAll('.date-btn').forEach(btn => {
    btn.onclick = async () => {
      wrap.querySelectorAll('.date-btn').forEach(b => b.classList.remove('border-emerald-500','bg-emerald-50'));
      btn.classList.add('border-emerald-500','bg-emerald-50');
      state.date = btn.dataset.date;
      state.time = null;
      await loadTimes(state.date);
    };
  });
}

async function loadTimes(date) {
  Utils.showLoading(true);
  const res = await API.getSlots(date);
  Utils.showLoading(false);

  document.getElementById('timeSection').style.display = 'block';
  const wrap = document.getElementById('timeList');

  if (!res.ok) {
    wrap.innerHTML = `<div class="col-span-2 text-red-500 text-center">${res.error}</div>`;
    return;
  }

  const allFull = res.slots.every(s => !s.available);
  if (allFull) {
    wrap.innerHTML = `<div class="col-span-2 text-center text-orange-600 py-3">วันนี้คิวเต็มแล้ว กรุณาเลือกวันอังคารถัดไป</div>`;
    return;
  }

  wrap.innerHTML = res.slots.map(s => `
    <button data-time="${s.time}" class="time-btn p-2 border-2 rounded-xl ${s.available ? 'border-gray-200 hover:border-sky-400' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}" ${s.available ? '' : 'disabled'}>
      ${s.time}${s.available ? '' : '<br><span class="text-xs">เต็มแล้ว</span>'}
    </button>
  `).join('');

  wrap.querySelectorAll('.time-btn:not([disabled])').forEach(btn => {
    btn.onclick = () => {
      wrap.querySelectorAll('.time-btn').forEach(b => b.classList.remove('border-sky-500','bg-sky-50'));
      btn.classList.add('border-sky-500','bg-sky-50');
      state.time = btn.dataset.time;
      document.getElementById('formSection').style.display = 'block';
    };
  });
}

document.getElementById('btnSubmit').onclick = async () => {
  // Validation
  if (!state.service) return Utils.alertWarning('กรุณาเลือกบริการ');
  if (!state.date)    return Utils.alertWarning('กรุณาเลือกวันรับบริการ');
  if (!state.time)    return Utils.alertWarning('กรุณาเลือกช่วงเวลา');

  const fullName = document.getElementById('fullName').value.trim();
  const age      = document.getElementById('age').value.trim();
  const address  = document.getElementById('address').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const consent  = document.getElementById('consent').checked;

  if (!fullName) return Utils.alertWarning('กรุณากรอกชื่อ-สกุล');
  if (!age || isNaN(age) || age < 10 || age > 59) return Utils.alertWarning('กรุณากรอกอายุให้ถูกต้อง (10-59 ปี)');
  if (!address) return Utils.alertWarning('กรุณากรอกที่อยู่');
  if (!/^\d{9,10}$/.test(phone)) return Utils.alertWarning('กรุณากรอกเบอร์ติดต่อให้ถูกต้อง (9-10 หลัก)');
  if (!consent) return Utils.alertWarning('กรุณายินยอมให้ใช้ข้อมูลเพื่อการนัดหมาย');

  // ยืนยัน
  const confirm = await Swal.fire({
    title: 'ยืนยันการจอง?',
    html: `<div class="text-left">
      <p><b>บริการ:</b> ${state.service}</p>
      <p><b>วันที่:</b> ${Utils.toThaiDate(state.date)}</p>
      <p><b>เวลา:</b> ${state.time}</p>
      <p><b>ชื่อ:</b> ${fullName}</p>
    </div>`,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#10b981'
  });
  if (!confirm.isConfirmed) return;

  Utils.showLoading(true);
  const res = await API.createBooking({
    line_user_id: LiffHelper.user.userId,
    line_display_name: LiffHelper.user.displayName,
    full_name: fullName,
    age: parseInt(age),
    address: address,
    phone: phone,
    service_type: state.service,
    booking_date: state.date,
    booking_time: state.time,
    consent: true
  });
  Utils.showLoading(false);

  if (res.ok) {
    await Utils.alertSuccess('จองคิวสำเร็จ');
    window.location.href = 'my-booking.html';
  } else {
    Utils.alertError(res.error || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่');
  }
};
