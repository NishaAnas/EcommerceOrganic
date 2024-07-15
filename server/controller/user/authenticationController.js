const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const user = require('../../modals/user.js')
const category = require('../../modals/categories.js');
const Order = require('../../modals/order.js');
const productVariation = require('../../modals/productVariation.js');
const nodemailer = require("nodemailer");
const crypto = require('crypto')

//Details for twilio app
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhonenumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = new twilio(accountSid, authToken)

//function for finding best selling products
const getBestSellingProducts = async () => {
   const bestSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      { 
         $group: {
               _id: "$items.productId",
               totalQuantity: { $sum: "$items.quantity" }
         }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 }
   ]);
   return bestSellingProducts;
};

//function to find the product deatils
const getProductDetails = async (productIds) => {
   const products = await productVariation.find({
      _id: { $in: productIds }
   }).lean();
   return products;
};


//GET User Home Page
exports.userHome = async (req, res) => {
   try {
      if (req.session.userLoggedInData) {
         const successMessage = req.flash('Successfully Logged In');
         const userData = req.session.userLoggedInData;
         const categories = await category.find({}).lean();
         const bestSellingProducts = await getBestSellingProducts();
         const productIds = bestSellingProducts.map(item => item._id);
         const products = await getProductDetails(productIds);
         res.render('user/Authentication/index', { userData, categories, products, success: successMessage });
      }else{
         
         const categories = await category.find({}).lean();
         const bestSellingProducts = await getBestSellingProducts();
         const productIds = bestSellingProducts.map(item => item._id);
         const products = await getProductDetails(productIds);
         res.render('user/Authentication/index',{categories,products});
      }
   } catch (error) {
      req.flash('error', 'Server Error');
      console.error(error);
         res.redirect('/login');
         
      }
}

//GET Login Page
exports.login = (req, res) => {
   const error = req.flash('error');
   const success = req.flash('success');
   if (!req.session.userLoggedInData){
   res.render('user/Authentication/login', { success, error, layout:'athenticationlayout' });
}else{
   res.render('user/Authentication/login' , { success, error, layout:'athenticationlayout'});
}
}

//GET Signup Page
exports.signup = (req, res) => {
   const error = req.flash('error');
   res.render('user/Authentication/signup', { error , layout:'athenticationlayout'});
}


//POST Signup Page
exports.postSignup = async (req, res) => {

   // Destructure request body
   const { userName, email, password, conformPassword, phoneNumber } = req.body;

   // Validate password and confirmation
   if (!password == conformPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/signup');
   }
   try {
      // Generate OTP
      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if the user already exists
      const existingUser = await user.findOne({ $or: [{ userName }, { email }] });
      if (existingUser) {
         req.flash('error', 'Email already exists.');
         return res.redirect('/signup');
      }
      // Save signup data to session
      req.session.signupData = {
         userName,
         email,
         password: hashedPassword,
         phoneNumber,
         otp
      };
      // Send OTP via SMS
      await sendOTPViaSMS(phoneNumber, otp);
      // Send OTP via email
      await sendOTPViaEmail(email, otp);
      // Render OTP verification page
      res.render('user/Authentication/otp-verification', { email, phoneNumber , layout:'athenticationlayout' });
   } catch (error) {
      console.error('Error during signup:', error);
      req.flash('error', 'Server Error');
      res.redirect('/signup');
   }
}

//GET OTP-Verification Page
exports.otpverify = (req, res) => {
   const success = req.flash('success')
   const error = req.flash('error');
   res.render('user/Authentication/otp-verification', { error, success , layout:'athenticationlayout'});
}

//POST verify OTP
exports.postVerifyotp = async (req, res) => {
   try {
      const otpEntered = req.body.otp;
      const { userName, email, password, phoneNumber, otp } = req.session.signupData;

      if (otpEntered !== otp) {
         req.flash('error', 'OTP mismatch. Please enter the correct OTP.');
         return res.redirect('/otp-verification');
      }

      // Create new user
      const newUser = new user({
         userName,
         email,
         hashedPassword: password,
         phoneNumber,
         addresses: [],
         walletId: null,
         wishlist: null,
      });

      // Save user to database
      await user.create(newUser);

      // Send confirmation email
      await sendConfirmationEmail(email);

      req.flash('success', 'User registered successfully.');
      setTimeout(() => {
         res.redirect('/login');
      }, 3000);

   } catch (error) {
      console.error('Error during OTP verification:', error);
      req.flash('error', 'Server Error');
      res.redirect('/signup');
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
   try {
      const { email, password } = req.body;
      const existingUser = await user.findOne({ email });

      if (!existingUser) {
         req.flash('error', 'Invalid email or password.');
         return res.redirect('/login');
      }
      //Check if the user is blocked
      if (existingUser.isBlocked) {
         req.flash('error', 'This emailId is blocked.');
         return res.redirect('/login');
      }
      
      if(!existingUser.hashedPassword){
         if (existingUser.googleId) {
            req.flash('error', 'You have registered with Google. Please log in with Google.');
            return res.redirect('/login');
         }
   
         if (existingUser.facebookId) {
            req.flash('error', 'You have registered with Facebook. Please log in with Facebook.');
            return res.redirect('/login');
         }
      }
      
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, existingUser.hashedPassword);

      // If passwords don't match, render login page with error message
      if (!passwordMatch) {
         req.flash('error', 'Invalid email or password.');
         return res.redirect('/login');
      } else {
         req.session.userLoggedInData = {
            userloggedIn: true,
            email: email,
            userId: existingUser._id,
            userName: existingUser.userName,
            phoneNumber: existingUser.phoneNumber
         };
         req.flash('success', 'Successfully logged in.');
         //check for Cart Redirection
         const return_url = req.session.returnTo;
         if(return_url){
            const variantId = req.session.variantId
            delete req.session.variantId;
            res.redirect(`/productDetails/${variantId}`)
         }else{
            return res.redirect(`/`);
         }
      }
   } catch (error) {
      console.error('Error during login:', error);
      req.flash('error', 'Server Error');
      res.redirect('/login');
   }
}



//GET Forgot Password Page
exports.forgotPassword = (req, res) => {
   res.render('user/Authentication/forgotPassword',{layout:'athenticationlayout'});
}

//POST Forgot Password page
exports.postForgotPassword = async (req, res) => {
   const email = req.body.email;

   try {
      // Check if the email exists in the database
      const User = await user.findOne({ email });
      if (!User) {
         req.flash('error', 'Email not found');
         return res.redirect('/forgotPassword');
      }
      req.session.email =email;
      const UserId = User._id;
      // Generate a unique reset password token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const expirytime = Date.now() + 3600000; // Token expires in 1 hour
       // Save the reset token and its expiration time in the user document
      await user.updateOne({_id:UserId},{$set:{resetPasswordToken:resetToken,resetPasswordExpires:expirytime}})

      // Send an email with the reset password link
      const resetPasswordLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
      await sendResetPasswordEmail(email, resetPasswordLink);

      req.flash('success', 'Reset password link sent to your email');
      res.redirect('/login');
   } catch (error) {
      console.error('Error sending reset password email:', error);
      req.flash('error', 'Server Error');
      res.redirect('/forgotPassword');
   }

}

//Function to send rest password to mail
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
   } catch (error) {
      console.error('Error sending reset password email:', error);
      throw new Error('Error sending reset password email');
   }
}

//GET Reset Password Page
exports.resetPassword = (req, res) => {
   const error = req.flash('error');
   const success = req.flash('success');

   const emailId = req.session.emailId;
   req.session.resetToken = req.query.token;
   res.render('user/Authentication/resetPassword' , {email : emailId , layout:'athenticationlayout',success, error});
}

//POST Reset Password page
exports.postResetPassword = async (req, res) => {
   const  newPassword = req.body.password;
   const token = req.session.resetToken; 
   try {
      // Find the user with the reset password token
      const existingUser = await user.findOne({ resetPasswordToken: token });
      if (!existingUser) {
         req.flash('error', 'Invalid or expired token');
         return res.redirect('/resetPassword');
      }

      // Hash password
      const newhashedPassword = await bcrypt.hash(newPassword, 10);
      await user.updateOne({_id:existingUser._id},{$set:{hashedPassword:newhashedPassword,resetPasswordToken:undefined,resetPasswordExpires:undefined}})
      //console.log('Password reset successful')
      req.flash('success', 'Password reset successful');
      res.redirect('/login');
   } catch (error) {
      console.error('Error resetting password:', error);
      req.flash('error', 'Server Error');
      res.redirect('/resetPassword');
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


//Google Success Login
exports.successGoogleLogin = (req, res) => {
   if (!req.user) {
      req.flash('error', 'Login with Google Unsuccessful');
      res.redirect('/login');
   }
   try {
      // Set session variables
      req.session.userLoggedInData = {
         userloggedIn: true,
         email: req.user.email,
         userId: req.user._id,
         userName: req.user.userName,
         phoneNumber: req.user.phoneNumber
      };

      req.flash('success', 'Login with Google Successful');
      res.redirect('/');
   } catch (error) {
      console.error('Error during Google login:', error);
      req.flash('error', 'Server Error');
      res.redirect('/login');
   }
}

//Failure Google Auth
exports.failureGoogleLogin = (req, res) => {
   req.flash('error', 'Login with Google Unsuccessful');
   // res.render('user/Authentication/login' , {layout:'athenticationlayout'});
   res.redirect('/login');
}

//Facebook Success Login
exports.successFacebookLogin = (req, res) => {
   if (!req.user) {
      req.flash('error', 'Login with Facebook Unsuccessful');
      res.redirect('/login');
   }
   try {
      // Set session variables
      req.session.userLoggedInData = {
         userloggedIn: true,
         email: req.user.email,
         userId: req.user._id,
         userName: req.user.userName,
      };

      req.flash('success', 'Login with Facebook Successful');
      res.redirect('/');
   } catch (error) {
      console.error('Error during Facebook login:', error);
      req.flash('error', 'Server Error');
      res.redirect('/login');
   }
}

// //Failure Facebook Auth
exports.failureFacebookLogin = (req, res) => {
   req.flash('error', 'Login with Facebook Unsuccessful');
   res.redirect('/login');
}