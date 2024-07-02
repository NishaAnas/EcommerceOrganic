$(document).ready(function() {
    function updateQuantity(variantId, newQuantity) {
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
                //$('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', false);

                if (response.error === 'Insufficient stock available.') {
                    //if ($('#stock-error-' + variantId).length === 0) {
                        showErrorMessage(variantId, 'Insufficient stock available. Please reduce the quantity.');
                    //}
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', true);
                } 
            },
            error: function(xhr, status, error) {
                const response = JSON.parse(xhr.responseText);
                if (response.error === 'Insufficient stock available.') {
                    //if ($('#stock-error-' + variantId).length === 0) {
                        const errorMessage = '<span id="stock-error-' + variantId + '" class="text-danger">Insufficient stock available. Please reduce the quantity.</span>';
                        $('#quantity-' + variantId).closest('td').append(errorMessage);
                    //}
                    $('.quantity-increase[data-variant-id="' + variantId + '"]').prop('disabled', true);
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
        } else if(quantity >= 5){
            $(this).siblings('.quantity-input').val(5);
            if ($('#stock-error-' + variantId).length === 0) {
                showErrorMessage(variantId, 'Cannot purchase more than 5 items.');
            }
        }
    });

    $('.quantity-decrease').click(function() {
        const variantId = $(this).closest('.quantity-controls').data('variant-id');
        let quantity = parseInt($(this).siblings('.quantity-input').val());
        if (quantity > 1) {
            quantity -= 1;
            $(this).siblings('.quantity-input').val(quantity);
            updateQuantity(variantId, quantity);
            $('#stock-error-' + variantId).remove();
        } else if (quantity <= 1) {
            $(this).siblings('.quantity-input').val(1);
            if ($('#stock-error-' + variantId).length === 0) {
                showErrorMessage(variantId, 'Qunatity cannot be less than 1.');
            }
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
                            Discount :${coupon.discount}% - Min-Purchase ${coupon.minPurchaseAmount} -<br>
                            PaymentMethod :${coupon.paymentMethod}
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
        });
    });

    $(document).on('click', '.apply-coupon', function() {
        const couponName = $(this).data('coupon-name');
        const discount = $(this).data('discount');
        const totalAmount = parseFloat($('.total-price-of-all-products').text());
        const discountAmount = (totalAmount * discount / 100).toFixed(2);
        const newTotal = (totalAmount - discountAmount).toFixed(2);

        $('.coupon').val(couponName);
        $('.discount-with-coupon').text(`- ${discountAmount}`);
        $('.total-price-with-discount-products').text(newTotal);
        $('.btn-apply-coupon').html('<i class="bi bi-trash3"></i>').removeClass('btn-apply-coupon').addClass('btn-remove-coupon');

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

    $(document).on('click', '.btn-remove-coupon', function() {
        $('.coupon').val('');
        $('.discount-with-coupon').text('- 00.00');
        const originalTotal = $('.total-price-of-all-products').text();
        $('.total-price-with-discount-products').text(originalTotal);
        $(this).html('<i class="bi bi-eye"></i>').removeClass('btn-remove-coupon').addClass('btn-apply-coupon');

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

function closecouponModal() {
    $('#applyCouponModal').modal('hide');
}
