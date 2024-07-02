const user = require('../../modals/user')

exports.getUserManagement = async(req,res) =>{
    try{    
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Number of users per page
        const skip = (page - 1) * limit;
    
        const Users = await user.find({}).skip(skip).limit(limit).lean();
        console.log(Users);

        const totalUsers = await user.countDocuments({});
        const totalPages = Math.ceil(totalUsers / limit);
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
            res.render('admin/user/userManagement',{
                Users,
                currentPage: page,
                totalPages: totalPages,
                layout: 'adminlayout',
                success: successMessage, 
                error: errorMessage})
    }catch(error){
        console.log(error)
        req.flash('error', 'Server Error');
        res.render('admin/user/userManagement', { layout: 'adminlayout', error: error });
    }
}

exports.blockUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        await user.findByIdAndUpdate(userId, { isBlocked: true, isActive: false  });
        res.status(200).json({ message: 'User blocked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to block user.' });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        await user.findByIdAndUpdate(userId, { isBlocked: false, isActive: true  });
        res.status(200).json({ message: 'User unblocked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unblock user.' });
    }
};