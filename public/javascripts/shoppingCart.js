$(document).ready(function() {
    $('.quantity-select').change(function() {

        const quantity = $(this).val();
        const productId = $(this).data('product-id');
        const basePrice = parseFloat($('#quantity-' + productId).data('base-price'));
        const totalPrice = quantity * basePrice;

        $.ajax({
            url: '/updateCartItem', // Route to update Cart item
            method: 'POST',
            data: {
                productId: productId,
                quantity: quantity
            },
            success: function(response) {

                // Update the total price and quantity display
                $('#quantity-' + productId).text(quantity);
                $('#productquantity-' + productId).text(quantity);
                $('#total-price-' + productId).text(totalPrice.toFixed(2));

                $('#total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));

                // Update the total quantity and total price in the HTML
                $('.total-quantity').text(response.totalQuantity);
                $('.total-price-of-all-products').text(response.totalPriceOfAllProducts.toFixed(2));
            },
                error: function(xhr, status, error) {
                console.error('Error updating cart item:', error);
            }
        })

    })
})