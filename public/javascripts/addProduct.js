    var images = [];

    function image_select() {
        var image = document.getElementById('product-image').files;
        for (var i = 0; i < image.length; i++) {
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
        var imageHTML = "";
        images.forEach(function (img, index) {
            imageHTML += `<div class="image-container d-flex justify-content-center postion-absolute">
                                <img src="${img.url}" alt="images">
                                <span class="position-relative" onclick="delete_image(${index})">&times;</span>
                            </div>`;
        });
        return imageHTML;
    }

    function delete_image(index) {
        images.splice(index, 1);
        document.getElementById('container').innerHTML = image_show();
    }

    function check_duplicate(name) {
        var isDuplicate = false;
        images.forEach(function (img) {
            if (img.name === name) {
                isDuplicate = true;
            }
        });
        return !isDuplicate;
    }


    const form = document.getElementById('addProductForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
    
        let isValid = true;
    
        const sku = document.getElementById('product-sku').value.trim();
        const title = document.getElementById('product-title').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = document.getElementById('product-price').value.trim();
        const images = document.getElementById('product-image').files;
    
        const skuError = document.getElementById('sku_error');
        const titleError = document.getElementById('title_error');
        const descriptionError = document.getElementById('description_error');
        const priceError = document.getElementById('price_error');
        const imageError = document.getElementById('image_error');
    
        skuError.innerHTML = '';
        titleError.innerHTML = '';
        descriptionError.innerHTML = '';
        priceError.innerHTML = '';
        imageError.innerHTML = '';
    
        // SKU validation
        const skuRegex = /^[A-Z0-9]+$/;
        if (!sku) {
            isValid = false;
            skuError.innerHTML = 'SKU is required.';
        } else if (!skuRegex.test(sku)) {
            isValid = false;
            skuError.innerHTML = 'Invalid SKU format. Only capital letters and numbers are allowed.';
        }
    
        // Title validation
        const titleRegex = /^[A-Za-z0-9\s]+$/;
        if (!title) {
            isValid = false;
            titleError.innerHTML = 'Title is required.';
        } else if (!titleRegex.test(title)) {
            isValid = false;
            titleError.innerHTML = 'Invalid title format. Only alphabets are allowed.';
        }
    
        // Description validation
        const descriptionRegex = /^[A-Za-z0-9.,\s]+$/;
        if (!description) {
            isValid = false;
            descriptionError.innerHTML = 'Description is required.';
        } else if (!descriptionRegex.test(description)) {
            isValid = false;
            descriptionError.innerHTML = 'Invalid description format. Only alphanumeric characters are allowed.';
        }
    
        // Price validation
        const priceRegex = /^\d+(\.\d{1,2})?$/;
        if (!price) {
            isValid = false;
            priceError.innerHTML = 'Price is required.';
        } else if (!priceRegex.test(price)) {
            isValid = false;
            priceError.innerHTML = 'Invalid price format. Only numbers are allowed.';
        }
    
        // Image validation
        if (!images || images.length === 0) {
            isValid = false;
            imageError.innerHTML = 'At least one image is required.';
        } else if (images.length > 4) {
            isValid = false;
            imageError.innerHTML = 'Maximum of 4 images can be uploaded.';
        }
    
        // Submit form if valid
        if (isValid) {
            form.submit();
        }
    });
    const addAttributesButton = document.getElementById('add_atrubutes');

if (addAttributesButton) {
  addAttributesButton.addEventListener('click', () => {
    $('#addAttributesModal').modal('show');
  });
}