// Get references to form fields and error elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("conformpassword");
const form = document.getElementById('signup_form');

const email_error = document.getElementById("email_error");
const password_error = document.getElementById("password_error");
const confirmPassword_error = document.getElementById("conformpassword_error");
const form_error = document.getElementById('form_error');

// Add an event listener for the form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Clear previous error messages
    email_error.innerHTML = "";
    password_error.innerHTML = "";
    confirmPassword_error.innerHTML = "";
    form_error.innerHTML = "";

    // Get trimmed values of email, password, and confirm password
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();

    // Check if any field is empty
    if (emailValue === '' || passwordValue === '' || confirmPasswordValue === '') {
        isValid = false;
        form_error.innerHTML = "All fields are required. Please fill all the fields accordingly.";
    }

    // Validation of email address
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailValue.length > 50 || emailValue.length < 8) {
        isValid = false;
        email_error.innerHTML = "Enter a valid email address.";
    } else if (!email_regex.test(emailValue)) {
        isValid = false;
        email_error.innerHTML = 'Enter a valid email address.';
    }

    // Validation of password
    const password_regex1 = /.{8,}/;          // Password must be at least 8 characters long
    const password_regex2 = /\d/;             // Password must contain at least one number
    const password_regex3 = /[a-z]/;          // Password must contain at least one lowercase letter
    const password_regex4 = /[^A-Za-z0-9]/;   // Password must contain at least one special character
    const password_regex5 = /[A-Z]/;          // Password must contain at least one uppercase letter

    if (passwordValue.length < 8) {
        isValid = false;
        password_error.innerHTML = 'Password must contain at least 8 characters.';
    } else if (!password_regex2.test(passwordValue)) {
        isValid = false;
        password_error.innerHTML = "Password must contain at least one number.";
    } else if (!password_regex3.test(passwordValue)) {
        isValid = false;
        password_error.innerHTML = "Password must contain at least one lowercase letter.";
    } else if (!password_regex4.test(passwordValue)) {
        isValid = false;
        password_error.innerHTML = "Password must contain at least one special character.";
    } else if (!password_regex5.test(passwordValue)) {
        isValid = false;
        password_error.innerHTML = "Password must contain at least one uppercase letter.";
    }

    // Validation of confirm password
    if (confirmPasswordValue.length < 8) {
        isValid = false;
        confirmPassword_error.innerHTML = 'Password must contain at least 8 characters.';
    } else if (passwordValue !== confirmPasswordValue) {
        isValid = false;
        confirmPassword_error.innerHTML = "Passwords do not match.";
    }

    // Submit the form if all validations pass
    if (isValid) {
        form.submit();
    }
});
