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

    $('input[name="paymentOption"]').change(function() {
        if (this.value === 'razorpay') {
            $('#place-order').text('Proceed to Payment');
        } else {
            $('#place-order').text('Place Order');
        }
    });

    $('input[name="deliveryOption"]:checked').trigger('change');

    $('#checkoutForm').on('submit', async function(event) {
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

            const result = await response.json();//get the response from the controller
            if (!response.ok) { 
                throw new Error(result.error || 'An error occurred while placing the order.');
            }

            console.log(result);
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
                            const razorResponse = await fetch('/payementVerification', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(razorData)
                            });

                            if (!razorResponse.ok) {
                                throw new Error('Network response was not ok during Razorpay confirmation');
                            }

                            const razorResult = await razorResponse.json();
                            Swal.fire({
                                title: 'Success!',
                                text: razorResult.message,
                                icon: 'success'
                            }).then(() => {
                                window.location.href = `/orderdetails/${razorResult.orderId}`;
                            });
                        } catch (error) {
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

                const rzp1 = new Razorpay(options);
                rzp1.open();
            } else{   
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success'
                }).then(() => {
                    window.location.href = `/orderdetails/${result.orderId}`;
                });
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message ||'An unexpected error occurred. Please try again.',
                icon: 'error'
            });
        }
    });
});


$(document).ready(function() {
    const selectedPaymentMethod = '{{ paymentMethod }}';
    if (selectedPaymentMethod !== 'Any') {
        // Enable the selected payment method
        $(`input[name="paymentOption"][value="${selectedPaymentMethod}"]`).prop('checked', true).prop('disabled', true);

        // Listen for changes in the payment method selection
        $('input[name="paymentOption"]').change(function(event) {
            const selectedOption = $(this).val();
            if (selectedOption !== selectedPaymentMethod) {
                // Prevent the default behavior of changing the selection
                event.preventDefault();
                // Show error message
                //alert('Cannot change payment method. Coupon is already selected.');
                Swal.fire({
                    title: 'Error!',
                    text: 'Cannot change payment method. Coupon is already selected',
                    icon: 'error'
                });
            }
        });
    }
});


