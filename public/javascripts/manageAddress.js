//Update Area According to pincode
document.addEventListener('DOMContentLoaded', function() {
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



//To change Default Address
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[name="defaultAddress"]').forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                const addressId = this.getAttribute('data-address-id');
                updateDefaultAddress(addressId);
            }
        });
    });
});

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