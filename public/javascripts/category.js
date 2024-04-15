document.querySelectorAll('.deleteButton').forEach(button => {
    button.addEventListener('click', async function(event) {

        event.preventDefault();
        const form = document.getElementById('deleteform');

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this category.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            form.submit();
        }
    });
});

