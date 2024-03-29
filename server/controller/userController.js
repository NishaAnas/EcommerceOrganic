const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const user = require('../modals/user');
const category = require('../modals/categories');
const product = require('../modals/product')
const passport = require('passport');
const nodemailer = require("nodemailer");
const crypto = require('crypto')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhonenumber = process.env.TWILIO_PHONE_NUMBER



const twilioClient = new twilio(accountSid, authToken)


//GET User Home Page
exports.userHome = async(req, res) => {
   try {
      const categories = await category.find({}).lean();
      if (req.session.loggedIn) {
         res.render('index', { loggedIn: req.session.loggedIn, categories });
      } else {
         res.redirect('/login');
      }
   } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
   }
}



//SuccessLOGIN using Google Authentication
const successGoogleLogin = (req, res) => {
   if (!req.user)
      res.redirect('/failure');
   console.log(req.user);
   res.send("Welcome " + req.user.email);
}

const failureGoogleLogin = (req, res) => {
   res.send("Error");
}

//GET Login Page
exports.login = (req, res) => {
   console.log('login page loaded')
   console.log(process.env.GOOGLE_CLIENT_ID)
   res.render('login', { googleClientId: process.env.GOOGLE_CLIENT_ID });
}


//GET Signup Page
exports.signup = (req, res) => {
   res.render('signup');
}

//POST Signup Page
exports.postSignup = async (req, res) => {

   // Destructure request body
   const { firstName, lastName, userName, email, password, conformPassword, phoneNumber } = req.body;
   console.log(`${firstName} ${lastName} ${userName} ${email} ${password}  ${conformPassword} ${phoneNumber}`)

   // Validate password and confirmation
   if (!password == conformPassword) {
      console.log('password does not match')
      return res.render('signup', { error: 'Passwords do not match.' });
   }
   try {
      // Generate OTP
      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if the user already exists
      const existingUser = await user.findOne({ $or: [{ userName }, { email }] });
      if (existingUser) {
         return res.render('signup', { error: 'Username or email already exists.' });
      }

      // Save signup data to session
      req.session.signupData = {
         firstName,
         lastName,
         userName,
         email,
         password: hashedPassword,
         phoneNumber,
         otp
      };

      console.log(req.session.signupData)
      // Send OTP via SMS
      await sendOTPViaSMS(phoneNumber, otp);

      // Send OTP via email
      await sendOTPViaEmail(email, otp);

      // Render OTP verification page
      res.render('otp-verification', { email, phoneNumber });

   } catch (error) {
      console.error('Error during signup:', error);
      res.render('signup', { error: 'An error occurred during registration.' });
   }
}

//GET OTP-Verification Page
exports.otpverify = (req, res) => {
   res.render('otp-verification');
}

//POST verify OTP
exports.postVerifyotp = async (req, res) => {
   try {
      const otpEntered = req.body.otp;
      const { firstName, lastName, userName, email, password, phoneNumber, otp } = req.session.signupData;

      console.log(req.session.signupData)

      if (otpEntered !== otp) {
         return res.render('otp-verification', { error: 'OTP mismatch. Please enter the correct OTP.' });
      }

      // Create new user
      const newUser = new user({
         firstName,
         lastName,
         userName,
         email,
         hashedPassword: password,
         phoneNumber,
         addresses: [],
         walletId: null,
         wishlist: [],
      });

      // Save user to database
      await user.create(newUser);

      // Send confirmation email
      await sendConfirmationEmail(email);

      // Redirect to login page
      res.render('login', { success: 'user Registered Successfully' });

   } catch (error) {
      console.error('Error during OTP verification:', error);
      res.render('signup', { error: 'An error occurred during OTP verification.' });
   }
}

// Function to send OTP via SMS
async function sendOTPViaSMS(phoneNumber, otp) {
   const phoneNumberWithCountryCode = '+91' + phoneNumber;

   await twilioClient.messages.create({
      body: `Your OTP for Registering to Organic Account is ${otp}. Enter this to register your account.`,
      to: phoneNumberWithCountryCode,
      from: twilioPhonenumber
   });
}

// Function to send OTP via email
async function sendOTPViaEmail(email, otp) {
   const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
         user: process.env.USER,
         pass: process.env.PASS,
      },
   });

   const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'OTP for Registering to Organic Account',
      text: `Your OTP for Registering to Organic Account is ${otp}. Enter this to register your account.`
   };

   await transporter.sendMail(mailOptions);
}

// Function to send confirmation email
async function sendConfirmationEmail(email) {
   const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
         user: process.env.USER,
         pass: process.env.PASS,
      },
   });

   const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Registration Successful',
      text: 'Your registration to Organic Account was successful.',
   };

   await transporter.sendMail(mailOptions);
}


//POST Login Page
exports.postLogin = async (req, res) => {
   console.log("entered routes For Login POST")
   console.log(req.body)
   try {
      const { email, password } = req.body;

      const existingUser = await user.findOne({ email });

      if (!existingUser) {
         return res.render('login', { error: 'Invalid email or password.' });
      }

      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, existingUser.hashedPassword);

      // If passwords don't match, render login page with error message
      if (!passwordMatch) {
         return res.render('login', { error: 'Invalid email or password.' });
      }

      req.session.loggedIn = true;
      req.session.email = email;
      req.session.userId = existingUser._id;
      req.session.firstName = existingUser.firstName;
      req.session.lastName = existingUser.lastName;
      req.session.phoneNumber = existingUser.phoneNumber;
      req.session.isAdmin = email === 'admin123@gmail.com';

      console.log('User found');
      console.log('FirstName:', req.session.firstName);
      console.log('LastName:', req.session.lastName);
      console.log('phoneNumber:', req.session.phoneNumber);
      console.log('userId:', req.session.userId);
      console.log('email:', req.session.email);
      console.log('isAdmin:', req.session.isAdmin);

      // Redirect based on user role
      if (req.session.isAdmin) {
         return res.redirect(`/admin?email=${email}`);
      } else {
         return res.redirect(`/?email=${email}`);
      }
   } catch (error) {
      console.error('Error during login:', error);
      res.render('login', { error: 'An error occurred during Login.' });
   }
}


//GET Forgot Password Page
exports.forgotPassword = (req, res) => {
   res.render('forgotPassword');
}

//POST Forgot Password page
exports.postForgotPassword = async (req, res) => {

   const email = req.body.email;

   try {
      // Check if the email exists in the database
      const User = await user.findOne({ email });

      if (!User) {
         return res.render('forgotPassword', { error: 'Email not found' });
      }

      // Generate a unique reset password token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Save the reset token and its expiration time in the user document
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await user.create(User);

      // Send an email with the reset password link
      const resetPasswordLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
      await sendResetPasswordEmail(email, resetPasswordLink);

      res.render('login', { success: 'Reset password link sent to your email' });
   } catch (error) {
      console.error('Error sending reset password email:', error);
      res.render('forgotPassword', { error: 'Error sending reset password email' });
   }

}

async function sendResetPasswordEmail(email, resetPasswordLink) {
   try {
      const transporter = nodemailer.createTransport({
         service: process.env.SERVICE,
         auth: {
            user: process.env.USER,
            pass: process.env.PASS,
         }
      });

      const mailOptions = {
         from: process.env.USER,
         to: email,
         subject: 'Reset Your Password',
         html: `<p>Hello,</p>
                  <p>Please click on the following link to reset your password:</p>
                  <p><a href="${resetPasswordLink}">${resetPasswordLink}</a></p>
                  <p>If you didn't request this, please ignore this email.</p>`
      };

      await transporter.sendMail(mailOptions);
      console.log('Reset password email sent successfully');
   } catch (error) {
      console.error('Error sending reset password email:', error);
      throw new Error('Error sending reset password email');
   }
}

//GET Reset Password Page
exports.resetPassword = (req, res) => {
   res.render('resetPassword');
}

//POST Reset Password page
exports.postResetPassword = async (req, res) => {
   const { token, newPassword, confirmPassword } = req.body;

   try {
      // Find the user with the reset password token
      const user = await user.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

      if (!user) {
         return res.render('resetPassword', { error: 'Invalid or expired token' });
      }

      // Update the user's password
      user.password = newPassword;
      // Clear the reset password token and its expiration time
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.create(user)

      res.render('login', { success: 'Password reset successful' });
   } catch (error) {
      console.error('Error resetting password:', error);
      res.render('resetPassword', { error: 'Error resetting password' });
   }
}


//GET Logout Page
exports.getLogout = (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         console.error('Error in destroying the session:', err);
      }
      res.redirect('/login');
   });
}


//GET Product Listing Page
exports.productListing = async(req,res)=>{
   try {
      const categoryId = req.query.categoryId;
      if (!categoryId) {
          return res.status(400).send('Category ID is required');
      }
      const products = await product.find({ categoryId }).lean();
      const Category = await category.find({categoryId}).lean();
      console.log(products)
      console.log(Category)
      res.render('user/productListing', { products,Category });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
}

//GET Product Details Page
exports.productDetails = async(req,res)=>{
   try {
      const productId = req.params.productId;
      const productDetails = await product.findById(productId).lean();
      const relatedProducts = await product.find({ categoryId: productDetails.categoryId }).limit(4).lean();

      // Dummy data for stock, rating, and reviews
      const stock = 10;
      const rating = 4.5;
      const reviews = [
         { user: 'User1', comment: 'Great product!' },
         { user: 'User2', comment: 'Highly recommended.' }
      ];
      res.render('user/productDetails', { productDetails, stock, rating, reviews, relatedProducts });
   } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
   }
}

