$(document).ready(function(){
    $('.remove-button').click(function() {
        var variantId = $(this).data('variantid');
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to remove this item from your wishlist?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/removeFromWishlist',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ variantId: variantId }),
                    success: function(response) {
                        Swal.fire(
                            'Removed!',
                            'The item has been removed from your wishlist.',
                            'success'
                        ).then(() => {
                            location.reload(); // Refresh the page after successful removal
                        });
                    },
                    error: function(xhr, status, error) {
                        Swal.fire(
                            'Error!',
                            'There was a problem removing the item from your wishlist.',
                            'error'
                        );
                        console.error('Error removing item from wishlist:', error);
                    }
                });
            }
        });
    });
});