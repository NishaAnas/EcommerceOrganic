// Array to store selected images
var images = [];

// Function to handle image selection
function image_select() {
    var image = document.getElementById('product-image').files;
    for (var i = 0; i < image.length; i++) {
        if (check_duplicate(image[i].name)) {
            // Add image object to the array
            images.push({
                "name": image[i].name,
                "url": URL.createObjectURL(image[i]),
                "file": image[i]
            });
        } else {
            // Display warning for duplicate image
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Image',
                text: image[i].name + ' is already added',
                confirmButtonText: 'OK'
            });
        }
    }
    // Update the container with displayed images
    document.getElementById('container').innerHTML = image_show();
}

// Function to generate HTML for displaying images
function image_show() {
    var imageHTML = "";
    images.forEach(function (img, index) {
        // Generate HTML for each image with delete option
        imageHTML += `<div class="image-container d-flex justify-content-center postion-absolute">
                            <img src="${img.url}" alt="images">
                            <span class="position-relative" onclick="delete_image(${index})">&times;</span>
                        </div>`;
    });
    return imageHTML;
}

// Function to delete an image from the array
function delete_image(index) {
    images.splice(index, 1); // Remove image at given index
    document.getElementById('container').innerHTML = image_show(); // Update displayed images
}

// Form validation on form submission
const form = document.getElementById('editcategoryForm');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    let isValid = true; // Flag to track form validity

    // Retrieve form input values
    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryDescription = document.getElementById('categoryDetails').value.trim();
    
    // Retrieve error message elements
    const categoryname_error = document.getElementById('categoryname_error');
    const categorydescription_error = document.getElementById('description_error');
    const form_error = document.getElementById('form_error');

    // Clear previous error messages
    categoryname_error.innerHTML = '';
    categorydescription_error.innerHTML = '';
    form_error.innerHTML = '';

    // Validate category name and description
    if (categoryName.trim() === '' || categoryDescription.trim() === '') {
        isValid = false;
        form_error.innerHTML = "Invalid Inputs";
    }

    if (categoryName.trim().length < 3 || categoryName.trim().length > 20) {
        isValid = false;
        categoryname_error.innerHTML = 'Category name must be between 3 to 20 characters long';
    }

    // Regular expression patterns for category name validation
    const categoryname_regex1 = /^[a-zA-Z]/; // Must start with a letter
    const categoryname_regex2 = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/; // Allows letters, numbers, and certain symbols

    // Additional validation for category name format
    if (!categoryname_regex1.test(categoryName)) {
        isValid = false;
        categoryname_error.innerHTML = "Category Name must start with a letter";
    } else if (!categoryname_regex2.test(categoryName)) {
        isValid = false;
        categoryname_error.innerHTML = "Invalid Format.";
    }

    // Validate category description length
    if (categoryDescription.length < 3 || categoryDescription.length > 75) {
        isValid = false;
        categorydescription_error.innerHTML = 'Category Description must be between 3 to 75 characters long';
    }

    // If form is valid, submit it
    if (isValid) {
        form.submit();
    }
});
