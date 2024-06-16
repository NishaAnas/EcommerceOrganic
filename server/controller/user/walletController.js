const mongoose = require('mongoose');
const user = require('../../modals/user');
const wallet = require('../../modals/wallet');

exports.creditWallet = async (userId, amount, reason, orderId = null) => {
    try {
        const Wallet = await wallet.findOneAndUpdate({ userId },
            {
                $inc: { balance: amount },
                $push: {
                    transactions: { amount, type: 'credit', reason, orderId }
                }
            },
            { new: true, upsert: true }
        );

        if (!Wallet) {
            throw new Error('Failed to credit wallet');
        }
    } catch (error) {
        console.error('Error crediting wallet:', error);
        throw new Error('Failed to credit wallet');
    }
};

exports.debitWallet = async (userId, amount, reason, orderId = null) => {
    try {
        const Wallet = await wallet.findOneAndUpdate({ userId },
            {
                $inc: { balance: -amount },
                $push: {
                    transactions: { amount, type: 'debit', reason, orderId }
                }
            },
            { new: true, upsert: true }
        );

        if (!Wallet) {
            throw new Error('Failed to credit wallet');
        }
    } catch (error) {
        console.error('Error debiting wallet:', error);
        throw new Error('Failed to debit wallet');
    }
};

exports.getWallet = async(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    try {
        if (!req.session.userLoggedInData || !req.session.userLoggedInData.userloggedIn) {
            req.flash('error', 'To access the wallet, please log in first.');
            return res.redirect('/login');
        }
        const userId = req.session.userLoggedInData.userId;

        //Check user is blocked or not
        const existingUser = await user.findById(userId);
        if (existingUser.isBlocked) {
            req.flash('error', 'Your account is blocked. Please contact the administrator for assistance.');
            return res.redirect('/login');
        }
        const userData = req.session.userLoggedInData;

        const userDetails = await user.findById(userId).lean();
        const Wallet = await wallet.findOne({ userId }).lean();

        if (!Wallet) {
            return res.render('user/wallet/wallet', { 
                userData,
                userDetails,
                balance: 0, 
                transactions: [] ,
                layout:'userAccountLayout'
            });
        }
        const walletDetails=Wallet.transactions;
        console.log(Wallet.transactions);
        res.render('user/wallet/wallet', {
            userDetails,
            balance: Wallet.balance,
            walletDetails,
            layout:'userAccountLayout'
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        req.flash('error', 'Failed to load wallet');
        res.redirect('/');
    }
}

//Add Money to wallet
exports.addMoney = async(req,res)=>{
    try {
        const userId = req.session.userLoggedInData.userId;
        const { amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        await exports.creditWallet(userId, amount, 'Amount Deposited');

        res.status(200).json({ message: 'Amount added successfully' });
    } catch (error) {
        console.error('Error adding money to wallet:', error);
        res.status(500).json({ message: 'Server error', error });
    }
}