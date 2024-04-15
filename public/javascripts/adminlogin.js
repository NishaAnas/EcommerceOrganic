    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      let isValid = true;

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const form = document.getElementById('login_form');
  
    const email_error = document.getElementById('email_error');
    const password_error = document.getElementById('password_error');  
    

    email.value = '';
    password.value = ''

    email_error.innerHTML = "";
    password_error.innerHTML = "";
  
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
  
    //validation of email Address
    const email_regex = /^[a-z]{3,}@[a-z]+\.(com|in|org|net)$/;
    if (emailValue.trim().length > 50 || emailValue.trim().length < 8) {
      isValid = false;
      email_error.innerHTML = "Enter valid email address"
    }else
    if(!email_regex.test(emailValue)){
      isValid = false;
    email_error.innerHTML = 'Enter a valid Email Address'
  }
  
  //password validation
  if (passwordValue.length < 8 || passwordValue.length > 20) {
    isValid = false;
      password_error.innerHTML = "Password length must be between 8 and 20"
  }
  
  if(isValid){
    form.submit();
  }
  
  })
  