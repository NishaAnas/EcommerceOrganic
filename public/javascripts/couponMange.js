    $(document).ready(function() {
        $('.coupon-date').each(function() {
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

        // Date validation function
        function isValidDate(dateString) {
            var today = new Date();
            var inputDate = new Date(dateString);
            return inputDate > today;
        }

        // Add Coupon
        $('#addCouponForm').on('submit', function(e) {
            e.preventDefault();
            var expiryDate = $('#couponExpiryDate').val();
            if (!isValidDate(expiryDate)) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Expiry date must be greater than today\'s date.',
                    icon: 'error'
                });
                return;
            }
            $.ajax({
                url: '/admin/addCoupon',
                method: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    $('#addCouponModal').modal('hide');
                    Swal.fire('Success', 'Coupon added successfully!', 'success').then(() => {
                        location.reload();
                    });
                },
                error: function(response) {
                    Swal.fire({
                        title: 'Error!',
                        text: response.responseJSON.error,
                        icon: 'error'
                    });
                }
            });
        });

        // Open edit modal with coupon details
        $('.editCouponBtn').on('click', function() {
            const id = $(this).data('id');
            $.get(`/admin/getCoupon/${id}`, function(data) {
                $('#editCouponId').val(data._id);
                $('#editCouponName').val(data.name);
                $('#editCouponDescription').val(data.description);
                $('#editCouponDiscount').val(data.discount);
                $('#editCouponExpiryDate').val(data.expiryDate.split('T')[0]);
                $('#editCouponMinPurchaseAmount').val(data.minPurchaseAmount);
                $('#editCouponUserFirstPurchase').prop('checked', data.userFirstPurchase);
                $('#editCouponModalName').text(data.name);
                $('#editCouponModalId').text(data._id);
                $('#editCouponModal').modal('show');
            });
        });

        // Edit Coupon
        $('#editCouponForm').on('submit', function(e) {
            e.preventDefault();
            var expiryDate = $('#editCouponExpiryDate').val();
            if (!isValidDate(expiryDate)) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Expiry date must be greater than today\'s date.',
                    icon: 'error'
                });
                return;
            }
            const id = $('#editCouponId').val();
            $.ajax({
                url: `/admin/editCoupon/${id}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: $('#editCouponName').val(),
                    description: $('#editCouponDescription').val(),
                    discount: $('#editCouponDiscount').val(),
                    expiryDate: $('#editCouponExpiryDate').val(),
                    minPurchaseAmount: $('#editCouponMinPurchaseAmount').val(),
                    userFirstPurchase: $('#editCouponUserFirstPurchase').is(':checked'),
                }),
                success: function(response) {
                    $('#editCouponModal').modal('hide');
                    Swal.fire('Success', 'Coupon updated successfully!', 'success').then(() => {
                        location.reload();
                    });
                },
                error: function(response) {
                    Swal.fire({
                        title: 'Error!',
                        text: response.responseJSON.error,  
                        icon: 'error'
                    });
                }
            });
        });

        // Delete Coupon
        $('.deleteCouponBtn').on('click', function() {
            const id = $(this).data('id');
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/admin/deleteCoupon/${id}`,
                        method: 'DELETE',
                        success: function(response) {
                            Swal.fire('Deleted!', 'Your coupon has been deleted.', 'success').then(() => {
                                location.reload();
                            });
                        },
                        error: function(response) {
                            Swal.fire({
                                title: 'Error!',
                                text: response.responseJSON.error, 
                                icon: 'error'
                            });
                        }
                    });
                }
            });
        });
    });

    function closeModal() {
        $('#editCouponModal').modal('hide');
    }

    function closeaddModal() {
        $('#addCouponModal').modal('hide');
    }

