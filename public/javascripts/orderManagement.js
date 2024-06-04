$(document).ready(function() {
    // Change order status
    $('.order-status').change(function() {
        const orderId = $(this).data('order-id');
        const newStatus = $(this).val();
        const $row = $(this).closest('tr');

        $.ajax({
            url: '/admin/changeOrderStatus',
            type: 'POST',
            data: {
                orderId: orderId,
                status: newStatus
            },
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    text: 'Order status updated successfully.'
                });
                if (newStatus === 'Cancelled') {
                    updateCancelButton($row, true);
                } else {
                    updateCancelButton($row, false);
                }
            },
            error: function(error) {
                Swal.fire({
                    icon: 'error',
                    text: 'Failed to update order status.'
                });
            }
        });
    });

    // Cancel order
    $('.cancel-order').click(function() {
        const orderId = $(this).data('order-id');
        const $row = $(this).closest('tr');

        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'Are you sure you want to cancel this order?',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/admin/ordersCancel',
                    type: 'POST',
                    data: {
                        orderId: orderId
                    },
                    success: function(response) {
                        Swal.fire({
                            icon: 'success',
                            text: 'Order cancelled successfully.'
                        }).then(() => {
                            location.reload(); // Refresh the page to reflect the changes
                        });
                        updateCancelButton($row, true);
                    },
                    error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            text: 'Failed to cancel order.'
                        });
                    }
                });
            }
        });
    });

    //Function to update the cancel button
function updateCancelButton($row, isCancelled) {
    const $cancelButton = $row.find('.cancel-order');
    if (isCancelled) {
        $cancelButton
            .removeClass('btn-danger')
            .addClass('btn-secondary')
            .text('Cancelled')
            .prop('disabled', true);
    } else {
        $cancelButton
            .removeClass('btn-secondary')
            .addClass('btn-danger')
            .text('Cancel Order')
            .prop('disabled', false);
    }
}

});

//Format Date
// Format the order dates
$(document).ready(function(){
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


