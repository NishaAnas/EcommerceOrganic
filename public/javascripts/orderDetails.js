$(document).ready(function(){
    $('.cancel-button').click(function() {
        var orderId = $(this).data('orderid');
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/cancelOrder',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ orderId: orderId }),
                    success: function(response) {
                        Swal.fire(
                            'Cancelled!',
                            'Your order has been cancelled.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    },
                    error: function(xhr, status, error) {
                        Swal.fire(
                            'Error!',
                            'There was a problem cancelling your order.',
                            'error'
                        );
                        console.error('Error canceling order:', error);
                    }
                });
            }
        });
    });
});
