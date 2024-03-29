function validateForm(event) {
  console.log("Validation function called");
  // Prevent the form from submitting if validation fails
  event.preventDefault();
  var firstName = document.getElementById('firstName').value
  var lastName = document.getElementById('lastName').value
  var userName = document.getElementById("userName").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var conformPassword = document.getElementById("conformpassword").value;
  var phoneNumber = document.getElementById("phoneNumber").value;

  //validate first name
  if (firstName.trim().length < 3 || firstName.trim().length > 20) {
    alert("First Name must be between 3 and 20 characters long");
    return false;
  }
  if (!/^[a-zA-Z]{3,}$/.test(firstName)) {
    alert("First Name must start with an alphabet and contain at least 3 characters");
    return false;
  }


  //validate last name
  if (lastName.trim().length < 3 || lastName.trim().length > 20) {
    alert("Last Name must be between 3 and 20 characters long");
    return false;
  }
  if (!/^[a-zA-Z]{3,}$/.test(lastName)) {
    alert("Last Name must start with an alphabet and contain at least 3 characters");
    return false;
  }


  // Validate username length
  if (userName.trim().length < 3 || userName.trim().length > 20) {
    alert("Username must be between 3 and 20 characters long");
    return false;
  }
  if (!/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(userName)) {
    alert("Username must start with an alphabet, contain only alphanumeric characters, and be between 3 and 20 characters long");
    return false;
  }

  // Validate email length
  if (email.trim().length > 50) {
    alert("Email address should not exceed 50 characters");
    return false;
  }

  // Validate email format
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return false;
  }

  // Validate password
  if (password.length < 8) {
    alert("Password must be at least 8 characters long");
    return false;
  }

  // Validate confirm password
  if (password !== conformPassword) {
    alert("Passwords do not match");
    return false;
  }

  // Validate phone number
  var phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    alert("Please enter a valid 10-digit phone number");
    return false;
  }
  if (!/^(?!([0-9])\1{9})\d{10}$/.test(phoneNumber)) {
    alert("Please enter a valid 10-digit phone number without repeating the same digit");
    return false;
  }
  var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/;
  if (!passwordRegex.test(password)) {
    alert("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
    return false;
  }

  // If all validations pass, allow form submission
  document.querySelector("form").submit();
}