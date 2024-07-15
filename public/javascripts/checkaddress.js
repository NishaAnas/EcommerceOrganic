// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Select all radio buttons with name 'defaultAddress'
    const defaultAddressRadios = document.querySelectorAll('input[name="defaultAddress"]');

    // Add change event listener to each radio button
    defaultAddressRadios.forEach(radio => {
        radio.addEventListener('change', async (event) => {
            // Get the addressId from the data-address-id attribute of the selected radio button
            const addressId = event.target.getAttribute('data-address-id');
            
            try {
                // Send a POST request to update the default address
                const response = await fetch('/checkupdateDefaultAddress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ addressId })
                });

                // Parse response JSON
                const result = await response.json();

                // Show success message if update was successful
                if (result.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Default address updated successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    // Show error message if update was not successful
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error updating default address.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                // Show error message if fetch or JSON parsing fails
                Swal.fire({
                    title: 'Error!',
                    text: 'Error updating default address.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    });
});
