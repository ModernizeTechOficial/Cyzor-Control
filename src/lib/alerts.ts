import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export const showSuccess = (message: string) => {
  Toast.fire({
    icon: 'success',
    title: message
  });
};

export const showError = (message: string) => {
  Toast.fire({
    icon: 'error',
    title: message
  });
};

export const confirmAction = async (title: string, text: string) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#111',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, continuar!',
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
};
