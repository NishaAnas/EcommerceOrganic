const user = require('../../modals/user')
const category = require('../../modals/categories')
const product = require('../../modals/product')
const admin = require ('../../modals/admin');
const order = require('../../modals/order.js')
const { upload, resizeImages } = require('../../config/multer.js');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const path = require('path');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

//GET Admin Login
exports.getAdminLogin = (req,res)=>{
    const isAdmin = true;
    console.log(req.session.adminLoggedInData)
    if (! req.session.adminLoggedInData) {
    res.render('admin/Authentication/adminLogin',{isAdmin,success: req.flash('success'),error: req.flash('error'), layout:'athenticationlayout'});
}
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
    }
    else{
        console.log('Admin found');
        req.session.adminLoggedInData = {
            adminloggedIn: true,
            email: email,
            userId: existingAdmin._id,
        }
        req.flash('success', 'Login Successful');
        }
        return res.redirect(`/admin?email=${email}`);
    } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'Server Error');
    res.redirect(`/admin/adminlogin`);
    }
}

//GET Admin SignUp
exports.getAdminSignup = (req,res)=>{
    res.render('admin/Authentication/adminsignup',{success: req.flash('success'),error: req.flash('error'), layout:'athenticationlayout'});
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
    req.flash('error', 'Server Error');
    res.redirect(`/admin/adminsignup`);
    }
}

exports.getadminLogout = (req,res)=>{
    req.session.destroy((err)=>{
        if (err) {
            console.error('Error in destroying the session:', err);
        }
        res.redirect('/admin/adminlogin');
    })
}


//GET Admin Dashboard
exports.getAdminhomePage = async(req, res) => {
    try {
        if ( req.session.adminLoggedInData) {
            const adminData = req.session.userLoggedInData;
            const successMessage = req.flash('success');
            const errorMessage = req.flash('error');

            const totalOrders = await order.countDocuments();

            // Calculate total revenue
            const allorders = await order.find();
            let totalRevenue = 0;
            for (let order of allorders) {
                totalRevenue += order.totalAmount;
            }
            totalRevenue = totalRevenue.toFixed(2);

            // Calculate total discount from coupons
            let totalCouponDiscount = 0;
            for (let order of allorders) {
                totalCouponDiscount += order.discountAmount || 0;
            }
            totalCouponDiscount = totalCouponDiscount.toFixed(2);

            const totalCustomers = await user.countDocuments();

            // console.log(totalOrders);
            // console.log(totalRevenue);
            // console.log(totalCouponDiscount);
            // console.log(totalCustomers);
            // Fetch total customers count
            
                res.render('admin/Authentication/dashbord', { 
                    layout: 'adminlayout' , 
                    adminData,
                    totalOrders,
                    totalRevenue,
                    totalCouponDiscount,
                    totalCustomers,
                    successMessage: successMessage , 
                    errorMessage: errorMessage });            
        } else {
            req.flash('error', 'Please login to access the admin dashboard');
            res.redirect('/admin/adminlogin');
        }
        } catch (error) {
            req.flash('error', 'Server Error');
        console.error(error);
        } 
}

// Utility function to calculate percentage change
// function calculatePercentageChange(newVal, oldVal) {
//     if (oldVal === 0) return 'N/A';
//     return (((newVal - oldVal) / oldVal) * 100).toFixed(2) + '%';
// }

const getOrders = async (type, startDate, endDate) => {
    let query = {};

    switch (type) {
        case 'custom':
            if (startDate && endDate) {
                query = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                };
            }
            break;
        case 'daily':
            query = {
                createdAt: {
                    $gte: moment().startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate()
                }
            };
            break;
        case 'weekly':
            query = {
                createdAt: {
                    $gte: moment().startOf('isoWeek').toDate(),
                    $lte: moment().endOf('isoWeek').toDate()
                }
            };
            break;
        case 'monthly':
            query = {
                createdAt: {
                    $gte: moment().startOf('month').toDate(),
                    $lte: moment().endOf('month').toDate()
                }
            };
            break;
        case 'yearly':
            query = {
                createdAt: {
                    $gte: moment().startOf('year').toDate(),
                    $lte: moment().endOf('year').toDate()
                }
            };
            break;
    }

    const orders = await order.find(query);
    return orders;
};


exports.getReportData = async (req, res) => {
        try {
            const { type, startDate, endDate } = req.body;
    
            const orders = await getOrders(type, startDate, endDate);
            const reportData = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((total, order) => total + order.totalAmount, 0),
                totalCouponDiscount: orders.reduce((total, order) => total + order.discountAmount, 0),
                totalCustomers: new Set(orders.map(order => order.userId.toString())).size,
                orders
            };
            //console.log(reportData);

            res.json(reportData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            res.status(500).json({ error: 'Server Error' });
        }
};


// Controller function for downloading reports
exports.downloadReport = async (req, res) => {
    try {
        const { format, type, startDate, endDate, orders } = req.body;
        console.log(req.body);

        // if (format === 'pdf') {
        //     const doc = new PDFDocument();
        //     let filename = 'sales_report.pdf';
        //     filename = encodeURIComponent(filename);

        //     res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        //     res.setHeader('Content-type', 'application/pdf');

        //     doc.fontSize(16).text(`Report Type: ${type}`, { align: 'center' });
    //         if (startDate && endDate) {
    //     doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
    //   }
    //   doc.fontSize(14).text(`Total Orders: ${orders.length}`, { align: 'left' });
    //   doc.fontSize(14).text(`Total Revenue: ${orders.reduce((total, order) => total + order.totalAmount, 0)}`, { align: 'left' });
    //   doc.fontSize(14).text(`Total Coupon Discount: ${orders.reduce((total, order) => total + order.discountAmount, 0)}`, { align: 'left' });

    //   orders.forEach(order => {
    //     doc.fontSize(12).text(`Order ID: ${order.newOrderId}`, { align: 'left' });
    //     doc.fontSize(12).text(`Total Amount: ${order.totalAmount}`, { align: 'left' });
        //     doc.end();
        //     doc.pipe(res);

        // } else if (format === 'excel') {
        //     const workbook = new ExcelJS.Workbook();
        //     const sheet = workbook.addWorksheet('Sales Report');

        //     worksheet.columns = [
    //     { header: 'Order ID', key: 'newOrderId', width: 20 },
    //     { header: 'Total Amount', key: 'totalAmount', width: 15 },
    //     { header: 'Discount Amount', key: 'discountAmount', width: 15 },
    //     { header: 'Order Date', key: 'orderDate', width: 25 }
    //   ];

            // orders.forEach(order => {
            //     worksheet.addRow({
            //       newOrderId: order.newOrderId,
            //       totalAmount: order.totalAmount,
            //       discountAmount: order.discountAmount,
            //       orderDate: order.orderDate
            //     });
            //   });

        //     res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
        //     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        //     await workbook.xlsx.write(res);
        //     res.end();
        // }
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};