$(document).ready(function(){
    // Global variables to store image arrays
    let images = [];
    let addImages = [];
    let editImages = [];
    let imageURLs = [];

    // Function to handle image selection for product images
    function image_select() {
        let image = document.getElementById('product-image').files;
        for (let i = 0; i < image.length; i++) {
            if (check_duplicate(image[i].name)) {
                images.push({
                    "name": image[i].name,
                    "url": URL.createObjectURL(image[i]),
                    "file": image[i]
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Image',
                    text: image[i].name + ' is already added',
                    confirmButtonText: 'OK'
                });
            }
        }
        document.getElementById('container').innerHTML = image_show();
    }

    // Function to display selected images for product images
    function image_show() {
        let imageHTML = "";
        images.forEach(function (img, index) {
            imageHTML += `<div class="image-container d-flex justify-content-center position-relative">
                                <img src="${img.url}" alt="images">
                                <span class="position-absolute" onclick="delete_image(${index})">&times;</span>
                          </div>`;
        });
        return imageHTML;
    }

    // Function to delete selected image for product images
    function delete_image(index) {
        images.splice(index, 1);
        document.getElementById('container').innerHTML = image_show();
    }

    // Function to check for duplicate images for product images
    function check_duplicate(name) {
        return !images.some(img => img.name === name);
    }

    // Function to handle image selection for variant images
    function vimage_select() {
        let image = document.getElementById('variantImage').files;
        for (let i = 0; i < image.length; i++) {
            if (addcheck_duplicate(image[i].name)) {
                addImages.push({
                    "name": image[i].name,
                    "url": URL.createObjectURL(image[i]),
                    "file": image[i]
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Image',
                    text: image[i].name + ' is already added',
                    confirmButtonText: 'OK'
                });
            }
        }
        document.getElementById('variant_container').innerHTML = addImage_show();
    }

    // Function to display selected images for variant images
    function addImage_show() {
        let imageHTML = "";
        addImages.forEach(function (img, index) {
            imageHTML += `<div class="image-container d-flex justify-content-center position-relative">
                                <img src="${img.url}" alt="images">
                                <span class="position-absolute" onclick="adddelete_image(${index})">&times;</span>
                          </div>`;
        });
        return imageHTML;
    }

    // Function to delete selected image for variant images
    function adddelete_image(index) {
        addImages.splice(index, 1);
        document.getElementById('variant_container').innerHTML = addImage_show();
    }

    // Function to check for duplicate images for variant images
    function addcheck_duplicate(name) {
        return !addImages.some(img => img.name === name);
    }

    // Function to handle image selection for edit variant images
    function eimage_select() {
        let image = document.getElementById('editVariantImage').files;
        for (let i = 0; i < image.length; i++) {
            if (editcheck_duplicate(image[i].name)) {
                editImages.push({
                    "name": image[i].name,
                    "url": URL.createObjectURL(image[i]),
                    "file": image[i]
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Image',
                    text: image[i].name + ' is already added',
                    confirmButtonText: 'OK'
                });
            }
        }
        document.getElementById('editImageContainer').innerHTML = editImage_show();
    }

    // Function to display selected images for edit variant images
    function editImage_show() {
        let imageHTML = "";
        editImages.forEach(function (img, index) {
            imageHTML += `<div class="image-container d-flex justify-content-center position-relative">
                                <img src="${img.url}" alt="images">
                                <span class="position-absolute" onclick="editdelete_image(${index})">&times;</span>
                          </div>`;
        });
        return imageHTML;
    }

    // Function to delete selected image for edit variant images
    function editdelete_image(index) {
        editImages.splice(index, 1);
        document.getElementById('editImageContainer').innerHTML = editImage_show();
    }

    // Modal functions for adding and editing attributes
    const addAttributesButton = document.getElementById('add_attributes');
    if (addAttributesButton) {
        addAttributesButton.addEventListener('click', () => {
            $('#addAttributesModal').modal('show');
        });
    }

    function closeModal() {
        $('#addAttributesModal').modal('hide');
    }

    function closeeditModal() {
        $('#editAttributesModal').modal('hide');
    }

    // Function to fetch and populate variant details for editing
    $('.editVariantButton').click(function() {
        var variantId = $(this).data('variantid');
        $.ajax({
            url: '/admin/getVariantDetails/' + variantId,
            method: 'GET',
            success: function(data) {
                // Populate form fields with variant data
                $('#variantId').val(variantId);
                $('#edit_variant_sku').val(data.variant.sku);
                $('#edit_attributeName').val(data.variant.attributeName);
                $('#edit_attributeValue').val(data.variant.attributeValue);
                $('#edit_variantPrice').val(data.variant.price);
                $('#edit_stock').val(data.variant.stock);

                // Store current image URLs in imageURLs array
                imageURLs = data.variant.images;

                // Display existing images in edit modal
                $('#editImageContainer').empty(); // Clear existing images
                imageURLs.forEach(function(imageURL, index) {
                    $('#editImageContainer').append(`
                        <div class="image-container d-flex justify-content-around position-relative">
                            <img src="/${imageURL}" alt="Variant Image">
                            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" onclick="removeImage(${index})">&times;</span>
                        </div>
                    `);
                });

                $('#editAttributesModal').modal('show'); // Show edit modal
            },
            error: function(xhr, status, error) {
                console.error('Error fetching variant details:', error);
            }
        });
    });

    // Function to remove image from the UI and imageURLs array
    window.removeImage = function(index) {
        imageURLs.splice(index, 1); // Remove image URL from array
        $('#editImageContainer').children().eq(index).remove(); // Remove image from UI

        // Update onclick function for remaining images
        $('#editImageContainer').children().each(function(i) {
            $(this).find('.bg-danger').attr('onclick', `removeImage(${i})`);
        });

        // AJAX request to remove image from database
        $.ajax({
            url: '/admin/removeImage',
            method: 'POST',
            data: { variantId: $('#variantId').val(), index: index },
            success: function(response) {
                console.log('Image removed from database');
            },
            error: function(xhr, status, error) {
                console.error('Error removing image from database:', error);
            }
        });
    };

    // Function to handle image selection in the edit modal
    window.eimage_select = function() {
        const files = $('#edit-variant-image')[0].files;
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Add new image URL to imageURLs array
                imageURLs.push(files[i].name);
                $('#editImageContainer').append(`
                    <div class="image-container d-flex justify-content-around position-relative">
                        <img src="${e.target.result}" alt="Variant Image">
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" onclick="removeImage(${imageURLs.length - 1})">&times;</span>
                    </div>
                `);
            };
            reader.readAsDataURL(files[i]);
        }
    };

    // Submit the form with the updated image URLs
    $('#editAttributesForm').submit(function(e) {
        e.preventDefault();

        // Create FormData object to handle form data and files
        var formData = new FormData();
        formData.append('productId', $('#productId').val());
        formData.append('variantId', $('#variantId').val());
        formData.append('sku', $('#edit_variant_sku').val());
        formData.append('attributeName', $('#edit_attributeName').val());
        formData.append('attributeValue', $('#edit_attributeValue').val());
        formData.append('price', $('#edit_variantPrice').val());
        formData.append('stock', $('#edit_stock').val());

        // Append current image URLs to FormData
        imageURLs.forEach(function(imageURL) {
            formData.append('imageURLs[]', imageURL);
        });

        // Append new image files to FormData (if any)
        var files = $('#edit-variant-image')[0].files;
        for (var i = 0; i < files.length; i++) {
            formData.append('image', files[i]);
        }

        // Perform AJAX request to update variant details
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                    toastr.success('Variant updated successfully');
                    // Refresh the page to show updated variant details
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
            },
            error: function(xhr, status, error) {
                console.error('Error updating variant:', error);
                toastr.error('Updation Failed.');
            }
        });
    });
});
