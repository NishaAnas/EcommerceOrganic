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


const form = document.getElementById('editcategoryForm');

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let isValid = true;

    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryDescription = document.getElementById('categoryDetails').value.trim();
    const categoryname_error = document.getElementById('categoryname_error');
    const categorydescription_error = document.getElementById('description_error');
    const form_error = document.getElementById('form_error');

    categoryname_error.innerHTML = '';
    categorydescription_error.innerHTML = ''; 
    form_error.innerHTML = ''; 

    if (categoryName.trim() === '' || categoryDescription.trim() === '') {
    isValid = false;
    form_error.innerHTML = "Invalid Inputs";
    }

    if (categoryName.trim().length < 3 || categoryName.trim().length > 20) {
    isValid = false;
    categoryname_error.innerHTML = 'Category name must be between 3 to 20 characters long';
    }
    const categoryname_regex1= /^[a-zA-Z]/
    const categoryname_regex2 = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;

    if(!categoryname_regex1.test(categoryName)){
    isValid = false;
    categoryname_error.innerHTML = "Category Name must start with a letter"
    } else
    if(!categoryname_regex2.test(categoryName)){
    isValid = false;
    categoryname_error.innerHTML = "Invalid Format."
    }

    if(categoryDescription.length < 3 && categoryDescription.length > 75){
        isValid = false;
        categorydescription_error.innerHTML = 'Category Description must be between 3 to 75 characters long'
    }

    if(isValid){
        form.submit();
    }
})