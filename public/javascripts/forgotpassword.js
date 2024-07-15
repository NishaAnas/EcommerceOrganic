// Get references to DOM elements
const email = document.getElementById("email");
const email_error = document.getElementById("email_error");
const form = document.getElementById('forgotPassword');

// Add submit event listener to form
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent form submission
  let isValid = true; // Flag to track form validation status

  email_error.innerHTML = ""; // Clear any previous error messages
  const emailValue = email.value.trim(); // Get trimmed value of email input

  // Regular expression to validate email format
  const email_regex = /^[a-z]{3,}@[a-z]+\.(com|in|org|net)$/;

  // Validate email length
  if (emailValue.length > 50 || emailValue.length < 8) {
    isValid = false;
    email_error.innerHTML = "Email address must be between 8 and 50 characters";
  } else if (!email_regex.test(emailValue)) { // Validate email format
    isValid = false;
    email_error.innerHTML = 'Enter a valid email address';
  }

  // If form is valid, submit it
  if (isValid) {
    form.submit();
  }
});
