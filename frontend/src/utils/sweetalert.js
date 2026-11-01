import Swal from 'sweetalert2';

// Konfigurasi tema default SweetAlert2 Basmalah Wash
const customSwal = Swal.mixin({
  customClass: {
    confirmButton: 'px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition mx-1',
    cancelButton: 'px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition mx-1',
    popup: 'rounded-2xl p-5 shadow-2xl font-sans',
    title: 'text-base font-extrabold text-slate-900',
    htmlContainer: 'text-xs text-slate-600 leading-relaxed',
  },
  buttonsStyling: false,
});

export const showAlert = {
  success: (title, text = '') => {
    return customSwal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
    });
  },

  error: (title, text = '') => {
    return customSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Tutup',
    });
  },

  warning: (title, text = '') => {
    return customSwal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'OK',
    });
  },

  info: (title, text = '') => {
    return customSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'OK',
    });
  },

  confirm: async (title, text = '', confirmButtonText = 'Ya, Lanjutkan', cancelButtonText = 'Batal') => {
    const result = await customSwal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    });
    return result.isConfirmed;
  },

  toast: (title, icon = 'success') => {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  },
};

export default showAlert;

