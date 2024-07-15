// Array to store selected images
var images = [];

// Function to handle image selection
function image_select() {
    var image = document.getElementById('product-image').files;
    for (var i = 0; i < image.length; i++) {
        if (check_duplicate(image[i].name)) {
            // Add image to the array if it is not a duplicate
            images.push({
                "name": image[i].name,
                "url": URL.createObjectURL(image[i]),
                "file": image[i]
            });
        } else {
            // Show warning if the image is a duplicate
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Image',
                text: image[i].name + ' is already added',
                confirmButtonText: 'OK'
            });
        }
    }
    // Display selected images
    document.getElementById('container').innerHTML = image_show();
}

// Function to generate HTML for displaying images
function image_show() {
    var imageHTML = "";
    images.forEach(function (img, index) {
        imageHTML += `<div class="image-container d-flex justify-content-center position-absolute">
                          <img src="${img.url}" alt="images">
                          <span class="position-relative" onclick="delete_image(${index})">&times;</span>
                      </div>`;
    });
    return imageHTML;
}

// Function to delete an image
function delete_image(index) {
    images.splice(index, 1);
    // Refresh image display after deletion
    document.getElementById('container').innerHTML = image_show();
}

// Function to check for duplicate images
function check_duplicate(name) {
    var isDuplicate = false;
    images.forEach(function (img) {
        if (img.name === name) {
            isDuplicate = true;
        }
    });
    return !isDuplicate;
}

// Form element for adding categories
const form = document.getElementById('addCategoryForm');

// Event listener for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const categoryName = document.getElementById('category-name').value.trim();
    const categoryDescription = document.getElementById('category-description').value.trim();
    const categoryname_error = document.getElementById('categoryname_error');
    const categorydescription_error = document.getElementById('description_error');
    const form_error = document.getElementById('form_error');

    // Clear previous error messages
    categoryname_error.innerHTML = '';
    categorydescription_error.innerHTML = '';
    form_error.innerHTML = '';

    // Validate category name and description
    if (categoryName === '' || categoryDescription === '') {
        isValid = false;
        form_error.innerHTML = "Invalid Inputs";
    }

    // Validate category name length
    if (categoryName.length < 3 || categoryName.length > 20) {
        isValid = false;
        categoryname_error.innerHTML = 'Category name must be between 3 to 20 characters long';
    }

    // Validate category name format
    const categoryname_regex1 = /^[a-zA-Z]/;
    const categoryname_regex2 = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;

    if (!categoryname_regex1.test(categoryName)) {
        isValid = false;
        categoryname_error.innerHTML = "Category name must start with a letter";
    } else if (!categoryname_regex2.test(categoryName)) {
        isValid = false;
        categoryname_error.innerHTML = "Category name must contain only alphanumeric characters and underscores.";
    }

    // Validate category description length
    if (categoryDescription.length < 3 || categoryDescription.length > 75) {
        isValid = false;
        categorydescription_error.innerHTML = 'Category Description must be between 3 to 75 characters long';
    }

    // Submit the form if valid
    if (isValid) {
        form.submit();
    }
});
