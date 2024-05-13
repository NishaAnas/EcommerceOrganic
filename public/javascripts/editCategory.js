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
