document.addEventListener("DOMContentLoaded", function () {
    // Button click to show variation details in modal
    document.getElementById("showVariationDetails").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get form data
        var productId = document.getElementById("product-select").value;
        var variationName = document.getElementById("variation-name").value;
        var variationValue = document.getElementById("variation-value").value;
        var variationPrice = document.getElementById("variation-price").value;
        var variationStock = document.getElementById("variation-stock").value;
        var isActive = document.getElementById("variation-active").checked;

        // Validate form data (optional)
        if (!variationName || !variationValue || !variationPrice || !variationStock) {
            alert("Please fill in all fields.");
            return;
        }

        // Validate form data
        if (!validateVariationName(variationName)) {
            alert("Variation name should start with an alphabet.");
            return;
        }

        // Update modal content with entered details
        var variationDetails = document.getElementById("variationDetails");
        variationDetails.innerHTML = `
        <p>Product ID: ${productId}</p>
        <p>Variation Name: ${variationName}</p>
        <p>Variation Value: ${variationValue}</p>
        <p>Price: ${variationPrice}</p>
        <p>Stock: ${variationStock}</p>
        <p>Active: ${isActive ? "Yes" : "No"}</p>`;

        // Show the modal
        document.getElementById("variationDetailsModal").classList.add("show");
        document.getElementById("variationDetailsModal").style.display = "block";
    });
    // Button click to submit data to database (replace with actual logic)
    document.getElementById("executeDatabaseCode").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default button action
        // Simulate database call (replace with your actual logic)
        alert("Simulating database insertion...");
        // Optionally, clear form or close modal after successful submission
        document.getElementById("add-variation-form").reset(); // Clear form
        document.getElementById("variationDetailsModal").classList.remove("show");
        document.getElementById("variationDetailsModal").style.display = "none"; // Close modal
    });
    // Close modal when close button is clicked
    document.getElementById("variationDetailsModalClose").addEventListener("click", function () {
        document.getElementById("variationDetailsModal").classList.remove("show");
        document.getElementById("variationDetailsModal").style.display = "none";
    });
});

// Function to validate variation name
function validateVariationName(name) {
    // Regular expression to check if name starts with an alphabet
    var regex = /^[a-zA-Z]/;
    return regex.test(name);
}

