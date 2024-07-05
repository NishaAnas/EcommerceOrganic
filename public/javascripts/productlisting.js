$(document).ready(function () {
    $('#price-range').on('input', function () {
        var value = $(this).val();
        $('#max-price-label').text(value);
    });

    $('#priceRange').on('input', function() {
        $('#priceValue').text($(this).val());
    });

    $('#reset-filters').click(function () {
        $('#search-input').val('');
        $('input[type="checkbox"]').prop('checked', false);
        $('#priceRange').val(1000);
        $('#priceValue').text(1000);
        $('#search-error').hide();
        fetchFilteredProducts();
    });

    $('.pagination-link').click(function (event) {
        event.preventDefault(); 
        const page = $(this).data('page');
        fetchFilteredProducts(page);
    });

    $('#filter-form').submit(function(event) {
        event.preventDefault();
        fetchFilteredProducts();
    });

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
                if (response.products.length > 0) {
                    $('#search-error').hide();
                    renderProducts(response.products);
                    updatePagination(response.currentPage, response.totalPages);
                } else {
                    $('#search-error').show();
                    $('#product-list').html('');
                    updatePagination(1, 1);
                }
            },
            error: function() {
                $('#search-error').show();
            }
        });
    }

    function renderProducts(products) {
        const productContainer = $('#product-list');
        productContainer.empty();

        products.forEach(product => {
            const productHtml = `
                <div class="col-md-4">
                    <hr>
                    <a class="prod_card" href="/productPlus/${product._id}" class="product-link">
                        <div class="profile-card-2">
                            <img src="/${product.images[0]}" alt="${product.title}" loading="lazy" class="img img-responsive">
                            <div class="profile-name">${product.name}</div>
                            <div class="profile-username"><div class="price">
                                ${product.discountedPrice ? `
                                    Rs.${product.discountedPrice}
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
            productContainer.append(productHtml);
        });
    }

    function updatePagination(currentPage, totalPages) {
        const paginationContainer = $('.pagination-container');
        const paginationSummary = $('.pagination-summary');
        const paginationLinks = $('.pagination-links');

        paginationSummary.text(`Page ${currentPage} of ${totalPages}`);
        paginationLinks.empty();

        if (currentPage > 1) {
            paginationLinks.append(`<a href="#" class="pagination-link text-primary" data-page="${currentPage - 1}">Previous</a>`);
        }

        if (currentPage < totalPages) {
            paginationLinks.append(`<a href="#" class="pagination-link text-primary" data-page="${currentPage + 1}">Next</a>`);
        }
    }

    // Fetch initial products on page load
    fetchFilteredProducts();
});
