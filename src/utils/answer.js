import swal from 'sweetalert2'

export default (checkAnswer) => {
  return swal({
    title: '请输入密码',
    input: 'password',
    showCloseButton: false,
    showLoaderOnConfirm: true,
    showConfirmButton: true,
    confirmButtonText: '确认',
    confirmButtonColor: '#8CD4F5',
    showCancelButton: false,
    cancelButtonText: '取消',
    allowOutsideClick: false,
    allowEscapeKey: false,
    preConfirm: async (answer) => {
      if (!answer) {
        swal.showValidationMessage('密码不能为空')
        return false
      } else if (!await checkAnswer(answer)) {
        swal.showValidationMessage('你输入的密码不正确')
        return false
      }
      return true
    }
  })
}
