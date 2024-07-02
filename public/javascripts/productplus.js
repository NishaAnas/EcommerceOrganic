$(document).ready(function() {
    const productId = $('#product-id').val();
    let currentPage = $('#current-page').val();

    // Sorting functionality
    $('.sort-option').click(function(e) {
        e.preventDefault();
        const sortType = $(this).data('sort');
        fetchProducts({ sort: sortType });
    });

    // Searching functionality
    $('#search-button').click(function(e) {
        e.preventDefault();
        const searchQuery = $('#search-input').val();
        fetchProducts({ search: searchQuery });
    });

    function fetchProducts(filters = {}) {
        filters.page = currentPage;

        $.ajax({
            url: `/productPlus/${productId}`,
            type: 'GET',
            data: filters,
            success: function(response) {
                updateProductList(response.productList);
                updatePagination(response.currentPage, response.totalPages);
            },
            error: function(err) {
                console.error('Error fetching products:', err);
            }
        });
    }

    function updateProductList(productList) {
        const productContainer = $('#product-list');
        productContainer.empty();

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

    // Event delegation for pagination links
    $(document).on('click', '.pagination-link', function(e) {
        e.preventDefault();
        currentPage = $(this).data('page');
        fetchProducts();
    });
});
