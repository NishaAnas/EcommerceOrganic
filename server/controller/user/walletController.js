const mongoose = require('mongoose');
const user = require('../../modals/user');
const wallet = require('../../modals/wallet');

//Initialize wallet
const initializeWallet = async (userId) => {
    let Wallet = await wallet.findOne({ userId });

    if (!Wallet) {
        Wallet = new wallet({
            userId,
            balance: 0,
            transactions: []
        });
        await Wallet.save();

        //save it to the userdocument
        await user.findByIdAndUpdate(userId, { walletId: Wallet._id });
    }

    return Wallet._id;
};


//function to credit wallet with reasons
exports.creditWallet = async (userId, amount, reason, orderId = null) => {
    try {
        const walletId = await initializeWallet(userId);

        const Wallet = await wallet.findOneAndUpdate({ _id: walletId },
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

//function to debit wallet with reason
exports.debitWallet = async (userId, amount, reason, orderId = null) => {
    try {
        const walletId = await initializeWallet(userId);

        const Wallet = await wallet.findOneAndUpdate({ _id: walletId },
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

//Get wallet page
exports.getWallet = async (req, res) => {
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

        //Call function to initialize the wallet
        const WalletId = await initializeWallet(userId);
        const Wallet = await wallet.findById(WalletId).lean();

        // Pagination 
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of transactions per page
        const skip = (page - 1) * limit;

        const totalTransactions = Wallet.transactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);
        const transactions = Wallet.transactions.slice(skip, skip + limit);

        res.render('user/wallet/wallet', {
            userData,
            userDetails,
            balance: Wallet.balance,
            walletDetails: transactions,
            currentPage: page,
            totalPages: totalPages,
            layout: 'userAccountLayout'
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        req.flash('error', 'Failed to load wallet');
        res.redirect('/');
    }
}

//Add Money to wallet
exports.addMoney = async (req, res) => {
    try {
        const userId = req.session.userLoggedInData.userId;
        const { amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        //Call function to credit the wallet with reason
        await exports.creditWallet(userId, amount, 'Amount Deposited');

        res.status(200).json({ message: 'Amount added successfully' });
    } catch (error) {
        console.error('Error adding money to wallet:', error);
        res.status(500).json({ message: 'Server error', error });
    }
}