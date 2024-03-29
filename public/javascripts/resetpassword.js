function validateForm(event) {
    event.preventDefault(); // Prevent default form submission behavior

    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmpassword").value;

    // Password length validation
    if (password.length < 8 || password.length > 20) {
      alert("Password must be between 8 and 20 characters long");
      return false;
    }

    // Password complexity validation
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
      return false;
    }

    // Password match validation
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return false;
    }

    // If all validations pass, allow form submission
    document.querySelector("form").submit();
  }