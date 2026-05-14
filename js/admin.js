let adminToken = localStorage.getItem('admin_token') || '';
let allBookings = [];

if (adminToken) showDashboard();

document.getElementById('btnLogin').onclick = async () => {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (!u || !p) return Utils.alertWarning('กรอกข้อมูลให้ครบ');

  Utils.showLoading(true);
  const res = await API.adminLogin(u, p);
  Utils.showLoading(false);

  if (res.ok) {
    adminToken = res.token;
    localStorage.setItem('admin_token', adminToken);
    showDashboard();
  } else {
    Utils.alertError(res.error);
  }
};

document.getElementById('btnLogout').onclick = () => {
  localStorage.removeItem('admin_token');
  location.reload();
};

async function showDashboard() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  await loadAll();
}

async function loadAll() {
  Utils.showLoading(true);
  const res = await API.getAllBookings(adminToken);
  Utils.showLoading(false);

  if (!res.ok) {
    Utils.alertError('Session หมดอายุ');
    localStorage.removeItem('admin_token');
    location.reload();
    return;
  }
  allBookings = res.bookings;
  renderStats();
  renderTable();
}

function renderStats() {
  const today = Utils.toISO(new Date());
  document.getElementById('statAll').textContent = allBookings.length;
  document.getElementById('statToday').textContent = allBookings.filter(b => b.booking_date === today).length;
  document.getElementById('statPending').textContent = allBookings.filter(b => b.status === 'pending').length;
  document.getElementById('statCancel').textContent = allBookings.filter(b => b.status === 'cancelled').length;
}

function renderTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const fDate  = document.getElementById('filterDate').value;
  const fStat  = document.getElementById('filterStatus').value;

  const list = allBookings.filter(b => {
    if (search && !(`${b.full_name} ${b.phone} ${b.service_type}`.toLowerCase().includes(search))) return false;
    if (fDate && b.booking_date !== fDate) return false;
    if (fStat && b.status !== fStat) return false;
    return true;
  });

  const statusMap = {
    pending: '<span class="text-yellow-600">รอรับบริการ</span>',
    completed: '<span class="text-emerald-600">เสร็จสิ้น</span>',
    cancelled: '<span class="text-red-500">ยกเลิก</span>',
    no_show: '<span class="text-gray-500">ไม่มา</span>'
  };

  document.getElementById('bookingTable').innerHTML = list.map(b => `
    <tr class="border-b">
      <td class="p-2">${b.full_name}</td>
      <td class="p-2 text-center">${b.age}</td>
      <td class="p-2">${b.phone}</td>
      <td class="p-2">${b.service_type}</td>
      <td class="p-2">${b.booking_date}</td>
      <td class="p-2">${b.booking_time}</td>
      <td class="p-2">${statusMap[b.status] || b.status}</td>
      <td class="p-2">
        <select data-id="${b.id}" class="status-select border rounded p-1 text-xs">
          <option value="">-เปลี่ยนสถานะ-</option>
          <option value="pending">รอรับบริการ</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="cancelled">ยกเลิก</option>
          <option value="no_show">ไม่มา</option>
        </select>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.status-select').forEach(sel => {
    sel.onchange = async () => {
      if (!sel.value) return;
      const c = await Swal.fire({
        title: 'ยืนยันการเปลี่ยนสถานะ?',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน'
      });
      if (!c.isConfirmed) return;
      Utils.showLoading(true);
      const res = await API.updateStatus(sel.dataset.id, sel.value, adminToken);
      Utils.showLoading(false);
      if (res.ok) { Utils.alertSuccess('อัปเดตเรียบร้อย'); loadAll(); }
      else Utils.alertError(res.error);
    };
  });
}

['searchInput','filterDate','filterStatus'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderTable);
  document.getElementById(id).addEventListener('change', renderTable);
});

document.getElementById('btnExport').onclick = () => {
  const headers = ['ชื่อ','อายุ','เบอร์','ที่อยู่','บริการ','วันที่','เวลา','สถานะ'];
  const rows = allBookings.map(b => [
    b.full_name, b.age, b.phone, b.address, b.service_type,
    b.booking_date, b.booking_time, b.status
  ]);
  const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${(c+'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bookings_${Utils.toISO(new Date())}.csv`;
  link.click();
};
