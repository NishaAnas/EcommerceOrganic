document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editprofileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');

    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        validateProfileForm();
    });

    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        validateChangePasswordForm();
    });

    function validateProfileForm() {
        let isValid = true;
        const uname = document.getElementById('fname');
        const email = document.getElementById('email');
        const mob = document.getElementById('mob');
        const username_error = document.getElementById('username_error');
        const email_error = document.getElementById('email_error');
        const phone_error = document.getElementById('phone_error');
        const form_error = document.getElementById('form_error');

        username_error.innerHTML = '';
        email_error.innerHTML = '';
        phone_error.innerHTML = '';
        form_error.innerHTML = '';

        const userNameValue = uname.value.trim();
        const emailValue = email.value.trim();
        const phoneNumberValue = mob.value.trim();

        if (userNameValue === '' || emailValue === '' || phoneNumberValue === '') {
            isValid = false;
            form_error.innerHTML = 'All fields are required. Please fill all the fields.';
        }

        // Validation for User Name
        const username_regex1 = /^[a-zA-Z]/;
        const username_regex2 = /^[a-zA-Z][a-zA-Z0-9_ ]{7,19}$/;
        if (userNameValue.length < 3 || userNameValue.length > 20) {
            isValid = false;
            username_error.innerHTML = 'Username must be between 3 to 20 characters long.';
        } else if (!username_regex1.test(userNameValue)) {
            isValid = false;
            username_error.innerHTML = 'Username must start with a letter.';
        } else if (!username_regex2.test(userNameValue)) {
            isValid = false;
            username_error.innerHTML = 'Username must start with a letter, contain only alphanumeric characters, underscores, and spaces, and be between 8 to 20 characters long';
        }

        // Validation for Email
        const email_regex = /^[a-z]{3,}@[a-z]+\.(com|in|org|net)$/;
        if (emailValue.length > 50 || emailValue.length < 8) {
            isValid = false;
            email_error.innerHTML = 'Enter a valid email address.';
        } else if (!email_regex.test(emailValue)) {
            isValid = false;
            email_error.innerHTML = 'Enter a valid Email Address.';
        }

        // Validation for Phone Number
        const phoneRegex = /^[1-9]\d{9}$/;
        if (phoneNumberValue.length < 10 || !phoneRegex.test(phoneNumberValue)) {
            isValid = false;
            phone_error.innerHTML = 'Enter a valid Phone number.';
        }

        if (isValid) {
            editProfileForm.submit();
        }
    }

    function validateChangePasswordForm() {
        let isValid = true;
        const oldPassword = document.getElementById('oldPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const old_error = document.getElementById('old_error');
        const new_error = document.getElementById('new_error');
        const confirm_error = document.getElementById('confirm_error');

        old_error.innerHTML = '';
        new_error.innerHTML = '';
        confirm_error.innerHTML = '';

        const oldPasswordValue = oldPassword.value.trim();
        const newPasswordValue = newPassword.value.trim();
        const confirmPasswordValue = confirmPassword.value.trim();

        if (oldPasswordValue === '' || newPasswordValue === '' || confirmPasswordValue === '') {
            isValid = false;
            old_error.innerHTML = 'All fields are required.';
        }

        // Validation for New Password
        const password_regex2 = /\d/; // Password must contain at least one number
        const password_regex3 = /[a-z]/; // Password must contain at least one lowercase letter
        const password_regex4 = /[^A-Za-z0-9]/; // Password must contain at least one special character
        const password_regex5 = /[A-Z]/; // Password must contain at least one uppercase letter

        if (newPasswordValue.length < 8) {
            isValid = false;
            new_error.innerHTML = 'Password must contain at least 8 characters.';
        } else if (!password_regex2.test(newPasswordValue)) {
            isValid = false;
            new_error.innerHTML = 'Password must contain at least one number.';
        } else if (!password_regex3.test(newPasswordValue)) {
            isValid = false;
            new_error.innerHTML = 'Password must contain at least one lowercase letter.';
        } else if (!password_regex4.test(newPasswordValue)) {
            isValid = false;
            new_error.innerHTML = 'Password must contain at least one special character.';
        } else if (!password_regex5.test(newPasswordValue)) {
            isValid = false;
            new_error.innerHTML = 'Password must contain at least one uppercase letter.';
        }

        // Validation for Confirm Password
        if (confirmPasswordValue.length < 8) {
            isValid = false;
            confirm_error.innerHTML = 'Password must contain at least 8 characters.';
        } else if (newPasswordValue !== confirmPasswordValue) {
            isValid = false;
            confirm_error.innerHTML = 'Passwords do not match.';
        }

        if (isValid) {
            changePasswordForm.submit();
        }
    }
});