function validateForm(event) {
    console.log("Validation function called");
    // Prevent the form from submitting if validation fails
    event.preventDefault();
    // Get form data
    var productName = document.getElementById("product-title").value;
    var productDescription = document.getElementById("product-description").value;
    var productPrice = document.getElementById("product-price").value;
    // Validate form data
    if (!productName || !productDescription || !productPrice) {
        alert("Please enter product name, description, and price.");
        return false;
    }
    if (!validateProductName(productName)) {
        alert("Product name should start with an alphabet.");
        return false;
    }
    if (!validateProductDescription(productDescription)) {
        alert("Product description should start with an alphabet.");
        return false;
    }
    // If all validations pass, allow form submission
    document.querySelector("form").submit();
}

// Function to validate product name
function validateProductName(name) {
    // Regular expression to check if name starts with an alphabet
    var regex = /^[a-zA-Z]/;
    return regex.test(name);
}

// Function to validate product description
function validateProductDescription(description) {
    // Regular expression to check if description starts with an alphabet
    var regex = /^[a-zA-Z]/;
    return regex.test(description);
}


// let cropper;
function getImagePreview(event) {
    const imgPreview = document.getElementById('imgPreview');
    imgPreview.innerHTML = ''; // Clear previous previews

    const files = event.target.files; // Get selected files

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader(); // Define reader here

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result; // Set image source to data URL
            img.width = '100';
            img.classList.add('img-thumbnail'); // Add Bootstrap class for thumbnail styling
            imgPreview.appendChild(img); // Add image to preview container
        };

        reader.readAsDataURL(file);
    }
}

//     // Initialize Cropper
//     const image = document.getElementById('product-images');
//     cropper = new Cropper(image, {
//         aspectRatio: 1 / 1, // Set aspect ratio as needed
//         viewMode: 2, // Set the crop box to cover the entire canvas
//         scalable: false, // Disable scaling
//     });
// }

// function cropImage(event) {
//     console.log("PRESSED CROP BUTTON")
//     event.preventDefault(); // Prevent form submission

//     if (!cropper) {
//         console.error('Cropper not initialized!');
//         return;
//     }

//     // Get cropped canvas
//     const croppedCanvas = cropper.getCroppedCanvas({
//         maxWidth: 300, // Set maximum width for the cropped image
//         maxHeight: 300, // Set maximum height for the cropped image
//     });

//     // Convert cropped canvas to base64 encoded URL
//     const croppedImageDataURL = croppedCanvas.toDataURL();

//     // Create a new hidden input field to store the cropped image data
//     const croppedImageDataInput = document.createElement('input');
//     croppedImageDataInput.type = 'hidden';
//     croppedImageDataInput.name = 'croppedImageData'; // Set the name attribute as needed
//     croppedImageDataInput.value = croppedImageDataURL;

//     // Append the hidden input field to the form
//     const form = document.getElementById('addProductForm'); // Replace 'yourFormId' with the actual ID of your form
//     form.appendChild(croppedImageDataInput);

//     // Submit the form programmatically
//     form.submit();
// }