let images = [];
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
    //document.getElementById('form').reset();
    document.getElementById('container').innerHTML = image_show();
}

function image_show() {
    let imageHTML = "";
    images.forEach(function (img, index) {
        imageHTML += `<div class="image-container d-flex justify-content-center postion-absolute">
                            <img src="${img.url}" alt="images">
                            <span class="position-relative" onclick="delete_image(${index})"">&times;</span>
                        </div>`;
    });
    return imageHTML;
}

function delete_image(index) {
    images.splice(index, 1);
    document.getElementById('container').innerHTML = image_show();
}

function check_duplicate(name) {
    let isDuplicate = false;
    images.forEach(function (img) {
        if (img.name === name) {
            isDuplicate = true;
        }
    });
    return !isDuplicate;
}


let addImages = [];
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
    //document.getElementById('form').reset();
    document.getElementById('variant_container').innerHTML = addImage_show();
}

function addImage_show() {
    let imageHTML = "";
    addImages.forEach(function (img, index) {
        imageHTML += `<div class="image-container d-flex justify-content-center postion-absolute">
                            <img src="${img.url}" alt="images">
                            <span class="position-relative" onclick="adddelete_image(${index})"">&times;</span>
                        </div>`;
    });
    return imageHTML;
}
function adddelete_image(index) {
    addImages.splice(index, 1);
    document.getElementById('variant_container').innerHTML = addImage_show();
}
function addcheck_duplicate(name) {
    let isDuplicate = false;
    addImages.forEach(function (img) {
        if (img.name === name) {
            isDuplicate = true;
        }
    });
    return !isDuplicate;
}


let editImages = [];
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
    //document.getElementById('form').reset();
    document.getElementById('editImageContainer').innerHTML = editImage_show();
}

function editImage_show() {
    let imageHTML = "";
    editImages.forEach(function (img, index) {
        imageHTML += `<div class="image-container d-flex justify-content-center postion-absolute">
                            <img src="${img.url}" alt="images">
                            <span class="position-relative" onclick="editdelete_image(${index})"">&times;</span>
                        </div>`;
    });
    return imageHTML;
}
function editdelete_image(index) {
    editImages.splice(index, 1);
    document.getElementById('editImageContainer').innerHTML = editImage_show();
}
function editcheck_duplicate(name) {
    let isDuplicate = false;
    editImages.forEach(function (img) {
        if (img.name === name) {
            isDuplicate = true;
        }
    });
    return !isDuplicate;
}


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

//for getting attribute details of product(For attribute editing)
$(document).ready(function(){
    $('.editVariantButton').click(function() {
        var variantId = $(this).data('variantid');
        $.ajax({
            url: '/admin/getVariantDetails/' + variantId,
            method: 'GET',
            success: function(data) {
                $('#variantId').val(variantId);
                $('#edit_variant_sku').val(data.variant.sku);
                $('#edit_attributeName').val(data.variant.attributeName);
                $('#edit_attributeValue').val(data.variant.attributeValue);
                $('#edit_variantPrice').val(data.variant.price);
                $('#edit_stock').val(data.variant.stock);
                // Set isActive checkbox
                if (data.variant.isActive) {
                    $('#edit_isActive').prop('checked', true);
                } else {
                    $('#edit_isActive').prop('checked', false);
                }
                $('#editImageContainer').empty(); // Clear existing images
                data.variant.images.forEach(function (imageURL) {
                    $('#editImageContainer').append(`<div class="image-container d-flex justify-content-around position-relative"><img src="/${imageURL}" alt="Varient Image"></div>`);
                }); 
                // Show the modal
                $('#editAttributesModal').modal('show');
            },
            error: function(xhr, status, error) {
                console.error('Error fetching variant details:', error);
            }
        })
    })
})

function alertFunction () {
   let deleteForm = document.getElementById('deleteform');
   swal({
    title: "Are you sure?",
    text: "But you will still be able to retrieve this file. deleteForm",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, Delete it!",
    cancelButtonText: "No, Cancel Please!",
    closeOnConfirm: false,
    closeOnCancel: false
  },
  function(isConfirm){
    if (isConfirm) {
        deleteForm.submit();          
    } else {
      swal("Cancelled", "error");
    }
  });
}

$(document).ready(function() {
    $("#delete_attributes").click(function() {
        Swal.fire({
            title: "Are you sure?",
            text: "Once deleted delete_attributes, you will not be able to recover this variant!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(function(result) {
            if (result.isConfirmed) {
                $("#deleteform").submit();
            }
        });
    });
});
