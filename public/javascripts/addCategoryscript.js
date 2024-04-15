const form = document.getElementById('addCategoryForm')

    form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let isValid = true;

    const categoryName = document.getElementById('category-name').value.trim();
    const categoryDescription = document.getElementById('category-description').value.trim();
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
    const categoryname_regex2 = /^[a-zA-Z][a-zA-Z0-9_]*$/;

    if(!categoryname_regex1.test(categoryName)){
      isValid = false;
      categoryname_error.innerHTML = "Categoryname must start with a letter"
    } else
    if(!categoryname_regex2.test(categoryName)){
      isValid = false;
      categoryname_error.innerHTML = "Categoryname must contain only alphanumeric characters and underscores."
      }

      if(categoryDescription.length < 3 && categoryDescription.length > 75){
        isValid = false;
        categorydescription_error.innerHTML = 'Category Description must be between 3 to 75 characters long'
      }

      if(isValid){
        form.submit();
      }
  })
