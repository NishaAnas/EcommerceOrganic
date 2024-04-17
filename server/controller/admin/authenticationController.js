const user = require('../modals/user')
const category = require('../modals/categories')
const product = require('../modals/product')
const admin = require ('../modals/admin')
const { upload, resizeImages } = require('../config/multer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');

//GET Admin Login
exports.getAdminLogin = (req,res)=>{
    res.render('admin/Authentication/adminLogin',{success: req.flash('success'),error: req.flash('error')});
}

//POST Admin Login
exports.postAdminLogin = async(req,res)=>{
    console.log("entered routes For Login POST")

    try {
    const { email, password } = req.body;
    const existingAdmin = await admin.findOne({ email });
    if (!existingAdmin) {
        req.flash('error', 'Invalid email or password');
        return res.redirect(`/admin/adminlogin`);
    }

       // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, existingAdmin.hashedPassword);
       // If passwords don't match, render login page with error message
    if (!passwordMatch) {
        req.flash('error', 'Invalid email or password');
        return res.redirect(`/admin/adminlogin`);
    }else{
        console.log('Admin found');
        req.session.adminloggedIn = true;
        req.session.email = email;
        req.session.adminId = existingAdmin._id;
        req.flash('success', 'Login Successful');
        }
        return res.redirect(`/admin?email=${email}`);
    } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'Server Error Occurred During Login');
    res.redirect(`/admin/adminlogin`);
    }
}

//GET Admin SignUp
exports.getAdminSignup = (req,res)=>{
    res.render('admin/Authentication/adminsignup',{success: req.flash('success'),error: req.flash('error')});
}

//POST Admin SignUp
exports.postAdminSignup = async(req,res)=>{
try{
    // Destructure request body
const {email, password, conformpassword} = req.body;
console.log(`${email} ${password} ${conformpassword}`)

// Validate password and confirmation
if (password !== conformpassword) {
    console.log('password does not match');
    req.flash('error', 'Password does not match');
    return res.redirect(`/admin/adminsignup`);
    }

 // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

 // Check if the email already exists
    const existingAdmin = await admin.findOne({ email });
    if (existingAdmin) {
        req.flash('error', 'Email already exist'); 
    return res.redirect(`/admin/adminsignup`);
    }

 // Create new Admin
    const newAdmin = new admin({
    email,
    hashedPassword: hashedPassword,
    });

 // Save Admin to database
    await admin.create(newAdmin);
    req.flash('success', 'Admin Registered Successfully');
    res.redirect(`/admin/adminlogin/?success=Admin Registered Successfully`);
} catch (error) {
    console.error('Error During Registering:', error);
    req.flash('error', 'Server error occurred Registration');
    res.redirect(`/admin/adminsignup`);
    }
}

exports.getadminLogout = (req,res)=>{
    req.session.destroy((err)=>{
        if (err) {
            console.error('Error in destroying the session:', err);
         }
         req.flash('success', 'Logout Successfully');
         res.redirect('/admin/adminlogin');
    })
}


//GET Admin Dashboard
exports.getAdminhomePage = (req, res) => {
    try {
        if ( req.session.adminloggedIn) {
            const email = req.query.email;
            const successMessage = req.flash('success');
            const errorMessage = req.flash('error');
            res.render('admin/Authentication/dashboard', { layout: 'adminlayout',email: email,successMessage: successMessage, errorMessage: errorMessage });
        } else {
            req.flash('error', 'Please login to access the admin dashboard');
            res.redirect('/adminlogin');
        }
        } catch (error) {
            req.flash('error', 'Server Error Occured During Login');
        console.error(error);
        } 
}