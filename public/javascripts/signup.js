  const userName = document.getElementById("userName");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const conformPassword = document.getElementById("conformpassword");
  const phoneNumber = document.getElementById("phoneNumber");
  const form = document.getElementById('signup_form')

  const username_error = document.getElementById("username_error");
  const email_error = document.getElementById("email_error");
  const password_error = document.getElementById("password_error");
  const conformPassword_error = document.getElementById("conformpassword_error");
  const phoneNumber_error = document.getElementById("phonenumber_error");
  const form_error = document.getElementById('form_error')

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let isValid = true;

    username_error.innerHTML = "";
    email_error.innerHTML = "";
    password_error.innerHTML = "";
    conformPassword_error.innerHTML = "";
    phoneNumber_error.innerHTML = "";
    form_error.innerHTML = "";

    const userNameValue = userName.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = conformPassword.value.trim();
    const phoneNumberValue = phoneNumber.value.trim();

    if (userNameValue.trim() === '' || emailValue.trim() === '' ||  passwordValue.trim() === '' || confirmPasswordValue.trim() === '' || phoneNumberValue.trim() === '') {
      isValid = false;
      form_error.innerHTML = "All the Fields are required please fill all the Fields accordingly"
    }

    //validation of UserName
    const username_regex1= /^[a-zA-Z]/
    const username_regex2 = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    
    
    if (userNameValue.trim().length < 3 || userNameValue.trim().length > 20) {
      isValid = false;
        username_error.innerHTML = "Username must be between 3 to 20 characters long"
    } 
    if(!username_regex1.test(userNameValue)){
      isValid = false;
          username_error.innerHTML = "Username must start with a letter"
    } else
    if(!username_regex2.test(userNameValue)){
      isValid = false;
          username_error.innerHTML = "Username must contain only alphanumeric characters and underscores."
          }
     

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


      //validation of Phone Number
      const phoneRegex = /^[1-9]\d{9}$/;
      if(phoneNumberValue.length < 10 || !phoneRegex.test(phoneNumberValue)){
        isValid = false;
        phoneNumber_error.innerHTML = 'Enter a valid Phone number'
      }
       
      if(isValid){
        form.submit();
      }
    
  })  
