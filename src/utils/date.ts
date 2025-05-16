const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function parseTanggal(dateString: string) {
  try {
    const [tanggalBagian, waktuBagian] = dateString.split("T");
    const [tahun, bulan, tanggal] = tanggalBagian.split("-");
    const [jam, menit] = waktuBagian.split(":");

    return {
      tahun,
      bulan: parseInt(bulan),
      tanggal: parseInt(tanggal),
      jam,
      menit: menit.substring(0, 2),
    };
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";

  const data = parseTanggal(dateString);
  if (!data) return "Format tanggal tidak valid";

  return `${data.tanggal} ${BULAN[data.bulan - 1]} ${data.tahun} pukul ${
    data.jam
  }.${data.menit}`;
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return "-";

  const data = parseTanggal(dateString);
  if (!data) return "Format tanggal tidak valid";

  return `${data.tanggal} ${BULAN_SINGKAT[data.bulan - 1]} ${data.tahun}`;
}
