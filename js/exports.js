// =================== SERARAH FINANCE - EXPORTS (PDF & EXCEL) ===================
// Ekspor laporan keuangan ke PDF atau Excel berdasarkan rentang tanggal.

var SF = window.SF || {};

SF.getFiltered = function(division, from, to, status) {
  let list = SF.getTransactions();
  if (division && division !== 'all') {
    list = list.filter(t => t.division === division);
  }
  if (from) list = list.filter(t => t.date >= from);
  if (to) list = list.filter(t => t.date <= to);
  if (status && status !== 'all') {
    list = list.filter(t => t.status === status);
  }
  return list;
};

SF.exportRows = function(division, from, to, status) {
  const list = SF.getFiltered(division, from, to, status);
  return list.map(t => ({
    id: t.id,
    tanggal: SF.formatDateShort(t.date),
    divisi: SF.roleName(t.division),
    tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    jumlah: t.amount,
    deskripsi: t.description,
    status: t.status === 'approved' ? 'Disetujui' : (t.status === 'rejected' ? 'Ditolak' : 'Menunggu')
  }));
};

// ---------- Export Excel (SheetJS) ----------
SF.exportExcel = function(division, from, to, status) {
  if (typeof XLSX === 'undefined') {
    alert('Library Excel belum dimuat. Periksa koneksi internet.');
    return;
  }
  const rows = SF.exportRows(division, from, to, status);
  const data = rows.map(r => ({
    'Tanggal': r.tanggal,
    'Divisi': r.divisi,
    'Tipe': r.tipe,
    'Jumlah': r.jumlah,
    'Deskripsi': r.deskripsi,
    'Status': r.status
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
  const fname = 'laporan_keuangan_' + Date.now() + '.xlsx';
  XLSX.writeFile(wb, fname);
};

// ---------- Export PDF (jsPDF + autotable) ----------
SF.exportPDF = function(division, from, to, status) {
  if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
    alert('Library PDF belum dimuat. Periksa koneksi internet.');
    return;
  }
  const rows = SF.exportRows(division, from, to, status);
  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(18);
  doc.text('SERARAH FINANCE', 14, 20);
  doc.setFontSize(11);
  doc.text('Laporan Keuangan', 14, 28);
  doc.setFontSize(9);
  const range = (from || '-') + ' s/d ' + (to || '-');
  doc.text('Rentang Tanggal: ' + range, 14, 34);
  doc.text('Dicetak: ' + new Date().toLocaleString('id-ID'), 14, 40);

  const body = rows.map(r => [r.tanggal, r.divisi, r.tipe, 'Rp ' + r.jumlah.toLocaleString('id-ID'), r.deskripsi, r.status]);
  doc.autoTable({
    startY: 46,
    head: [['Tanggal', 'Divisi', 'Tipe', 'Jumlah', 'Deskripsi', 'Status']],
    body: body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [26, 58, 92] }
  });
  doc.save('laporan_keuangan_' + Date.now() + '.pdf');
};

window.SF = SF;
