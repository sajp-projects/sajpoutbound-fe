import Swal, { SweetAlertResult } from "sweetalert2";

export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1500,
    showConfirmButton: false,
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Tutup",
  });
};

export const showWarningAlert = (title: string, text: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "Tutup",
  });
};

export const showConfirmationAlert = (
  title: string,
  text: string,
  confirmButtonText = "Ya",
  cancelButtonText = "Batal"
) => {
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

export const showDeleteConfirmationAlert = (
  itemName: string,
  message?: string
) => {
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

export const isConfirmed = (result: SweetAlertResult) => {
  return result.isConfirmed;
};

export default Swal;
