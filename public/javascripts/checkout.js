$(document).ready(function() {
    function updateGrandTotal() {
        const totalPrice = parseFloat($('#total-price').text());
        const deliveryPrice = parseFloat($('#delivery-price').text());
        const grandTotal = totalPrice + deliveryPrice;
        $('#grand-total').text(grandTotal.toFixed(2));
    }

    $('input[name="deliveryOption"]').change(function() {
        let deliveryPrice = 0;

        if (this.value === 'express') {
            deliveryPrice = 100;
        } else if (this.value === 'standard') {
            deliveryPrice = 40;
        } else if (this.value === 'normal') {
            deliveryPrice = 60;
        }

        $('#delivery-price').text(deliveryPrice.toFixed(2));
        updateGrandTotal();
    });

    // Trigger change event on page load to initialize the delivery price and grand total
    $('input[name="deliveryOption"]:checked').trigger('change');
});


document.getElementById('checkoutForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/placeOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success'
                }).then(() => {
                    window.location.href = `/orderdetails/${result.orderId}`;
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: result.error,
                    icon: 'error'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'An unexpected error occurred. Please try again.',
                icon: 'error'
            });
        }
    });