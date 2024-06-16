$(document).ready(function() {
    function updateQuantity(variantId, newQuantity) {
        const basePrice = parseFloat($('#quantity-' + variantId).data('base-price'));
        const totalPrice = newQuantity * basePrice;

        $.ajax({
            url: '/updateCartItem',
            method: 'POST',
            data: {
                variantId: variantId,
                quantity: newQuantity
            },
            success: function(response) {
                $('#stock-error-' + variantId).remove();
                $('#quantity-' + variantId).text(newQuantity);
                $('#productquantity-' + variantId).text(newQuantity);
                $('#total-price-' + variantId).text(response.prodtotalPrice.toFixed(2));
                $('#total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));
                $('.total-quantity').text(response.totalQuantity);
                $('.total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));
                if (newQuantity > 5) {
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', true);
                    showErrorMessage(variantId, 'Cannot purchase more than 5 items.');
                } else {
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', false);
                }

                if (response.error === 'Insufficient stock available.') {
                    showErrorMessage(variantId, 'Insufficient stock available. Please reduce the quantity.');
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', true);
                } else {
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', false);
                }
            },
            error: function(xhr, status, error) {
                const response = JSON.parse(xhr.responseText);
                if (response.error === 'Insufficient stock available.') {
                    const errorMessage = '<span id="stock-error-' + variantId + '" class="text-danger">Insufficient stock available. Please reduce the quantity.</span>';
                    $('#quantity-' + variantId).closest('td').append(errorMessage);
                } else {
                    console.error('Error updating cart item:', error);
                }
            }
        });
    }

    $('.quantity-increase').click(function() {
        const variantId = $(this).closest('.quantity-controls').data('variant-id');
        let quantity = parseInt($(this).siblings('.quantity-input').val());
        if (quantity < 5) {
            quantity += 1;
            $(this).siblings('.quantity-input').val(quantity);
            updateQuantity(variantId, quantity);
        } else {
            showErrorMessage(variantId, 'Cannot purchase more than 5 items.');
            $(this).prop('disabled', true);
        }
    });

    $('.quantity-decrease').click(function() {
        const variantId = $(this).closest('.quantity-controls').data('variant-id');
        let quantity = parseInt($(this).siblings('.quantity-input').val());
        if (quantity > 1) {
            quantity -= 1;
            $(this).siblings('.quantity-input').val(quantity);
            updateQuantity(variantId, quantity);
        } else if (quantity === 1) {
            showErrorMessage(variantId, `Please Remove the Product`);
            $(this).prop('disabled', true);
        }
    });

    function showErrorMessage(variantId, message) {
        const errorMessage = '<span id="stock-error-' + variantId + '" class="text-danger">' + message + '</span>';
        $('#quantity-' + variantId).closest('td').append(errorMessage);
    }

    $('.btn-apply-coupon').click(function() {
        const totalAmount = $('.total-price-of-all-products').text();
        $.ajax({
            url: '/getApplicableCoupons',
                    method: 'GET',
                    data: { totalAmount },
                    success: function(response) {
                        const coupons = response.coupons;
                        const couponList = $('#coupon-list');
                        couponList.empty();

                        if (coupons.length > 0) {
                            coupons.forEach(coupon => {
                                const couponItem = `<li class="list-group-item">
                                    ${coupon.name} - ${coupon.description} -<br>
                                    Discount :${coupon.discount}% -Min-Purchase ${coupon.minPurchaseAmount}-<br>
                                    PayementMethod :${coupon.paymentMethod}
                                    <button class="btn btn-link apply-coupon" data-coupon-name="${coupon.name}" data-coupon-id="${coupon._id}" data-discount="${coupon.discount}" data-payment-method="${coupon.paymentMethod}">
                                    Apply
                                    </button>
                                </li>`;
                                couponList.append(couponItem);
                            });
                        } else {
                            couponList.append('<li class="list-group-item">No coupons available</li>');
                        }
                        $('#couponModal').modal('show');
                    }
                        })
                    })

                    
                    $(document).on('click', '.apply-coupon', function() {
                        const couponName = $(this).data('coupon-name');
                        const discount = $(this).data('discount');
                        const totalAmount = parseFloat($('.total-price-of-all-products').text());
                        const discountAmount = (totalAmount * discount / 100).toFixed(2);
                        const newTotal = (totalAmount - discountAmount).toFixed(2);

                        // Update the coupon input field and discount field
                            $('.coupon').val(couponName);
                            $('.discount-with-coupon').text(`- ${discountAmount}`);
                            $('.total-price-with-discount-products').text(newTotal);
                            // Change the button to "Remove"
                            $('.btn-apply-coupon').html('<i class="bi bi-trash3"></i>').removeClass('btn-apply-coupon').addClass('btn-remove-coupon');

                                // Update the session with the new total amount
                                        $.ajax({
                                            url: '/updateCartTotal',
                                            method: 'POST',
                                            data: { newTotal,discountAmount,couponName },
                                            success: function(response) {
                                                console.log(response.message);
                                            },
                                            error: function(error) {
                                                console.log('Error updating cart total:', error);
                                            }
                                        });
                            $('#applyCouponModal').modal('hide');
                    })

                    $(document).on('click', '.btn-remove-coupon', function() {
                        // Reset the coupon input field and discount field
                        $('.coupon').val('');
                            $('.discount-with-coupon').text('- 00.00');
                            const originalTotal = $('.total-price-of-all-products').text();
                            $('.total-price-with-discount-products').text(originalTotal);

                            // Change the button back to "View Coupons"
                            $(this).html('<i class="bi bi-eye"></i>').removeClass('btn-remove-coupon').addClass('btn-apply-coupon');

                            // Update the session with the original total amount
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

                    $('form#removeForm').submit(function(event) {
                        event.preventDefault();
                
                        const variantId = $(this).data('variant-id');
                
                        $.ajax({
                            url: `/removeCartProduct/${variantId}`,
                            method: 'POST',
                            success: function(response) {
                                if(response.success) {
                                    $(`#cart-item-${variantId}`).remove();
                                    if (response.totalQuantity === 0) {
                                        window.location.href = '/emptyCart';
                                    }else {
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
})
function closecouponModal(){
    $('#applyCouponModal').modal('hide');
}