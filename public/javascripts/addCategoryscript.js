function validateForm(event) {
  console.log("Validation function called");
  // Prevent the form from submitting if validation fails
  event.preventDefault();
  // Get form data
  var categoryName = document.getElementById("category-name").value;
  var categoryDescription = document.getElementById("category-description").value;
  var isActive = document.getElementById("category-active").checked;
  // Validate form data
  if (!categoryName || !categoryDescription) {
    alert("Please enter category name and description.");
    return false;
  }
  if (!validateCategoryName(categoryName)) {
    alert("Category name should start with an alphabet.");
    return false;
  }

  if (!validateCategoryDescription(categoryDescription)) {
    alert("Category description should start with an alphabet.");
    return false;
  }
  // If all validations pass, allow form submission
  document.querySelector("form").submit();
}
// Function to validate category name
function validateCategoryName(name) {
  // Regular expression to check if name starts with an alphabet
  var regex = /^[a-zA-Z]/;
  return regex.test(name);
}

// Function to validate category description
function validateCategoryDescription(description) {
  // Regular expression to check if description starts with an alphabet
  var regex = /^[a-zA-Z]/;
  return regex.test(description);
}