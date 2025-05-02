// sweetAlert.ts
import Swal, { SweetAlertResult } from "sweetalert2";

// Fungsi untuk alert sukses dengan durasi singkat (auto-close)
export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1500,
    showConfirmButton: false,
  });
};

// Fungsi untuk alert error
export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Tutup",
  });
};

// Fungsi untuk alert warning/peringatan dengan konfirmasi
export const showWarningAlert = (title: string, text: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "Tutup",
  });
};

// Fungsi untuk alert konfirmasi dengan opsi Ya/Tidak
export const showConfirmationAlert = (title: string, text: string, confirmButtonText = "Ya", cancelButtonText = "Batal") => {
  return Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText,
    cancelButtonText,
  });
};

// Fungsi untuk alert konfirmasi penghapusan
export const showDeleteConfirmationAlert = (itemName: string, message?: string) => {
  return Swal.fire({
    title: `Konfirmasi Hapus ${itemName}`,
    text: message || `Apakah Anda yakin ingin menghapus ${itemName} ini?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
  });
};

// Fungsi untuk alert akses ditolak
export const showForbiddenAlert = (title = "Akses Ditolak", text = "Anda tidak memiliki akses untuk melakukan tindakan ini.") => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Tutup",
  });
};

// Helper untuk memeriksa apakah konfirmasi dikonfirmasi
export const isConfirmed = (result: SweetAlertResult) => {
  return result.isConfirmed;
};

// Export Swal langsung jika ada kasus yang tidak tercakup
export default Swal;
