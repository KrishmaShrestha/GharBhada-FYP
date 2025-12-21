import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

// Configure toastr options
toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: true,
  progressBar: true,
  positionClass: 'toast-top-right',
  preventDuplicates: false,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut'
};

// Custom notification functions
export const showSuccess = (message, title = 'Success') => {
  toastr.success(message, title);
};

export const showError = (message, title = 'Error') => {
  toastr.error(message, title);
};

export const showWarning = (message, title = 'Warning') => {
  toastr.warning(message, title);
};

export const showInfo = (message, title = 'Info') => {
  toastr.info(message, title);
};

export default toastr;