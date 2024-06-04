$(document).ready(function() {
    $('.quantity-select').change(function() {

        const quantity = $(this).val();
        const variantId = $(this).data('variant-id');
        const basePrice = parseFloat($('#quantity-' + variantId).data('base-price'));
        const totalPrice = quantity * basePrice;

        // Remove any existing error message
        $('#stock-error-' + variantId).remove();

        $.ajax({
            url: '/updateCartItem', // Route to update Cart item
            method: 'POST',
            data: {
                variantId: variantId,
                quantity: quantity
            },
            success: function(response) {

                 // Clear any previous error message
                $('#stock-error-' + variantId).remove();

                // Update the total price and quantity display
                $('#quantity-' + variantId).text(quantity);
                $('#productquantity-' + variantId).text(quantity);
                $('#total-price-' + variantId).text(response.prodtotalPrice.toFixed(2));

                $('#total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));

                // Update the total quantity and total price in the HTML
                $('.total-quantity').text(response.totalQuantity);
                $('.total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));
            },
                error: function(xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                if (response.error === 'Insufficient stock available.') {
                    // Display the error message below the quantity dropdown
                    const errorMessage = '<span id="stock-error-' + variantId + '" class="text-danger">Insufficient stock available. Please reduce the quantity.</span>';
                    $('#quantity-' + variantId).closest('td').append(errorMessage);
                } else {
                    console.error('Error updating cart item:', error);
                }
            }
        })

    })
})