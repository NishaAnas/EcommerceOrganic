const password = document.getElementById("password");
const conformPassword = document.getElementById("confirmpassword");
const form = document.getElementById('resetPasswordform')

const password_error = document.getElementById("password_error");
const conformPassword_error = document.getElementById("conformpassword_error");

form.addEventListener('submit',(e)=>{
  e.preventDefault();
  let isValid = true;

  password_error.innerHTML = "";
  conformPassword_error.innerHTML = "";

  const passwordValue = password.value.trim();
  const confirmPasswordValue = conformPassword.value.trim();

  //validation of password
  const password_regex1 =/.{8,}/      //Password must be at least 8 characters long
  const password_regex2 =/\d/         //Password must contain at least one number
  const password_regex3 =/[a-z]/      //Password must contain at least one lowercase letter
  const password_regex4 =/[^A-Za-z0-9]/   //Password must contain at least one special character
  const password_regex5 =/[A-Z]/         //Password must contain at least one uppercase letter  
  
  if(passwordValue.trim().length < 8){
    isValid = false;
    password_error.innerHTML = 'Password must contain atleast 8 characters'
  }else 
  if (!password_regex2.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one number"  
  } else
  if (!password_regex3.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one lowercase letter"  
  }else
  if (!password_regex4.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one special character"  
  }else
  if (!password_regex5.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one uppercase letter" 
  }  

    //validation of Confirm Password
    if(confirmPasswordValue.trim().length < 8){
      isValid = false;
    conformPassword_error.innerHTML = 'Password must contain atleast 8 characters'
    }else 
    if (passwordValue !== confirmPasswordValue) {
      isValid = false;
    conformPassword_error.innerHTML = "Not Matching With the Password"
  }

  if(isValid){
    form.submit();
  }
  
})