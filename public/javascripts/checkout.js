$(document).ready(function() {
    // Function to update grand total based on price, discounts, and delivery charges
    function updateGrandTotal() {
        const totalPrice = parseFloat($('#total-price').text());
        const discount = parseFloat($('#discount').text());
        const afterDiscount = parseFloat($('#after-discount').text());
        const deliveryPrice = parseFloat($('#delivery-price').text());
        const grandTotal = discount ? afterDiscount + deliveryPrice : totalPrice + deliveryPrice;
        
        $('#grand-total').text(grandTotal.toFixed(2));
    }

    // Update hidden input with selected address id on change
    $('input[name="address"]').on('change', function() {
        $('#selectedAddressId').val($(this).val());
    });

    // Update delivery price and grand total on delivery option change
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

    // Change button text based on payment option selection
    $('input[name="paymentOption"]').change(function() {
        if (this.value === 'razorpay') {
            $('#place-order').text('Proceed to Payment');
        } else {
            $('#place-order').text('Place Order');
        }
    });

    // Trigger change event on delivery option initially
    $('input[name="deliveryOption"]:checked').trigger('change');

    // Handle form submission for checkout
    $('#checkoutForm').on('submit', async function(event) {
        event.preventDefault();
        const selectedAddressId = $('#selectedAddressId').val();

        // Ensure an address is selected
        if (!selectedAddressId) {
            alert('Please select a shipping address.');
            return;
        }

        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Send order placement request
            const response = await fetch('/placeOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Parse response JSON
            const result = await response.json();

            // Handle errors if response is not okay
            if (!response.ok) {
                throw new Error(result.error || 'An error occurred while placing the order.');
            }

            // Log result for debugging
            console.log(result);

            // Handle Razorpay payment if selected
            if (data.paymentOption === 'razorpay') {
                const options = {
                    key: result.razorpayKey,
                    amount: result.amount,
                    currency: 'INR',
                    name: 'ORGANIC',
                    description: 'Order Payment',
                    order_id: result.razorpayOrderId,
                    handler: async (response) => {
                        try {
                            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
                            const razorData = {
                                razorpayPaymentId: razorpay_payment_id,
                                razorpayOrderId: razorpay_order_id,
                                razorpaySignature: razorpay_signature,
                                orderId: result.orderId,
                                paymentOption: 'razorpay'
                            };

                            // Verify Razorpay payment
                            const razorResponse = await fetch('/payementVerification', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(razorData)
                            });

                            // Parse Razorpay verification response
                            const razorResult = await razorResponse.json();

                            // Handle errors during Razorpay verification
                            if (!razorResponse.ok || razorResult.error) {
                                throw new Error(razorResult.error || 'Network response was not ok during Razorpay confirmation');
                            }

                            // Show success message and redirect on successful payment
                            Swal.fire({
                                title: 'Success!',
                                text: razorResult.message,
                                icon: 'success'
                            }).then(() => {
                                window.location.href = `/orderdetails/${razorResult.orderId}`;
                            });
                        } catch (error) {
                            // Handle errors during Razorpay payment
                            alert(error);
                            console.error('Error during Razorpay fetch:', error);
                            Swal.fire({
                                title: 'Error!',
                                text: error.message || 'An unexpected error occurred during Razorpay confirmation. Please try again.',
                                icon: 'error'
                            });
                        }
                    },
                    prefill: {
                        name: result.userData.name,
                        email: result.userData.email,
                        contact: result.userData.contact
                    },
                    theme: {
                        color: '#3399cc'
                    }
                };

                // Create new instance of Razorpay with options
                const rzp1 = new Razorpay(options);

                // Handle payment failure
                rzp1.on('payment.failed', function (response) {
                    Swal.fire({
                        title: 'Payment Failed!',
                        text: response.error.description,
                        icon: 'error'
                    }).then(() => {
                        window.location.href = `/orderdetails/${result.orderId}`;
                    });
                
                    // Log and handle payment failure on server
                    fetch('/paymentFailed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            orderId: result.orderId,
                            error: response.error
                        })
                    });
                });

                // Open Razorpay payment dialog
                rzp1.open();
            } else {
                // Show success message and redirect on successful order placement
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success'
                }).then(() => {
                    window.location.href = `/orderdetails/${result.orderId}`;
                });
            }
        } catch (error) {
            // Handle errors during order placement
            console.error('Error placing order:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'An unexpected error occurred. Please try again.',
                icon: 'error'
            });
        }
    });
});
