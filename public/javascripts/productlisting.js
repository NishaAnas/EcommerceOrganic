$(document).ready(function () {
    // Update max price label dynamically as slider changes
    $('#price-range').on('input', function () {
        var value = $(this).val();
        $('#max-price-label').text(value);
    });

    // Update displayed price value as slider changes
    $('#priceRange').on('input', function() {
        $('#priceValue').text($(this).val());
    });

    // Reset all filters to default values
    $('#reset-filters').click(function () {
        $('#search-input').val('');
        $('input[type="checkbox"]').prop('checked', false);
        $('#priceRange').val(1000);
        $('#priceValue').text(1000);
        $('#search-error').hide();
        fetchFilteredProducts();
    });

    // Handle form submission for fetching filtered products
    $('#filter-form').submit(function(event) {
        event.preventDefault();
        fetchFilteredProducts();// Fetch products based on current filter settings
    });

     // Function to fetch products based on current filters and pagination
    function fetchFilteredProducts(page = 1) {
        const searchQuery = $('#search-input').val();
        const maxPrice = $('#priceRange').val();
        const selectedCategories = [];
        $('input.category-checkbox:checked').each(function() {
            selectedCategories.push($(this).val());
        });

        const sortOption = $('input[name="sort"]:checked').val();
        const categoryId = $('#category-id').val(); 

        $.ajax({
            url: `/productList/${categoryId}`, 
            type: 'GET',
            data: {
                search: searchQuery,
                maxPrice: maxPrice,
                selectedCategories: selectedCategories,
                sort: sortOption,
                page: page,
                categoryId: categoryId 
            },
            success: function(response) {
                // Handle successful response
                if (response.products.length > 0) {
                    $('#search-error').hide();
                    renderProducts(response.products);
                    updatePagination(response.currentPage, response.totalPages, response.filters);
                } else {
                    // Display error message if no products found
                    $('#search-error').show();
                    $('#product-list').html('');
                    updatePagination(1, 1, {});
                }
                // Log selected categories and max price
                console.log('Selected Categories Names:', response.selectedCategoriesNames);
                console.log('Max Price:', response.maxPrice);

            // Update selected categories and max price
            updateSelectedFilters(response.selectedCategoriesNames, response.maxPrice);
            },
            error: function() {
                $('#search-error').show();
            }
        });
    }

    // Function to update selected category filters and max price in UI
    function updateSelectedFilters(selectedCategoriesNames, maxPrice) {
        if (selectedCategoriesNames.length > 0) {
            // Display selected categories
            let categoriesHtml = '<div class="selected-categories" style="display: block;"><strong>Selected Categories:</strong>';
            selectedCategoriesNames.forEach(category => {
                categoriesHtml += `<span class="selected-category-label">${category.name}<strong> / </strong></span>`;
            });
            categoriesHtml += '</div>';
            $('.selected-categories').html(categoriesHtml).show();
        } else {
            $('.selected-categories').hide();
        }
    
        // Update max price
        if (maxPrice) {
            const maxPriceHtml = `<div class="selected-max-price" style="display: block;"><strong>Selected Max Price:</strong><span class="selected-max-price-label">Rs${maxPrice}</span></div>`;
            $('.selected-max-price').html(maxPriceHtml).show();
        } else {
            $('.selected-max-price').hide();
        }
    }

    // Function to render products in UI based on fetched data
    function renderProducts(products) {
        const productContainer = $('#product-list');
        productContainer.empty();

        products.forEach(product => {
            // Generate HTML for each product card
            const productHtml = `
                <div class="col-md-4">
                    <hr>
                    <a class="prod_card" href="/productPlus/${product._id}" class="product-link">
                        <div class="profile-card-2">
                            <img src="/${product.images[0]}" alt="${product.title}" loading="lazy" class="img img-responsive">
                            <div class="profile-name">${product.name}</div>
                            <div class="profile-username"><div class="price">
                                ${product.finalPrice ? `
                                    Rs.${product.finalPrice}
                                    <span class="original-price text-muted" style="text-decoration: line-through;">Rs.${product.price}</span>
                                ` : `
                                    Rs.${product.price}
                                `}
                            </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            productContainer.append(productHtml);// Append product HTML to container
        });
    }

    // Function to update pagination links based on current page and total pages
    function updatePagination(currentPage, totalPages, filters) {
        const paginationSummary = $('.pagination-summary');
        const paginationLinks = $('.pagination-links');

        paginationSummary.text(`Page ${currentPage} of ${totalPages}`);
        paginationLinks.empty();

        const filterParams = $.param(filters);

        // Add previous page link if current page is greater than 1
        if (currentPage > 1) {
            paginationLinks.append(`<a href="#" class="pagination-link text-primary" data-page="${currentPage - 1}" data-filters="${filterParams}">Previous</a>`);
        }

        // Add pagination links for each page
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationLinks.append(`<a href="#" class="pagination-link text-primary ${activeClass}" data-page="${i}" data-filters="${filterParams}">${i}</a>`);
        }

        // Add next page link if current page is less than total pages
        if (currentPage < totalPages) {
            paginationLinks.append(`<a href="#" class="pagination-link text-primary" data-page="${currentPage + 1}" data-filters="${filterParams}">Next</a>`);
        }

        // Handle click event for pagination links
        $('.pagination-link').click(function (event) {
            event.preventDefault();
            const page = $(this).data('page');
            fetchFilteredProducts(page);// Fetch products for clicked page
        });
    }

    // Fetch initial products on page load
    fetchFilteredProducts();
});
