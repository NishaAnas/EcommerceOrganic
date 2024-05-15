document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sortOptions = document.querySelectorAll('.sort-option');

    searchButton.addEventListener('click', function (e) {
        e.preventDefault();
        const searchQuery = searchInput.value.trim().replace(/\s+/g, ' ').toLowerCase();
        const url = new URL(window.location.href);
        if (searchQuery) {
            url.searchParams.set('search', searchQuery);
        } else {
            url.searchParams.delete('search');
        }
        window.location.href = url.toString();
    });

    sortOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            const sort = this.getAttribute('data-sort');
            const url = new URL(window.location.href);
            if (sort) {
                url.searchParams.set('sort', sort);
            } else {
                url.searchParams.delete('sort');
            }
            window.location.href = url.toString();
        });
    });
});