function validateForm(event) {
  event.preventDefault(); // Prevent default form submission behavior

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  
  // Email validation
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return false;
  }

  // Email length validation
  if (email.length > 50) {
    alert("Email address should not exceed 50 characters");
    return false;
  }

  // Password length validation
  if (password.length < 8 || password.length > 20) {
    alert("Password must be between 8 and 20 characters long");
    return false;
  }

  // If all validations pass, allow form submission
  event.target.submit();
}
