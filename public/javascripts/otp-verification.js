function validateForm() {
    var otp = document.getElementById("otp").value;

    // Check if OTP is a 6-digit number
    if (!/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP");
      return false;
    }
    return true; // Proceed with form submission
  }
  document.addEventListener("DOMContentLoaded", function() {
    
    // Disable resend button initially
    document.getElementById('resendButton').disabled = true;

    // Set timer to 2 minutes (120 seconds)
    var timeLeft = 2 * 60; // 2 minutes in seconds

    // Function to update timer
    function updateTimer() {
        var minutes = Math.floor(timeLeft / 60);
        var seconds = timeLeft % 60;
        document.getElementById('timer').innerText = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    // Update timer every second
    var timer = setInterval(function() {
        timeLeft--;
        updateTimer();
        
        // If timer reaches 0, enable resend button and stop the timer
        if (timeLeft < 0) {
            clearInterval(timer);
            document.getElementById('resendButton').disabled = false; // Enable resend button
            document.getElementById('timer').innerText = '00:00'; // Reset timer display
        }
    }, 1000);

    // Resend OTP button click event
    document.getElementById('resendButton').addEventListener('click', function() {
        // Disable resend button
        this.disabled = true;
        
        // Refresh the page to resend OTP
        location.reload();
    });
});
