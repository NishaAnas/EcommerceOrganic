//Update Area According to pincode
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('uname');
    const streetInput = document.getElementById('street');

    nameInput.addEventListener('input', function() {
        validateName();
    });

    streetInput.addEventListener('input', function() {
        validateStreet();
    });

    const addAddressForm = document.getElementById('addAddressForm');
    addAddressForm.addEventListener('submit', function(event) {
        if (!validateName() || !validateStreet()) {
            event.preventDefault();
        }
    });

    const pincodeInputAdd = document.getElementById('pincode');
    const areaInputAdd = document.getElementById('area');
    const pincodeErrorAdd = document.getElementById('pincode_error');

    pincodeInputAdd.addEventListener('input', function() {
        updateAreaAndValidatePincode(this, areaInputAdd, pincodeErrorAdd);
    });

    document.querySelectorAll('[id^="pincode"]').forEach(function(pincodeInput) {
        const id = pincodeInput.id.replace('pincode', '');//set id as the remaining name other than pincode
        const areaInput = document.getElementById(`area${id}`);
        const pincodeError = document.getElementById(`pincode_error${id}`);

        pincodeInput.addEventListener('input', function() {
            updateAreaAndValidatePincode(this, areaInput, pincodeError);
        });
    });

    document.querySelectorAll('input[name="defaultAddress"]').forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                const addressId = this.getAttribute('data-address-id');
                updateDefaultAddress(addressId);
            }
        });
    });
});

//checking for area and pincode fond or not
function updateAreaAndValidatePincode(input, areaElement, pincodeErrorElement) {
    const datalist = input.list;
    const options = datalist.options;
    let found = false;
    let area = '';
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === input.value) {
            found = true;
            area = options[i].getAttribute('data-area');
            break;
        }
    }
    if (!found) {
        pincodeErrorElement.textContent = 'Invalid Pincode';
        areaElement.value = '';
    } else {
        pincodeErrorElement.textContent = '';
        areaElement.value = area;
    }
}


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
                Swal.fire({
                    title: 'Error!',
                    text: 'Error updating default address.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
}

function validateName() {
    const nameInput = document.getElementById('uname');
    const nameError = document.getElementById('name_error');
    const value = nameInput.value.trim();
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

function validateStreet() {
    const streetInput = document.getElementById('street');
    const streetError = document.getElementById('street_error');
    const value = streetInput.value.trim();
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