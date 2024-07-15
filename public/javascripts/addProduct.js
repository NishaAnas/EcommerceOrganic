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

// Form element for adding products
const form = document.getElementById('addProductForm');

// Event listener for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    const sku = document.getElementById('product-sku').value.trim();
    const title = document.getElementById('product-title').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const price = document.getElementById('product-price').value.trim();
    const images = document.getElementById('product-image').files;

    const skuError = document.getElementById('sku_error');
    const titleError = document.getElementById('title_error');
    const nameError = document.getElementById('name_error');
    const priceError = document.getElementById('price_error');
    const imageError = document.getElementById('image_error');

    // Clear previous error messages
    skuError.innerHTML = '';
    titleError.innerHTML = '';
    nameError.innerHTML = '';
    priceError.innerHTML = '';
    imageError.innerHTML = '';

    // SKU validation
    const skuRegex = /^[A-Z0-9]+$/;
    if (sku === '') {
        isValid = false;
        skuError.innerHTML = 'SKU is required.';
    } else if (!skuRegex.test(sku)) {
        isValid = false;
        skuError.innerHTML = 'Invalid SKU format. Only capital letters and numbers are allowed.';
    }

    // Title validation
    const titleRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
    if (title === '') {
        isValid = false;
        titleError.innerHTML = 'Title is required.';
    } else if (!titleRegex.test(title)) {
        isValid = false;
        titleError.innerHTML = 'Invalid title format.';
    }

    // Name validation
    const nameRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
    if (name === '') {
        isValid = false;
        nameError.innerHTML = 'Name is required.';
    } else if (!nameRegex.test(name)) {
        isValid = false;
        nameError.innerHTML = 'Invalid name format.';
    }

    // Price validation
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (price === '') {
        isValid = false;
        priceError.innerHTML = 'Price is required.';
    } else if (!priceRegex.test(price)) {
        isValid = false;
        priceError.innerHTML = 'Invalid price format. Only numbers are allowed.';
    }

    // Image validation
    if (!images || images.length === 0) {
        isValid = false;
        imageError.innerHTML = 'At least one image is required.';
    } else if (images.length > 4) {
        isValid = false;
        imageError.innerHTML = 'Maximum of 4 images can be uploaded.';
    }

    // Submit form if valid
    if (isValid) {
        form.submit();
    }
});
