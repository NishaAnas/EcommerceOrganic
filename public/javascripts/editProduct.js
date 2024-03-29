function validateForm(event) {
    console.log("Validation function called");
    // Prevent the form from submitting if validation fails
    event.preventDefault();
    // Get form data
    var productName = document.getElementById("producttitle").value;
    var productDescription = document.getElementById("productDetails").value;
    var productPrice = document.getElementById("productPrice").value;
    // Validate form data
    if (!productName || !productDescription || !productPrice) {
        alert("Please enter product name, description, and price.");
        return false;
    }
    // If all validations pass, allow form submission
    document.querySelector("form").submit();
}

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

