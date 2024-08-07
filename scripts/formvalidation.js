function formValidation(){
    let checkbox = document.getElementById('login-checkbox');
    let signupBtn = document.getElementById('login-form-button');
    if (checkbox.value == true) {
        signupBtn.disabled = false;
    }
}