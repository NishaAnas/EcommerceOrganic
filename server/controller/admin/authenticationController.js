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
const fs = require('fs');

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
//Calculate % 
const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current === 0 ? "0%" : "+100%";
    const change = ((current - previous) / previous * 100).toFixed(2);
    return (change > 0 ? `+${change}` : `${change}`) + "%";
};

//GET Admin Dashboard
exports.getAdminhomePage = async(req, res) => {
    try {
        if ( req.session.adminLoggedInData) {
            const adminData = req.session.userLoggedInData;
            const successMessage = req.flash('success');
            const errorMessage = req.flash('error');

            const currentDate = moment().startOf('day');
            const previousDate = moment().subtract(1, 'days').startOf('day');

            
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

            // Fetch today's orders
            const todayOrders = await order.find({
                orderDate: {
                    $gte: currentDate.toDate(),
                    $lt: moment(currentDate).endOf('day').toDate()
                }
            });
            const todaystotalOrders = todayOrders.length;
            const todaystotalRevenue = todayOrders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2);
            const todaystotalCouponDiscount = todayOrders.reduce((total, order) => total + (order.discountAmount || 0), 0).toFixed(2);

            // Fetch yesterday's orders
            const yesterdayOrders = await order.find({
                orderDate: {
                    $gte: previousDate.toDate(),
                    $lt: moment(previousDate).endOf('day').toDate()
                }
            });
            const yesterdayTotalOrders = yesterdayOrders.length;
            const yesterdayTotalRevenue = yesterdayOrders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2);
            const yesterdayTotalCouponDiscount = yesterdayOrders.reduce((total, order) => total + (order.discountAmount || 0), 0).toFixed(2);
            
            //calculate %
            const totalOrdersChange = calculatePercentageChange(todaystotalOrders, yesterdayTotalOrders);
            const totalRevenueChange = calculatePercentageChange(todaystotalRevenue, yesterdayTotalRevenue);
            const totalCouponDiscountChange = calculatePercentageChange(todaystotalCouponDiscount, yesterdayTotalCouponDiscount);
            
                res.render('admin/Authentication/dashbord', { 
                    layout: 'adminlayout' , 
                    adminData,
                    totalOrders,
                    totalRevenue,
                    totalCouponDiscount,
                    totalCustomers,
                    totalOrdersChange,
                    totalRevenueChange,
                    totalCouponDiscountChange,
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


const getOrders = async (type, startDate, endDate) => {
    let query = {};

    switch (type) {
        case 'custom':
            if (startDate && endDate) {
                query = {
                    orderDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                };
            }
            break;
        case 'daily':
            query = {
                orderDate: {
                    $gte: moment().startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate()
                }
            };
            break;
        case 'weekly':
            query = {
                orderDate: {
                    $gte: moment().startOf('isoWeek').toDate(),
                    $lte: moment().endOf('isoWeek').toDate()
                }
            };
            break;
        case 'monthly':
            query = {
                orderDate: {
                    $gte: moment().startOf('month').toDate(),
                    $lte: moment().endOf('month').toDate()
                }
            };
            break;
        case 'yearly':
            query = {
                orderDate: {
                    $gte: moment().startOf('year').toDate(),
                    $lte: moment().endOf('year').toDate()
                }
            };
            break;
    }

    const orders = await order.find(query);
    return orders;
};

//GET slaes report page 
exports.getSalesReportPage = async(req,res)=>{
    try{
        const orders = await order.find().lean();
        const completedOrders = orders.filter(order => order.orderStatus === 'Completed');
        const cancelledOrders = orders.filter(order => order.orderStatus === 'Cancelled');
                        
        const totalRevenue = completedOrders.reduce((total, order) => total + order.totalAmount, 0);
        const totalDiscountGiven = completedOrders.reduce((total, order) => total + order.discountAmount, 0);
        const reportData = {           
                            totalOrders: orders.length,
                            completedOrders: completedOrders.length,
                            cancelledOrders: cancelledOrders.length,
                            totalRevenue: totalRevenue,
                            totalDiscountGiven: totalDiscountGiven
                        };
        console.log(`report Data :${reportData}`);
        res.render('admin/salesReport/salesReport',{
            layout:'adminlayout',
            reportData
        })
    }catch(error){
        console.log(error)
    }
}

exports.getReportData = async(req,res)=>{
    try{
        const { filterType, startDate, endDate } = req.query;
        console.log(req.query);

        const orders = await getOrders(filterType, startDate, endDate);
        const completedOrders = orders.filter(order => order.orderStatus === 'Completed');
        const cancelledOrders = orders.filter(order => order.orderStatus === 'Cancelled');
                        
        const totalRevenue = completedOrders.reduce((total, order) => total + order.totalAmount, 0);
        const totalDiscountGiven = completedOrders.reduce((total, order) => total + order.discountAmount, 0);
        const reportData = {           
                            totalOrders: orders.length,
                            completedOrders: completedOrders.length,
                            cancelledOrders: cancelledOrders.length,
                            totalRevenue: totalRevenue,
                            totalDiscountGiven: totalDiscountGiven
                        };
        console.log(`report Data :${reportData}`);
        res.json(reportData);

    }catch(error){
        console.log(error);
    }
}

exports.downloadReport = async(req,res)=>{
    try{
        const { filterType, format, startDate, endDate } = req.query;
        console.log(req.query);

        const orders = await getOrders(filterType, startDate, endDate);
        const completedOrders = orders.filter(order => order.orderStatus === 'Completed');
        const cancelledOrders = orders.filter(order => order.orderStatus === 'Cancelled');
                        
        const totalRevenue = completedOrders.reduce((total, order) => total + order.totalAmount, 0);
        const totalDiscountGiven = completedOrders.reduce((total, order) => total + order.discountAmount, 0);
        const reportData = {           
                            totalOrders: orders.length,
                            completedOrders: completedOrders.length,
                            cancelledOrders: cancelledOrders.length,
                            totalRevenue: totalRevenue,
                            totalDiscountGiven: totalDiscountGiven
                        };
        console.log(`Download Data :${reportData}`);
        console.log(`completedOrders :${completedOrders}`);
        console.log(`cancelledOrders :${cancelledOrders}`);
        console.log(`totalRevenue :${totalRevenue}`);
        console.log(`totalDiscountGiven :${totalDiscountGiven}`);

        if (format === 'pdf') {
            generatePDFReport(reportData, res);
        } else if (format === 'excel') {
            generateExcelReport(reportData, res);
        } else {
            res.status(400).send('Invalid format');
        }
    }catch(error){
        res.status(500).json('Server Error');
    }
}

//Generate PDF Report
const generatePDFReport = (data, res) => {
    const doc = new PDFDocument();
    const filename = 'Sales_Report.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Total Orders: ${data.totalOrders}`);
    doc.fontSize(14).text(`Completed Orders: ${data.completedOrders}`);
    doc.fontSize(14).text(`Cancelled Orders: ${data.cancelledOrders}`);
    doc.fontSize(14).text(`Total Revenue: ₹${data.totalRevenue.toFixed(2)}`);
    doc.fontSize(14).text(`Total Discount Given: ₹${data.totalDiscountGiven.toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(12).text('End of Report', { align: 'center' });

    doc.end();
};

//Generate Excel Report
const generateExcelReport = (data, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
    worksheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 30 }
    ];

    worksheet.addRows([
        ['Total Orders', data.totalOrders],
        ['Completed Orders', data.completedOrders],
        ['Cancelled Orders', data.cancelledOrders],
        ['Total Revenue', `₹${data.totalRevenue.toFixed(2)}`],
        ['Total Discount Given', `₹${data.totalDiscountGiven.toFixed(2)}`]
    ]);

    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
            cell.font = { size: 12, bold: colNumber === 1 };
        });
    });

    const tempFilePath = path.join(__dirname, 'Sales_Report.xlsx');
    workbook.xlsx.writeFile(tempFilePath).then(() => {
        res.download(tempFilePath, 'Sales_Report.xlsx', (err) => {
            if (err) {
                console.error('Error downloading Excel file:', err);
            }
            fs.unlink(tempFilePath, (err) => {
                if (err) {
                    console.error('Error deleting temp Excel file:', err);
                }
            });
        });
    }).catch((error) => {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Error generating Excel file');
    });
};