document.querySelectorAll('.deleteButton').forEach(button => {
    //conformation to delete a product
    button.addEventListener('click', async function(event) {
        event.preventDefault();
        const form = document.getElementById('deleteform');
        const productId = form.elements._id.value; 
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this product.',
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
