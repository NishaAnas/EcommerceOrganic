$(document).ready(function() {
    // Handling click on the add money button
    $('#add-money-button').click(async function() {
        const amount = $('#amount').val();
        if (amount <= 0) {
            Swal.fire({
                title: 'Error!',
                text: 'Inavalid Amount',
                icon: 'error'
            });
            return;
        }

        try {
            // Sending POST request to add money to wallet
            const response = await fetch('/walletaddMoney', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            // Displaying success message and reloading page on success
            Swal.fire({
                title: 'Success!',
                text: result.message,
                icon: 'success'
            }).then(() => {
                location.reload();
            });
        } catch (error) {
            console.error('Error adding money:', error);
            Swal.fire({
                title: 'Error!',
                text: error,
                icon: 'error'
            });
        }
    });

    // Format the order dates
    $('.order-date').each(function() {
        const date = new Date($(this).text());
        const formattedDate = date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' at');
        $(this).text(formattedDate);
    });
});