document.addEventListener('DOMContentLoaded', function () {
    const defaultAddressRadios = document.querySelectorAll('input[name="defaultAddress"]');

    defaultAddressRadios.forEach(radio => {
        radio.addEventListener('change', async (event) => {
            const addressId = event.target.getAttribute('data-address-id');
            try {
                const response = await fetch('/checkupdateDefaultAddress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ addressId })
                });

                const result = await response.json();

                if (result.success) {
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
            } catch (error) {
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