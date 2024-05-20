const user = require('../../modals/user');
const category = require('../../modals/categories');
const product = require('../../modals/product');
const admin = require ('../../modals/admin');
const order = require('../../modals/order');
const { upload, resizeImages } = require('../../config/multer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

//GET Order Management Page
exports.getOrdermanager = async(req,res)=>{
    try {

        const Orders = await order.find({})
            .populate('userId', 'email') 
            .populate('items.productId') 
            .lean();
        
            console.log(Orders);
        res.render('admin/order/orderManagement', { Orders, layout:'adminlayout' });
    } catch (error) {
        req.flash('error', 'Failed to load orders');
        res.redirect('/admin/adminlogin');
    }
};

exports.changeOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        await order.findByIdAndUpdate(orderId, { orderStatus: status });
        
        res.status(200).json({ message: 'Order status updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status.' });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        await order.findByIdAndUpdate(orderId, { orderStatus: 'Cancelled' });
        
        res.status(200).json({ message: 'Order cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel order.' });
    }
};
