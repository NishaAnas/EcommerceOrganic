setTimeout(() => {
    const flashMessage = document.getElementById('flashMessage');
    if (flashMessage) {
       flashMessage.style.transition = 'opacity 1s ease';
       flashMessage.style.opacity = '0';
       setTimeout(() => {
          flashMessage.remove();
       }, 1000);
    }
 }, 3000);