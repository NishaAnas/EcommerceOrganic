// Update Area According to Pincode
document.addEventListener('DOMContentLoaded', function() {
    // Get input elements
    const nameInput = document.getElementById('uname');
    const streetInput = document.getElementById('street');

    // Add event listeners for input validation
    nameInput.addEventListener('input', function() {
        validateName();
    });

    streetInput.addEventListener('input', function() {
        validateStreet();
    });

    // Add event listener for form submission
    const addAddressForm = document.getElementById('addAddressForm');
    addAddressForm.addEventListener('submit', function(event) {
        // Prevent form submission if validation fails
        if (!validateName() || !validateStreet()) {
            event.preventDefault();
        }
    });

    // Add event listener for pincode input to update area and validate pincode
    const pincodeInputAdd = document.getElementById('pincode');
    const areaInputAdd = document.getElementById('area');
    const pincodeErrorAdd = document.getElementById('pincode_error');

    pincodeInputAdd.addEventListener('input', function() {
        updateAreaAndValidatePincode(this, areaInputAdd, pincodeErrorAdd);
    });

    // Add event listeners for dynamically created pincode inputs
    document.querySelectorAll('[id^="pincode"]').forEach(function(pincodeInput) {
        const id = pincodeInput.id.replace('pincode', '');
        const areaInput = document.getElementById(`area${id}`);
        const pincodeError = document.getElementById(`pincode_error${id}`);

        pincodeInput.addEventListener('input', function() {
            updateAreaAndValidatePincode(this, areaInput, pincodeError);
        });
    });

    // Add event listener for radio buttons to update default address
    document.querySelectorAll('input[name="defaultAddress"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const addressId = this.getAttribute('data-address-id');
                updateDefaultAddress(addressId);
            }
        });
    });
});

// Function to update area and validate pincode
function updateAreaAndValidatePincode(input, areaElement, pincodeErrorElement) {
    const datalist = input.list;
    const options = datalist.options;
    let found = false;
    let area = '';

    // Check if pincode is found in the datalist options
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === input.value) {
            found = true;
            area = options[i].getAttribute('data-area');
            break;
        }
    }

    // Update area and display error message if pincode is invalid
    if (!found) {
        pincodeErrorElement.textContent = 'Invalid Pincode';
        areaElement.value = '';
    } else {
        pincodeErrorElement.textContent = '';
        areaElement.value = area;
    }
}

// Function to update default address via AJAX
function updateDefaultAddress(addressId) {
    fetch('/updateDefaultAddress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addressId: addressId })
    })
    .then(response => response.json())
    .then(data => {
        // Show success or error message using Swal (SweetAlert)
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Default address updated successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Error updating default address.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Show error message if fetch fails
        Swal.fire({
            title: 'Error!',
            text: 'Error updating default address.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}

// Function to validate name input
function validateName() {
    const nameInput = document.getElementById('uname');
    const nameError = document.getElementById('name_error');
    const value = nameInput.value.trim();

    // Check if name is empty
    if (value === '') {
        nameError.textContent = 'Name is required';
        nameInput.setCustomValidity('Name is required');
        return false;
    } else {
        nameError.textContent = '';
        nameInput.setCustomValidity('');
        return true;
    }
}

// Function to validate street input
function validateStreet() {
    const streetInput = document.getElementById('street');
    const streetError = document.getElementById('street_error');
    const value = streetInput.value.trim();

    // Check if street is empty
    if (value === '') {
        streetError.textContent = 'Street is required';
        streetInput.setCustomValidity('Street is required');
        return false;
    } else {
        streetError.textContent = '';
        streetInput.setCustomValidity('');
        return true;
    }
}
