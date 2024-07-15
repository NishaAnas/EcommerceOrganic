// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const form = document.getElementById('login_form');
  const email_error = document.getElementById('email_error');
  const password_error = document.getElementById('password_error');   

  // Add submit event listener to form
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission
    let isValid = true; // Flag to track form validation status

    email_error.innerHTML = ""; // Clear any previous email error messages
    password_error.innerHTML = ""; // Clear any previous password error messages

    const emailValue = email.value.trim(); // Get trimmed value of email input
    const passwordValue = password.value.trim(); // Get trimmed value of password input

    // Regular expression to validate email format
    const email_regex = /^[a-z]{3,}@[a-z]+\.(com|in|org|net)$/;

    // Validate email length and format
    if (emailValue.length > 50 || emailValue.length < 8) {
      isValid = false;
      email_error.innerHTML = "Email address must be between 8 and 50 characters";
    } else if (!email_regex.test(emailValue)) {
      isValid = false;
      email_error.innerHTML = 'Enter a valid email address';
    }

    // Validate password length
    if (passwordValue.length < 8 || passwordValue.length > 20) {
      isValid = false;
      password_error.innerHTML = "Password length must be between 8 and 20";
    }

    // If form is valid, submit it
    if (isValid) {
      form.submit();
    }

    // Clear input fields after submission attempt
    email.value = '';
    password.value = '';
  });
});
