const user = require('../../modals/user')

exports.getUserManagement = async(req,res) =>{
    try{
        const locals = {
            title: 'User Management',
            description: 'Organic'
        }
    
        const Users = await user.find({}).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
            res.render('admin/user/userManagement',{Users,layout: 'adminlayout',success: successMessage, error: errorMessage})
    }catch(error){
        console.log(error)
        req.flash('error', 'Server Error');
        res.render('admin/user/userManagement', { layout: 'adminlayout', error: error });
    }
}

exports.blockUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        await user.findByIdAndUpdate(userId, { isBlocked: false });
        res.status(200).json({ message: 'User blocked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to block user.' });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        await user.findByIdAndUpdate(userId, { isBlocked: true });
        res.status(200).json({ message: 'User unblocked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unblock user.' });
    }
};