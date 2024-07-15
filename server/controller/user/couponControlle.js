const mongoose = require('mongoose');
const coupon = require('../../modals/coupon');
const order = require('../../modals/order');

exports.getCoupons = async(req,res)=>{
    try{
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access cart, please LogIn first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;
        const totalAmount = parseFloat(req.query.totalAmount);

            // Check if this is the user's first purchase
        const userOrders = await order.find({ userId });
        const isFirstPurchase = userOrders.length === 0;
        //////console.log(userOrders);

        let coupons;

        if (isFirstPurchase) {
            // Retrieve coupons for first order and amount is less than the total amount
            coupons = await coupon.find({
                isActive: true,
                $or: [
                    { userFirstPurchase: true },
                    { minPurchaseAmount: { $lte: totalAmount } }
                ]
            }).lean();
        } else {
            // Retrieve only the coupons with amount less than the total amount
            coupons = await coupon.find({
                isActive: true,
                minPurchaseAmount: { $lte: totalAmount },
                userFirstPurchase: false
            }).lean();
        }

        res.json({ coupons });

    }catch(error){
        ////console.log(error);
    }
}