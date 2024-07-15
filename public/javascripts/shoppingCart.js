// Function to remove coupon from cart
function removeCoupon() {
    $('.coupon').val('');// Clear coupon input field
    $('.discount-with-coupon').text('- 00.00');// Reset displayed discount amount
    const originalTotal = parseFloat($('.total-price-of-all-products').text()).toFixed(2);// Get original total price
    $('.total-price-with-discount-products').text(originalTotal);// Update total price with original amount
    $('.btn-remove-coupon').html('<i class="bi bi-eye"></i>').removeClass('btn-remove-coupon').addClass('btn-apply-coupon');// Change button to apply coupon

    // AJAX call to update cart total on server
    $.ajax({
        url: '/updateCartTotal',
        method: 'POST',
        data: { newTotal: originalTotal },
        success: function(response) {
            console.log(response.message);
        },
        error: function(error) {
            console.log('Error updating cart total:', error);
        }
    });
}

$(document).ready(function() {
    // Function to update quantity of a product variant
    function updateQuantity(variantId, newQuantity) {
        $.ajax({
            url: '/updateCartItem',
            method: 'POST',
            data: {
                variantId: variantId,
                quantity: newQuantity
            },
            success: function(response) {
                $('#stock-error-' + variantId).remove();// Remove stock error message if any
                $('#quantity-' + variantId).text(newQuantity);
                $('#productquantity-' + variantId).text(newQuantity);
                $('#total-price-' + variantId).text(response.prodtotalPrice.toFixed(2));
                $('.total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));
                $('.total-quantity').text(response.totalQuantity);
                $('.total-price-with-discount-products').text(response.totalPriceOfAllProducts.toFixed(2));

                // Enable quantity increase button if no stock error
                if (response.error === 'Insufficient stock available.') {
                    showErrorMessage(variantId, 'Insufficient stock available. Please reduce the quantity.');
                    toastr.error('Insufficient stock available. Please reduce the quantity.');
                    setTimeout(function() {
                        window.location.href = '/cart';// Redirect to cart page after delay
                    }, 1000);
                } else{
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', false);
                }
                // If a coupon is applied, remove it automatically
                if ($('.coupon').val()) {
                    removeCoupon();
                }
            },
            error: function(xhr, status, error) {
                const response = JSON.parse(xhr.responseText);
                if (response.error === 'Insufficient stock available.') {
                    showErrorMessage(variantId, 'Insufficient stock available. Please reduce the quantity.');
                    toastr.error('Insufficient stock available. Please reduce the quantity.');
                    setTimeout(function() {
                        window.location.href = '/cart';
                    }, 1000);
                    //showErrorModal('Insufficient stock available. Please reduce the quantity.');
                } else {
                    console.error('Error updating cart item:', error);
                }
            }
        });
    }

    // Event handler for increasing quantity button
    $('.quantity-increase').click(function() {
        const variantId = $(this).closest('.quantity-controls').data('variant-id');
        let quantity = parseInt($(this).siblings('.quantity-input').val());

         // Increase quantity if less than 5
        if (quantity < 5 ) {
            quantity += 1;
            $(this).siblings('.quantity-input').val(quantity);// Update quantity input field
            updateQuantity(variantId, quantity);// Update quantity on server
        } else if(quantity >= 5){
            $(this).siblings('.quantity-input').val(5);// Fix quantity at 5
            if ($('#stock-error-' + variantId).length === 0) {
                showErrorMessage(variantId, 'Cannot purchase more than 5 items.');
            }
        }
    });

    // Event handler for decreasing quantity button
    $('.quantity-decrease').click(function() {
        const variantId = $(this).closest('.quantity-controls').data('variant-id');
        let quantity = parseInt($(this).siblings('.quantity-input').val());
        if (quantity > 1) {
            quantity -= 1;
            $(this).siblings('.quantity-input').val(quantity);// Update quantity input field
            updateQuantity(variantId, quantity);// Update quantity on server
            $('#stock-error-' + variantId).remove();// Remove stock error message
            $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', false);// Enable increase button
        } else if (quantity <= 1) {
            $(this).siblings('.quantity-input').val(1);// Fix quantity at 1
            if ($('#stock-error-' + variantId).length === 0) {
                showErrorMessage(variantId, 'Qunatity cannot be less than 1.');
            }
        }
    });

    // Function to show error 
    function showErrorMessage(variantId, message) {
        const errorMessage = '<span id="stock-error-' + variantId + '" class="text-danger">' + message + '</span>';
        $('#quantity-' + variantId).closest('td').append(errorMessage);
    }

    // Event handler for reloading cart page
    $('#reloadButton').click(function() {
        window.location.href = '/cart'; // Redirect to cart page
    });

    // Event handler for applying coupon button
    $('.btn-apply-coupon').click(function() {
        const totalAmount = $('.total-price-of-all-products').text();// Get total amount of products
        $.ajax({
            url: '/getApplicableCoupons',
            method: 'GET',
            data: { totalAmount },
            success: function(response) {
                const coupons = response.coupons;
                const couponList = $('#coupon-list');
                couponList.empty();

                 // Append each coupon to the list
                if (coupons.length > 0) {
                    coupons.forEach(coupon => {
                        const couponItem = `<li class="list-group-item">
                            ${coupon.name} - ${coupon.description} -<br>
                            Discount :${coupon.discount}% - Min-Purchase ${coupon.minPurchaseAmount} -<br>
                            PaymentMethod :${coupon.paymentMethod}
                            <button class="btn btn-link apply-coupon" data-coupon-name="${coupon.name}" data-coupon-id="${coupon._id}" data-discount="${coupon.discount}" data-payment-method="${coupon.paymentMethod}">
                            Apply
                            </button>
                        </li>`;
                        couponList.append(couponItem);// Append coupon item to list
                    });
                } else {
                    couponList.append('<li class="list-group-item">No coupons available</li>');
                }
                $('#couponModal').modal('show');
            }
        });
    });

    // Event handler for applying selected coupon
    $(document).on('click', '.apply-coupon', function() {
        const couponName = $(this).data('coupon-name'); // Get coupon name
        const discount = $(this).data('discount'); // Get discount percentage
        const totalAmount = parseFloat($('.total-price-of-all-products').text()); // Get total amount
        const discountAmount = (totalAmount * discount / 100).toFixed(2); // Calculate discount amount
        const newTotal = (totalAmount - discountAmount).toFixed(2); // Calculate new total after discount

        $('.coupon').val(couponName); // Set coupon name in input field
        $('.discount-with-coupon').text(`- ${discountAmount}`); // Display discount amount
        $('.total-price-with-discount-products').text(newTotal); // Update total price with discount
        $('.btn-apply-coupon').html('<i class="bi bi-trash3"></i>').removeClass('btn-apply-coupon').addClass('btn-remove-coupon'); // Change button to remove coupon

         // AJAX call to update cart total after applying coupon
        $.ajax({
            url: '/updateCartTotal',
            method: 'POST',
            data: { newTotal, discountAmount, couponName },
            success: function(response) {
                console.log(response.message);
            },
            error: function(error) {
                console.log('Error updating cart total:', error);
            }
        });
        $('#applyCouponModal').modal('hide');
    });

    // Event handler for removing applied coupon
    $(document).on('click', '.btn-remove-coupon', function() {
        $('.coupon').val('');
        $('.discount-with-coupon').text('- 00.00');
        const originalTotal = $('.total-price-of-all-products').text();
        $('.total-price-with-discount-products').text(originalTotal);
        $(this).html('<i class="bi bi-eye"></i>').removeClass('btn-remove-coupon').addClass('btn-apply-coupon');

        // AJAX call to update cart total after removing coupon
        $.ajax({
            url: '/updateCartTotal',
            method: 'POST',
            data: { newTotal: originalTotal },
            success: function(response) {
                console.log(response.message);
            },
            error: function(error) {
                console.log('Error updating cart total:', error);
            }
        });
    });

    // Event handler for form submission to remove cart product
    $('form#removeForm').submit(function(event) {
        event.preventDefault();

        const variantId = $(this).data('variant-id');

        // AJAX call to remove product variant from cart
        $.ajax({
            url: `/removeCartProduct/${variantId}`,
            method: 'POST',
            success: function(response) {
                if (response.success) {
                    $(`#cart-item-${variantId}`).remove();
                    if (response.totalQuantity === 0) {
                        window.location.href = '/emptyCart';
                    } else {
                        $('.total-quantity').text(response.totalQuantity);
                        $('.total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));
                        $('.total-price-with-discount-products').text(response.totalPriceOfAllProducts.toFixed(2));
                    }
                } else {
                    alert('Error removing item from cart');
                }
            },
            error: function(error) {
                console.error('Error removing cart item:', error);
            }
        });
    });
});

// Function to close apply coupon modal
function closecouponModal() {
    $('#applyCouponModal').modal('hide');
}