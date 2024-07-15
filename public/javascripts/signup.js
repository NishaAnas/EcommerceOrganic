// Selecting form elements and error placeholders
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

// Adding event listener to form submission
form.addEventListener('submit',(e)=>{
  e.preventDefault(); // Prevent default form submission

  let isValid = true; // Flag to track overall form validity

  // Clearing previous error messages
  username_error.innerHTML = "";
  email_error.innerHTML = "";
  password_error.innerHTML = "";
  conformPassword_error.innerHTML = "";
  phoneNumber_error.innerHTML = "";
  form_error.innerHTML = "";

  // Getting trimmed values from form inputs
  const userNameValue = userName.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const confirmPasswordValue = conformPassword.value.trim();
  const phoneNumberValue = phoneNumber.value.trim();

  // Checking if any required fields are empty
  if (userNameValue === '' || emailValue === '' || passwordValue === '' || confirmPasswordValue === '' || phoneNumberValue === '') {
    isValid = false;
    form_error.innerHTML = "All fields are required. Please fill in all fields."; // Displaying error message
  }

  // Validation of Username
  const username_regex1 = /^[a-zA-Z]/; // Username must start with a letter
  const username_regex2 = /^[a-zA-Z][a-zA-Z0-9_]*$/; // Username must contain only alphanumeric characters and underscores

  if (userNameValue.length < 3 || userNameValue.length > 20) {
    isValid = false;
    username_error.innerHTML = "Username must be between 3 to 20 characters long"; // Displaying error message
  } else if (!username_regex1.test(userNameValue)) {
    isValid = false;
    username_error.innerHTML = "Username must start with a letter"; // Displaying error message
  } else if (!username_regex2.test(userNameValue)) {
    isValid = false;
    username_error.innerHTML = "Username must contain only alphanumeric characters and underscores."; // Displaying error message
  }

  // Validation of Email Address
  const email_regex = /^[a-z]{3,}@[a-z]+\.(com|in|org|net)$/; // Valid email format
  if (emailValue.length > 50 || emailValue.length < 8) {
    isValid = false;
    email_error.innerHTML = "Enter a valid email address"; // Displaying error message
  } else if (!email_regex.test(emailValue)) {
    isValid = false;
    email_error.innerHTML = 'Enter a valid Email Address'; // Displaying error message
  }

  // Validation of Password
  const password_regex1 = /.{8,}/; // Password must be at least 8 characters long
  const password_regex2 = /\d/; // Password must contain at least one number
  const password_regex3 = /[a-z]/; // Password must contain at least one lowercase letter
  const password_regex4 = /[^A-Za-z0-9]/; // Password must contain at least one special character
  const password_regex5 = /[A-Z]/; // Password must contain at least one uppercase letter

  if (passwordValue.length < 8) {
    isValid = false;
    password_error.innerHTML = 'Password must contain at least 8 characters'; // Displaying error message
  } else if (!password_regex2.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one number"; // Displaying error message
  } else if (!password_regex3.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one lowercase letter"; // Displaying error message
  } else if (!password_regex4.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one special character"; // Displaying error message
  } else if (!password_regex5.test(passwordValue)) {
    isValid = false;
    password_error.innerHTML = "Password must contain at least one uppercase letter"; // Displaying error message
  }

  // Validation of Confirm Password
  if (confirmPasswordValue.length < 8) {
    isValid = false;
    conformPassword_error.innerHTML = 'Password must contain at least 8 characters'; // Displaying error message
  } else if (passwordValue !== confirmPasswordValue) {
    isValid = false;
    conformPassword_error.innerHTML = "Passwords do not match"; // Displaying error message
  }

  // Validation of Phone Number
  const phoneRegex = /^[1-9]\d{9}$/; // Valid phone number format
  if (phoneNumberValue.length < 10 || !phoneRegex.test(phoneNumberValue)) {
    isValid = false;
    phoneNumber_error.innerHTML = 'Enter a valid phone number'; // Displaying error message
  }

  // Submitting form if all validations pass
  if (isValid) {
    form.submit();
  }
});
