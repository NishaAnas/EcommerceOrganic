const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('../../modals/user');
const category = require('../../modals/categories');
const Product = require('../../modals/product');
const prodVariation =require('../../modals/productVariation');
const shoppingCart = require('../../modals/shoppingCart');
const crypto = require('crypto');


//show Profile Details Page
exports.getProfilePage = async(req,res)=>{
    res.render('user/Account/profileDetails');
}