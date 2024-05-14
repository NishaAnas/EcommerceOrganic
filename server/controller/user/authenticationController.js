const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const user = require('../../modals/user.js')
const category = require('../../modals/categories.js');
//const product = require('../modals/product')
//const passport = require('passport');
const nodemailer = require("nodemailer");
const crypto = require('crypto')



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhonenumber = process.env.TWILIO_PHONE_NUMBER


const twilioClient = new twilio(accountSid, authToken)


//GET User Home Page
exports.userHome = async (req, res) => {
   try {
      //console.log(req.session.userLoggedInData);
      if (req.session.userLoggedInData) {
         const successMessage = req.flash('Successfully Logged In');
         const userData = req.session.userLoggedInData;
         const categories = await category.find({}).lean();
         res.render('user/Authentication/index', { userData, categories, success: successMessage });
      }else{
         
         const categories = await category.find({}).lean();
         res.render('user/Authentication/index',{categories});
      }
   } catch (error) {
      req.flash('error', 'Server Error');
      console.error(error);
         res.redirect('/login');
         
      }
}


//GET Login Page
exports.login = (req, res) => {
   console.log('login page loaded')
   const error = req.flash('error');
   const success = req.flash('success');
   if (!req.session.userLoggedInData){
   res.render('user/Authentication/login', { success, error, layout:'athenticationlayout' });
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
   //console.log(` ${userName} ${email} ${password}  ${conformPassword} ${phoneNumber}`)

   // Validate password and confirmation
   if (!password == conformPassword) {
      console.log('password does not match')
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
      console.log(req.session.signupData)
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

      //console.log(req.session.signupData)

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
         wishlist: [],
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
   console.log("entered routes For Login POST")
   console.log(req.body)
   try {
      const { email, password } = req.body;
      const existingUser = await user.findOne({ email });

      if (!existingUser) {
         req.flash('error', 'Invalid email or password.');
         res.redirect('/login');
      }
      //Check if the user is blocked
      if (existingUser.isBlocked) {
         req.flash('error', 'This emailId is blocked. Please contact the administrator for assistance.');
         return res.redirect('/login');
      }
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, existingUser.hashedPassword);

      // If passwords don't match, render login page with error message
      if (!passwordMatch) {
         req.flash('error', 'Invalid email or password.');
         return res.redirect('/login');
      } else {
         console.log('User found');
         req.session.userLoggedInData = {
            userloggedIn: true,
            email: email,
            userId: existingUser._id,
            userName: existingUser.userName,
            phoneNumber: existingUser.phoneNumber
         };
         //console.log(req.session.userLoggedInData)
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
      req.session.emailId =email;
      // Generate a unique reset password token
      const resetToken = crypto.randomBytes(20).toString('hex');
      // Save the reset token and its expiration time in the user document
      //user.resetPasswordToken = resetToken;
      const expirytime = Date.now() + 3600000; // Token expires in 1 hour
      //user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await user.updateOne({_id:User._id},{$set:{resetPasswordToken:resetToken,resetPasswordExpires:expirytime}})
      //await user.create(User);
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
   const error = req.flash('error');
   const success = req.flash('success');

   const emailId = req.session.emailId;
   res.render('user/Authentication/resetPassword' , {email : emailId , layout:'athenticationlayout',success, error});
}

//POST Reset Password page
exports.postResetPassword = async (req, res) => {
   const  newPassword = req.body.password;
   const token = req.query.token; 
   console.log(req.body)
   console.log(token)

   try {
      // Find the user with the reset password token
      const existingUser = await user.findOne({ resetPasswordToken: token });
      if (!existingUser) {
         console.log('Invalid or expired token')
         req.flash('error', 'Invalid or expired token');
         return res.redirect('/resetPassword');
      }

      // Hash password
      const newhashedPassword = await bcrypt.hash(newPassword, 10);
       
      console.log(newhashedPassword)
      
      await user.updateOne({_id:existingUser._id},{$set:{hashedPassword:newhashedPassword,resetPasswordToken:undefined,resetPasswordExpires:undefined}})
      console.log('Password reset successful')
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
   console.log(req.user);
   req.flash('success', 'Login with Google Successful');
   res.render('user/Authentication/index' );
}

//Failure Google Auth
exports.failureGoogleLogin = (req, res) => {
   req.flash('error', 'Login with Google Unsuccessful');
   res.render('user/Authentication/login' , {layout:'athenticationlayout'});
}

//Facebook Success Login
exports.successFacebookLogin = (req, res) => {
   console.log(req.user);
   req.flash('success', 'Login with Facebook Successful');
   res.render('user/Authentication/index', {layout:'athenticationlayout'} );
}

// //Failure Facebook Auth
exports.failureFacebookLogin = (req, res) => {
   req.flash('error', 'Login with Facebook Unsuccessful');
   res.render('user/Authentication/login', {layout:'athenticationlayout'});
}