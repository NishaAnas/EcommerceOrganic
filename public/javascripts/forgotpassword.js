const email = document.getElementById("email");
const email_error = document.getElementById("email_error");

const form = document.getElementById('forgotPassword');

form.addEventListener('submit',(e)=>{
  e.preventDefault();
  let isValid = true;

  email_error.innerHTML = "";
  const emailValue = email.value.trim();

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

 if(isValid){
  form.submit();
}

});
  