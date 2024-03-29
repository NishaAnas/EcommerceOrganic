  function validateForm(event) {
    event.preventDefault(); // Prevent default form submission behavior

    var email = document.getElementById("email").value;

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

    // If all validations pass, allow form submission
    document.querySelector("form").submit();
  }
