function changeImage(element) {

    var main_prodcut_image = document.getElementById('main_product_image');
    main_prodcut_image.src = element.src;
    

}

productDetails.stars = Array.from({ length: productDetails.rating });
dummyRatingStars = Array.from({ length: Math.floor(dummyRating) });
isHalfStar = Math.ceil(dummyRating) > Math.floor(dummyRating);