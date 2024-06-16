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

    $('.return-button').click(function() {
        var orderId = $(this).data('orderid');
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to return this order?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, return it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/returnOrder',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ orderId: orderId }),
                    success: function(response) {
                        Swal.fire(
                            'Returned!',
                            'Your order has been returned.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    },
                    error: function(xhr, status, error) {
                        Swal.fire(
                            'Error!',
                            'There was a problem returning your order.',
                            'error'
                        );
                        console.error('Error returning order:', error);
                    }
                });
            }
        });
    });

    $('.cancel-return').click(function() {
        var orderId = $(this).data('orderid');
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to cancel the return request?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/cancelReturn',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ orderId: orderId }),
                    success: function(response) {
                        Swal.fire(
                            'Cancelled!',
                            'Your return request has been cancelled.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    },
                    error: function(xhr, status, error) {
                        Swal.fire(
                            'Error!',
                            'There was a problem cancelling your request.',
                            'error'
                        );
                        console.error('Error cancelling return request:', error);
                    }
                });
            }
        });
    });

    $('.order-date').each(function(){
        var date = new Date($(this).text());
        var formattedDate = date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' at');
        $(this).text(formattedDate);
    });
});
//Pagination page change
function changePage(page) {
    window.location.href = `/acctorderDetails?page=${page}`;
}