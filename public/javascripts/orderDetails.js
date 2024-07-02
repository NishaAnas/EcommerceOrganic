// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

$(document).ready(function(){

    //Cancel the complete order
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


    //Return The complete Order
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

    //Cancel the Return
    $('.cancel-return-button').click(function() {
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

    //Cancel Individual Items
    $('.cancel-item-button').on('click', function(event) {
        var orderId = $(this).data('orderid');
        var itemId = $(this).data('itemid');

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to cancel this item?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        }).then(function(result) {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/cancelOrderItem',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ orderId: orderId, itemId: itemId }),
                    success: function(result) {
                        Swal.fire({
                            title: 'Cancelled!',
                            text: result.message,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(function() {
                            $('tr[data-itemid="' + itemId + '"]').remove();
                            $('#total-amount').text('₹' + result.order.totalAmount.toFixed(2));
                            if (result.order.orderStatus === 'Cancelled') {
                                $('.cancel-item-button').prop('disabled', true);
                            }
                            location.reload();
                        });
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: xhr.responseJSON.message || 'An error occurred while cancelling the item.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    });

    //Return Individual Item
    $('.return-item-button').on('click', function() {
        var orderId = $(this).data('orderid');
        var itemId = $(this).data('itemid');

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to return this item?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, return it!',
            cancelButtonText: 'No, keep it'
        }).then(function(result) {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/returnOrderItem',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ orderId: orderId, itemId: itemId }),
                    success: function(result) {
                        Swal.fire('Returned!', result.message, 'success')
                            .then(function() {
                                $('tr[data-itemid="' + itemId + '"]').remove();
                                $('#total-amount').text('₹' + result.order.totalAmount.toFixed(2));
                                if (result.order.orderStatus === 'Return') {
                                    $('.return-item-button').prop('disabled', true);
                                }
                                location.reload();
                            });
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                        Swal.fire('Error!', xhr.responseJSON.message || 'An error occurred while returning the item.', 'error');
                    }
                });
            }
        });
    });

    $('[data-bs-target="#invoiceModal"]').on('click', function() {
        var orderId = $(this).data('orderid');
        $.ajax({
            url: `/displayInvoice/${orderId}`,
            method: 'GET',
            dataType: 'json',
            success: function(invoiceData) {
                $('#invoiceNumber').text(invoiceData.invoiceNumber);
                $('#paymentStatus').text(invoiceData.paymentStatus);
                $('#storeAddress').text(invoiceData.storeAddress);
                $('#storeEmail').text(invoiceData.storeEmail);
                $('#storePhone').text(invoiceData.storePhone);
                $('#billedToName').text(invoiceData.billedTo.name);
                $('#billedToAddress').text(`${invoiceData.billedTo.address.street}, ${invoiceData.billedTo.address.city}, ${invoiceData.billedTo.address.state}, ${invoiceData.billedTo.address.pincode}`);
                $('#invoiceDate').text(invoiceData.invoiceDate);
                $('#orderNumber').text(invoiceData.orderNumber);

                let discountAmount = invoiceData.discountAmount === 0 ? '-' : `₹${invoiceData.discountAmount}`;
                $('#discountAmount').text(discountAmount);

                let orderSummaryHTML = '';
                $.each(invoiceData.items, function(index, item) {
                    orderSummaryHTML += `
                        <tr>
                            <th scope="row">${index + 1}</th>
                            <td>${item.item}</td>
                            <td>₹${item.price}</td>
                            <td>${item.quantity}</td>
                            <td class="text-end">₹${item.total}</td>
                        </tr>`;
                });
                orderSummaryHTML += `
                    <tr>
                        <th scope="row" colspan="4" class="text-end">Sub Total</th>
                        <td class="text-end">₹${invoiceData.subTotal}</td>
                    </tr>
                    <tr>
                        <th scope="row" colspan="4" class="text-end">Discount</th>
                        <td class="text-end">- ₹${invoiceData.discountAmount}</td>
                    </tr>
                    <tr>
                        <th scope="row" colspan="4" class="text-end">Shipping Charge</th>
                        <td class="text-end">+ ₹${invoiceData.deliveryFee}</td>
                    </tr>
                    <tr>
                        <th scope="row" colspan="4" class="text-end">Total</th>
                        <td class="text-end"><h4 class="m-0 fw-semibold">₹${invoiceData.totalAmount}</h4></td>
                    </tr>`;
                $('#orderSummary').html(orderSummaryHTML);

                $('#downloadInvoice').on('click', function() {
                    generatePDF();
                });
            },
            error: function(xhr, status, error) {
                console.error('Error fetching invoice data:', error);
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

    $('#retryPaymentButton').on('click', function() {
        const orderId = $(this).data('orderid');
        $('#confirmRetryPayment').data('orderid', orderId);
    });

    $('#confirmRetryPayment').on('click', function() {
        const orderId = $(this).data('orderid');
        const paymentMethod = $('input[name="paymentMethod"]:checked').val();

                if (paymentMethod === 'razorpay') {
                    $.ajax({
                        url: `/retryPayment/${orderId}`,
                        type: 'POST',
                        data: { paymentMethod: paymentMethod },
                        success: function(result) {
                            const options = {
                                key: result.razorpayKey,
                                amount: result.amount,
                                currency: 'INR',
                                name: 'Organic',
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
                                            //window.location.href = `/orderdetails/${razorResult.orderId}`;
                                            location.reload();
                                        });
                                }catch (error) {
                                    console.error('Error during Razorpay fetch:', error);
                                    Swal.fire({
                                        title: 'Error!',
                                        text: error.message || 'An unexpected error occurred during Razorpay confirmation. Please try again.',
                                        icon: 'error'
                                    });
                                }
                            }
                        };
                        const rzp1 = new Razorpay(options);
                            rzp1.open();
                    },error: function(error) {
                        console.error('Error retrying payment:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'An unexpected error occurred while retrying payment. Please try again.',
                            icon: 'error'
                        });
                    }
                })
            }else if (paymentMethod === 'wallet') {
                $.ajax({
                    url: `/retryPayment/${orderId}`,
                    type: 'POST',
                    data: { paymentMethod: paymentMethod },
                    success: function(result) {
                        Swal.fire({
                            title: 'Success!',
                            text: result.message,
                            icon: 'success'
                        }).then(() => {
                            //window.location.href = `/orderdetails/${result.orderId}`;
                            location.reload();
                        });
                    },
                    error: function(error) {
                        console.error('Error retrying payment:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'An unexpected error occurred while retrying payment. Please try again.',
                            icon: 'error'
                        });
                    }
                });
            }
    })
});
//Pagination page change
function changePage(page) {
    window.location.href = `/acctorderDetails?page=${page}`;
}

function generatePDF() {
    var invoiceElement = document.getElementById('invoiceContent');
    if (invoiceElement) {
        html2canvas(invoiceElement).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 5, 5);
            pdf.save('invoice.pdf');
        }).catch(error => {
            console.error('Error generating PDF:', error);
        });
    } else {
        console.error('Invoice content element not found');
    }
}