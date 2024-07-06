{/* <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        const categoryId = document.getElementById('product-categoryId').value.trim()
                        const categorySelect = document.getElementById("categoryId");
    

                        //populationg category in the dropdown
                        Array.from(categorySelect.options).forEach(option => {
                            if (option.value === categoryId) {
                            option.selected = true;
                            }
                        });

                        //Edit product Form 
                        const editProductform = document.getElementById('editProductForm');
                        editProductform.addEventListener('submit', (e) => {
                        e.preventDefault();
                        let isValid = true;
                        const sku =document.getElementById('sku').value.trim();
                        const title = document.getElementById('producttitle').value.trim();
                        const name = document.getElementById('productname').value.trim();
                        const price = document.getElementById('productPrice').value.trim();
                        const images = document.getElementById('product_image_container').files;
                        
                        

                        const skuError = document.getElementById('sku_error');
                        const titleError = document.getElementById('title_error');
                        const nameError = document.getElementById('name_error');
                        const priceError = document.getElementById('price_error');
                        const imageError = document.getElementById('image_error');
                        const formError = document.getElementById('form_error');
                    
                        skuError.innerHTML = '';
                        titleError.innerHTML = '';
                        nameError.innerHTML = '';
                        priceError.innerHTML = '';
                        imageError.innerHTML = '';
                        formError.innerHTML = '';

                        

                        //validating fields
                        // SKU validation
                        const skuRegex = /^[A-Z0-9]+$/;
                        if (sku.trim()==='') {
                            isValid = false;
                            skuError.innerHTML = 'SKU is required.';
                        } else if (!skuRegex.test(sku)) {
                            isValid = false;
                            skuError.innerHTML = 'Invalid SKU format. Only capital letters and numbers are allowed.';
                        }
                    
                        // Title validation
                        const titleRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
                        if (title.trim()==='') {
                            isValid = false;
                            titleError.innerHTML = 'Title is required.';
                        } else if (!titleRegex.test(title)) {
                            isValid = false;
                            titleError.innerHTML = 'Invalid title format.';
                        }
                    
                        // name validation
                        const nameRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
                        if (name.trim()==='') {
                            isValid = false;
                            nameError.innerHTML = 'Name is required.';
                        } else if (!nameRegex.test(name)) {
                            isValid = false;
                            nameError.innerHTML = 'Invalid name format.';
                        }
                    
                        // Price validation
                        const priceRegex = /^\d+(\.\d{1,2})?$/;
                        if (price.trim()==='') {
                            isValid = false;
                            priceError.innerHTML = 'Price is required.';
                        } else if (!priceRegex.test(price)) {
                            isValid = false;
                            priceError.innerHTML = 'Invalid price format. Only numbers are allowed.';
                        }
                    
                        // Image validation
                        if (!images || images.length === 0) {
                            isValid = false;
                            imageError.innerHTML = 'At least one image is .';
                        } else if (images.length > 4) {
                            isValid = false;
                            imageError.innerHTML = 'Maximum of 4 images can be uploaded.';
                        }
                    
                        // Submit form if valid
                        if (isValid) {
                            editProductform.submit();
                        }
                        })

                        //Add Varient Form 
                        const addVarientForm = document.getElementById('attributeForm');
                        addVarientForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        let isValid = true;

                        const vsku =document.getElementById('varientsku').value.trim();
                        const vname = document.getElementById('varientName').value.trim();
                        const vvalue = document.getElementById('varientValue').value.trim();
                        const vprice = document.getElementById('varientPrice').value.trim();
                        const vstock = document.getElementById('varientStock').value.trim();
                        //const vimages = document.getElementById('varientImage').files;
                        
                        
                        const askuError = document.getElementById('asku_error');
                        const avarientNameError = document.getElementById('avarientName_error');
                        const avarientValueError = document.getElementById('avarientValue_error');
                        const apriceError = document.getElementById('aprice_error');
                        const astockError = document.getElementById('astock_error');
                        const aimageError = document.getElementById('aimage_error');
                        const aformError = document.getElementById('aform_error');
                    
                        askuError.innerHTML = '';
                        avarientNameError.innerHTML = '';
                        avarientValueError.innerHTML = '';
                        apriceError.innerHTML = '';
                        astockError.innerHTML = '';
                        aimageError.innerHTML = '';
                        aformError.innerHTML = '';

                        //validating fields
                        // SKU validation
                        const vskuRegex = /^[A-Z0-9]+$/;
                        if (vsku.trim()==='') {
                            isValid = false;
                            askuError.innerHTML = 'SKU is required .';
                            aformError.innerHTML = 'Invalid Inputs.';
                        } else if (!skuRegex.test(sku)) {
                            isValid = false;
                            skuError.innerHTML = 'Invalid SKU format. Only capital letters and numbers are allowed.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Varient Name validation
                        const vnameRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
                        if (vname.trim()==='') {
                            isValid = false;
                            avarientNameError.innerHTML = 'Name is required.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        } else if (!vnameRegex.test(vname)) {
                            isValid = false;
                            avarientNameError.innerHTML = 'Invalid Name format.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Varient Value validation
                        const vvalueRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
                        if (vvalue.trim()==='') {
                            isValid = false;
                            avarientValueError.innerHTML = 'Value is required .';
                            aformError.innerHTML = 'Invalid Inputs.';
                        } else if (!vvalueRegex.test(vvalue)) {
                            isValid = false;
                            avarientValueError.innerHTML = 'Invalid Value format.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Price validation
                        const vpriceRegex = /^\d+(\.\d{1,2})?$/;
                        if (vprice.trim()==='') {
                            isValid = false;
                            apriceError.innerHTML = 'Price is required .';
                            aformError.innerHTML = 'Invalid Inputs.';
                        } else if (!vpriceRegex.test(vprice)) {
                            isValid = false;
                            apriceError.innerHTML = 'Invalid price format. Only numbers are allowed.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        }

                        // Stock validation
                        const vstockRegex = /^\d+(\.\d{1,2})?$/;
                        if (vstock.trim()==='') {
                            isValid = false;
                            astockError.innerHTML = 'Stock is required.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        } else if (!vstockRegex.test(vstock)) {
                            isValid = false;
                            astockError.innerHTML = 'Invalid Stock format. Only numbers are allowed.';
                            aformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Image validation
                        //if (!images || images.length === 0) {
                        //    isValid = false;
                        //    imageError.innerHTML = 'At least one image is required.';
                        //    formError.innerHTML = 'Invalid Inputs.';
                        //} else if (images.length > 4) {
                         //   isValid = false;
                         //   imageError.innerHTML = 'Maximum of 4 images can be uploaded.';
                         //   formError.innerHTML = 'Invalid Inputs.';
                        //}
                    
                        // Submit form if valid
                        if (isValid) {
                            editProductform.submit();
                        }
                        })

                        //Edit Varient Form 
                        const editattributeForm = document.getElementById('editattributeForm');
                        editattributeForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        let isValid = true;

                        const esku =document.getElementById('evarientsku').value.trim();
                        const ename = document.getElementById('evarientName').value.trim();
                        const evalue = document.getElementById('evarientValue').value.trim();
                        const eprice = document.getElementById('evarientPrice').value.trim();
                        const estock = document.getElementById('evarientStock').value.trim();
                        //const vimages = document.getElementById('varientImage').files;
                        
                        
                        const eskuError = document.getElementById('esku_error');
                        const evarientNameError = document.getElementById('evarientName_error');
                        const evarientValueError = document.getElementById('evarientValue_error');
                        const epriceError = document.getElementById('aprice_error');
                        const estockError = document.getElementById('estock_error');
                        const eimageError = document.getElementById('eimage_error');
                        const eformError = document.getElementById('eform_error');
                    
                        eskuError.innerHTML = '';
                        evarientNameError.innerHTML = '';
                        evarientValueError.innerHTML = '';
                        epriceError.innerHTML = '';
                        estockError.innerHTML = '';
                        eimageError.innerHTML = '';
                        eformError.innerHTML = '';

                        //validating fields
                        // SKU validation
                        const eskuRegex = /^[A-Z0-9]+$/;
                        if (esku.trim()==='') {
                            isValid = false;
                            eskuError.innerHTML = 'SKU is required .';
                            eformError.innerHTML = 'Invalid Inputs.';
                        } else if (eskuRegex.testesku) {
                            isValid = false;
                            ekuError.innerHTML = 'Invalid SKU format. Only capital letters and numbers are allowed.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Varient Name validation
                        const enameRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
                        if (ename.trim()==='') {
                            isValid = false;
                            evarientNameError.innerHTML = 'Name is required.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        } else if (!enameRegex.test(ename)) {
                            isValid = false;
                            evarientNameError.innerHTML = 'Invalid Name format.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Varient Value validation
                        const evalueRegex = /^[a-zA-Z][a-zA-Z0-9_ -$&()]*$/;
                        if (evalue.trim()==='') {
                            isValid = false;
                            evarientValueError.innerHTML = 'Value is required .';
                            eformError.innerHTML = 'Invalid Inputs.';
                        } else if (!evalueRegex.test(evalue)) {
                            isValid = false;
                            evarientValueError.innerHTML = 'Invalid Value format.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Price validation
                        const epriceRegex = /^\d+(\.\d{1,2})?$/;
                        if (eprice.trim()==='') {
                            isValid = false;
                            epriceError.innerHTML = 'Price is required .';
                            eformError.innerHTML = 'Invalid Inputs.';
                        } else if (!epriceRegex.test(eprice)) {
                            isValid = false;
                            epriceError.innerHTML = 'Invalid price format. Only numbers are allowed.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        }

                        // Stock validation
                        const estockRegex = /^\d+(\.\d{1,2})?$/;
                        if (estock.trim()==='') {
                            isValid = false;
                            estockError.innerHTML = 'Stock is required.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        } else if (!estockRegex.test(estock)) {
                            isValid = false;
                            estockError.innerHTML = 'Invalid Stock format. Only numbers are allowed.';
                            eformError.innerHTML = 'Invalid Inputs.';
                        }
                    
                        // Image validation
                        //if (!images || images.length === 0) {
                        //    isValid = false;
                        //    imageError.innerHTML = 'At least one image is required.';
                        //    formError.innerHTML = 'Invalid Inputs.';
                        //} else if (images.length > 4) {
                         //   isValid = false;
                         //   imageError.innerHTML = 'Maximum of 4 images can be uploaded.';
                         //   formError.innerHTML = 'Invalid Inputs.';
                        //}
                    
                        // Submit form if valid
                        if (isValid) {
                            editattributeForm.submit();
                        }
                    
                    })
                    })
                        

                </script> */}








                
