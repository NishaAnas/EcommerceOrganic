const user = require('../modals/user')
const category = require('../modals/categories')
const product = require('../modals/product')
const admin = require ('../modals/admin')
const { upload, resizeImages } = require('../config/multer');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');

exports.getUserManagement = async(req,res) =>{
    try{
        const locals = {
            title: 'User Management',
            description: 'Organic'
        }
    
        const Users = await user.find({isBlocked: false}).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
            res.render('admin/user/userManagement',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        req.flash('error', 'Error occurred during user management');
        res.render('admin/user/userManagement', { layout: 'adminlayout', error: error });
    }
}

//GET Blocked User
exports.getBlockedUser = async(req,res)=>{
    try{
        const locals = {
            title: 'Blocke User',
            description: 'Organic'
        }
    
        const Users = await user.find({isBlocked: true}).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
            res.render('admin/user/blockedUser',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        req.flash('error', 'Error occurred during fetching blocked users');
        res.render('admin/user/blockedUser', { layout: 'adminlayout', error: error });
    }
}

// GET EDIT Users
exports.getEditUser = async(req,res)=>{
    const locals = {
        title: 'Edit User page',
        description: 'Organic'
    }
    try {
        const userDetailsViewing = await user.findOne({ _id: req.params._id }).lean();
        console.log(userDetailsViewing)
        res.render('admin/user/userEdit', { locals, userDetailsViewing, layout: 'adminlayout' });
    } catch (error) {
        console.log(error)
        req.flash('error', 'Error occurred while fetching user details for editing');
        res.redirect('/user/userManagement');
    }
}

//Put Edit User
exports.putEditUser = async(req,res)=>{
    console.log(req.body)
    try {
        await user.findByIdAndUpdate(req.params._id, {
            isBlocked:true
        })
        console.log('User updated Successfully');
        req.flash('success', 'User updated successfully');
        res.redirect(`/admin/user`);
    } catch (error) {
        console.log(error)
        req.flash('error', 'User Updation failed');
        res.redirect(`/admin/user`);
    }
}