$(document).ready(function() {
    const productId = $('#product-id').val();// Get the product ID from the hidden input
    let currentPage = $('#current-page').val();// Initialize current page from the hidden input


    // Sorting functionality
    $('.sort-option').click(function(e) {
        e.preventDefault();
        const sortType = $(this).data('sort');// Get the sort type from data attribute
        fetchProducts({ sort: sortType });// Fetch products with sorting applied
    });

    // Searching functionality
    $('#search-button').click(function(e) {
        e.preventDefault();
        const searchQuery = $('#search-input').val();// Get the search query from input field
        fetchProducts({ search: searchQuery });
    });

    function fetchProducts(filters = {}) {
        filters.page = currentPage;// Include current page in filters

        // AJAX request to fetch products
        $.ajax({
            url: `/productPlus/${productId}`,
            type: 'GET',
            data: filters,// Filters include sort type, search query, and current page
            success: function(response) {
                updateProductList(response.productList);// Update product list based on response
                updatePagination(response.currentPage, response.totalPages);// Update pagination links
            },
            error: function(err) {
                console.error('Error fetching products:', err);
            }
        });
    }

    // Function to update the product list in the UI
    function updateProductList(productList) {
        const productContainer = $('#product-list');
        productContainer.empty();

        // Iterate through fetched products and generate HTML for each product card
        productList.forEach(product => {
            const productCard = `
                <div class="col-md-4">
                    <hr>
                    <a class="prod_card" href="/productDetails/${product._id}" class="product-link">
                        <div class="profile-card-2">
                            <img src="/${product.images[0]}" alt="${product.attributeName}" loading="lazy" class="img img-responsive">
                            <div class="profile-name">${product.attributeValue}</div>
                            <div class="profile-username">Buy At: ${product.price}</div>
                        </div>
                    </a>
                </div>
            `;
            productContainer.append(productCard);
        });
    }

    // Function to update pagination links in the UI
    function updatePagination(currentPage, totalPages) {
        const paginationSummary = $('.pagination-summary');
        const paginationLinks = $('.pagination-links');
        
        paginationSummary.html(`Page ${currentPage} of ${totalPages}`);
        
        let paginationHtml = '';
        
        if (currentPage > 1) {
            paginationHtml += `<a href="#" class="pagination-link text-primary" data-page="${currentPage - 1}">Previous</a>`;
        }

        if (currentPage < totalPages) {
            paginationHtml += `<a href="#" class="pagination-link text-primary" data-page="${currentPage + 1}">Next</a>`;
        }

        paginationLinks.html(paginationHtml);

        // Update the current page input
        $('#current-page').val(currentPage);
    }

    // Event delegation for pagination links (since pagination links are dynamically added)
    $(document).on('click', '.pagination-link', function(e) {
        e.preventDefault();
        currentPage = $(this).data('page');
        fetchProducts();
    });
});
