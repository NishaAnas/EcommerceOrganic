// Add an event listener for the form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let isValid = true;

  // Get references to form fields and error elements
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const form = document.getElementById('login_form');

  const email_error = document.getElementById('email_error');
  const password_error = document.getElementById('password_error');

  // Clear previous error messages
  email_error.innerHTML = "";
  password_error.innerHTML = "";

  // Get trimmed values of email and password
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();

  // Validation of email address
  const email_regex = /^[a-z]{3,}@[a-z]+\.(com|in|org|net)$/;
  if (emailValue.length > 50 || emailValue.length < 8) {
      isValid = false;
      email_error.innerHTML = "Enter a valid email address";
  } else if (!email_regex.test(emailValue)) {
      isValid = false;
      email_error.innerHTML = 'Enter a valid Email Address';
  }

  // Password validation
  if (passwordValue.length < 8 || passwordValue.length > 20) {
      isValid = false;
      password_error.innerHTML = "Password length must be between 8 and 20";
  }

  // Submit the form if all validations pass
  if (isValid) {
      form.submit();
  }
});
