$(document).ready(function () {
    // Event listener for price range input
    $('#priceRange').on('input', function () {
        $('#priceValue').text(this.value);
    });

    // Event listener for reset button
    $('#reset-filters').click(function () {
        $('#search-input').val('');
        $('input[type="checkbox"]').prop('checked', false);
        $('#priceRange').val(500);
        $('#priceValue').text(500);
    });

    // Event listener for form submission
    $('#filter-form').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        // Clear previously selected categories
        $('.selected-category').remove();

        // Add selected categories to the form
        $('.category-checkbox:checked').each(function() {
            const categoryId = $(this).val();
            $('<input>').attr({
                type: 'hidden',
                class: 'selected-category',
                name: 'selectedCategories[]',
                value: categoryId
            }).appendTo('#filter-form');
        });

        // Add selected sorting option to the form
        const selectedSortOption = $('#sortFilter input:checked').val();
        if (selectedSortOption) {
            $('<input>').attr({
                type: 'hidden',
                name: 'sort',
                value: selectedSortOption
            }).appendTo('#filter-form');
        }

        // Submit the form
        $(this).unbind('submit').submit();
    });

    // Event listener for search button
    $('#search-button').click(function (event) {
        event.preventDefault(); // Prevent default button click behavior

        const searchQuery = $('#search-input').val().trim().replace(/\s+/g, ' ').toLowerCase();
        const url = new URL(window.location.href);
        if (searchQuery) {
            url.searchParams.set('search', searchQuery);
        } else {
            url.searchParams.delete('search');
        }
        window.location.href = url.toString();
    });
});