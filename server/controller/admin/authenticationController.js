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
const Chart = require('chart.js');


//GET Admin Login
exports.getAdminLogin = (req,res)=>{
    const isAdmin = true;
    //console.log(req.session.adminLoggedInData)
    if (! req.session.adminLoggedInData) {
    res.render('admin/Authentication/adminLogin',{isAdmin,success: req.flash('success'),error: req.flash('error'), layout:'athenticationlayout'});
}
}

//POST Admin Login
exports.postAdminLogin = async(req,res)=>{
    //console.log("entered routes For Login POST")

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
        //console.log('Admin found');
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
//console.log(`${email} ${password} ${conformpassword}`)

// Validate password and confirmation
if (password !== conformpassword) {
    //console.log('password does not match');
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
            
            // const chartData = await getChartData('weekly');

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
                    //chartData: JSON.stringify(chartData),
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


exports.getDailyRevenue = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9); // Last 10 days

        const orders = await order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lt: now },
                    orderStatus: 'Completed'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                    },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);

        res.json(orders);
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        res.status(500).json({ error: 'Failed to fetch daily revenue' });
    }
};

exports.getMonthlyRevenue = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1); // Start of the current year
        const endDate = new Date(now.getFullYear() + 1, 0, 1); // Start of the next year

        const orders = await order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lt: endDate },
                    orderStatus: 'Completed'
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(orders);
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        res.status(500).json({ error: 'Failed to fetch monthly revenue' });
    }
};


exports.getYearlyRevenue = async (req, res) => {
    try {
        const startDate = new Date(2020, 0, 1); // Start of 2020
        const now = new Date();

        const orders = await order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lt: now },
                    orderStatus: 'Completed'
                }
            },
            {
                $group: {
                    _id: { $year: "$orderDate" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(orders);
    } catch (error) {
        console.error('Error fetching yearly revenue:', error);
        res.status(500).json({ error: 'Failed to fetch yearly revenue' });
    }
};




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
                orderDate: {$gte: moment().startOf('day').toDate(),$lte: moment().endOf('day').toDate()}
            };
            break;
        case 'weekly':
            query = {
                orderDate: {$gte: moment().startOf('isoWeek').toDate(),$lte: moment().endOf('isoWeek').toDate()}
            };
            break;
        case 'monthly':
            query = {
                orderDate: {$gte: moment().startOf('month').toDate(),$lte: moment().endOf('month').toDate()}
            };
            break;
        case 'yearly':
            query = {
                orderDate: {$gte: moment().startOf('year').toDate(),$lte: moment().endOf('year').toDate()}
            };
            break;
    }

    const orderDetails = await order.find(query)
            .populate('address')
            .populate({
                path: 'items.productId',
                model: 'productVariation',
                select: 'attributeValue'
            });
    return orderDetails;
};

//GET sales report page 
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
        //console.log(`report Data :${reportData}`);
        res.render('admin/salesReport/salesReport',{
            layout:'adminlayout',
            reportData
        })
    }catch(error){
        //console.log(error)
    }
}

//Generate Report Data
exports.getReportData = async(req,res)=>{
    try{
        const { filterType, startDate, endDate } = req.query;
        //console.log(req.query);

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
        //console.log(`report Data :${reportData}`);
        res.json(reportData);

    }catch(error){
        //console.log(error);
    }
}


//Download Report
exports.downloadReport = async(req,res)=>{
    try{
        const { filterType, format, startDate, endDate } = req.query;
        //console.log(req.query);

        const orders = await getOrders(filterType, startDate, endDate)
        orders.forEach(order => {
            //console.log('Order ID:', order.newOrderId);
            order.items.forEach(item => {
                //console.log('Product ID:', item.productId);
                //console.log('Quantity:', item.quantity);
                //console.log('Price:', item.price);
                //console.log('Product Attribute Value:', item.productId.attributeValue);
            });
        });
                
        if (format === 'pdf') {
            generatePDFReport(orders, res);
        } else if (format === 'excel') {
            generateExcelReport(orders, res);
        } else {
            res.status(400).send('Invalid format');
        }

    }catch(error){
        res.status(500).json('Server Error');
        //console.log(error)
    }
}

const generatePDFReport = (orders, res) => {
    const doc = new PDFDocument();
    const filename = 'Sales_Report.pdf';
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Sales Report', { align: 'center' });
    doc.moveDown();

    const tableTop = 100;
    const tableLeft = 50;
    const rowHeight = 25;
    const columnWidths = [50, 100, 60, 70, 100, 80, 80];

    // Draw Table Headers
    drawTableRow(doc, tableTop, tableLeft, rowHeight, columnWidths, [
        'Order', 'Product', 'Quantity', 'Price', 'Total Price', 'Discount', 'Coupon Used'
    ], true);

    let currentTop = tableTop + rowHeight;

    // Draw Table Rows
    orders.forEach((order, orderIndex) => {
        order.items.forEach((item, itemIndex) => {
            const { productId, quantity, price } = item;
            const totalItemPrice = quantity * price;
            const { discountAmount, couponCode } = order;
            const productDetails = item.productId.attributeValue;

            drawTableRow(doc, currentTop, tableLeft, rowHeight, columnWidths, [
                itemIndex === 0 ? `Order ${orderIndex + 1}` : '',
                productDetails,
                quantity.toString(),
                `₹${price.toFixed(2)}`,
                `₹${totalItemPrice.toFixed(2)}`,
                `₹${discountAmount.toFixed(2)}`,
                couponCode || '-'
            ]);

            currentTop += rowHeight;
        });

        // Draw Total Amount and Order Status
        drawTableRow(doc, currentTop, tableLeft, rowHeight, columnWidths, [
            '', '', '', '', `Total Amount: ₹${order.totalAmount.toFixed(2)}`, `Order Status: ${order.orderStatus}`, ''
        ], false, true);

        currentTop += rowHeight;

        // Draw an empty row
        drawEmptyRow(doc, currentTop, tableLeft, rowHeight, columnWidths);
        currentTop += rowHeight;
    });

    doc.fontSize(12).text('End of Report', { align: 'center' });
    doc.end();
};

const drawTableRow = (doc, top, left, height, widths, row, isHeader = false, isBold = false) => {
    const backgroundColor = isHeader ? '#eeeeee' : '#ffffff';
    doc.rect(left, top, widths.reduce((a, b) => a + b), height).fill(backgroundColor).stroke();

    let currentLeft = left;

    row.forEach((cell, i) => {
        doc.rect(currentLeft, top, widths[i], height).stroke();
        doc.fillColor('#000000')
            .font(isHeader || isBold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(10)
            .text(cell, currentLeft + 5, top + 5, { width: widths[i] - 10, align: 'left' });

        currentLeft += widths[i];
    });
};

const drawEmptyRow = (doc, top, left, height, widths) => {
    const backgroundColor = '#ffffff';
    doc.rect(left, top, widths.reduce((a, b) => a + b), height).fill(backgroundColor).stroke();
    
    let currentLeft = left;

    widths.forEach((width, i) => {
        doc.rect(currentLeft, top, width, height).stroke();
        currentLeft += width;
    });
};

const generateExcelReport = (orders, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
    worksheet.columns = [
        { header: 'Order ID', key: 'orderId', width: 15 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Total Price', key: 'totalPrice', width: 15 },
        { header: 'Discount', key: 'discount', width: 15 },
        { header: 'Coupon Used', key: 'coupon', width: 20 },
        { header: 'Total Amount Paid', key: 'totalAmount', width: 20 },
        { header: 'Order Status', key: 'orderStatus', width: 15 }
    ];

    // Add rows for each order
    orders.forEach(order => {
        let isFirstItem = true;
        let orderTotalPrice = 0;

        order.items.forEach(item => {
            const totalItemPrice = item.quantity * item.price;
            orderTotalPrice += totalItemPrice;

            worksheet.addRow({
                orderId: isFirstItem ? order.newOrderId : '',
                productName: item.productId.attributeValue,
                quantity: item.quantity,
                totalPrice: totalItemPrice,
                discount: isFirstItem ? order.discountAmount || 0 : '',
                coupon: isFirstItem ? order.couponCode || '' :'-',
                // totalAmount: isFirstItem ? order.totalAmount : '',
                // orderStatus: isFirstItem ? order.orderStatus : ''
            });

            isFirstItem = false;
        });

        // Add an empty row after each order
        worksheet.addRow({});

        // Calculate and add the total amount row for the order
        worksheet.addRow({
            orderId: '',
            productName: 'Total Amount:',
            quantity: '',
            totalPrice: '',
            discount: '',
            coupon: '',
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus
        });

        // Add another empty row after the total amount row
        worksheet.addRow({});
    });

    // Format header row
    worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
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


// Function to get best selling categories
const getBestSellingCategories = async () => {
    try {
        const bestSellingCategories = await order.aggregate([
            { $unwind: "$items" },
            { $lookup: {
                from: 'productvariations',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'productVariation'
            }},
            { $unwind: '$productVariation' },
            { $lookup: {
                from: 'products',
                localField: 'productVariation.productId',
                foreignField: '_id',
                as: 'product'
            }},
            { $unwind: '$product' },
            { $lookup: {
                from: 'categories',
                localField: 'product.categoryId',
                foreignField: '_id',
                as: 'category'
            }},
            { $group: {
                _id: '$category._id',
                categoryName: { $first: '$category.name' },
                totalQuantity: { $sum: '$items.quantity' }
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        return bestSellingCategories;
    } catch (error) {
        throw new Error(error);
    }
};

// Route for getting best selling categories
exports.bestCategories = async (req, res) => {
    try {
        const bestSellingCategories = await getBestSellingCategories();
        res.json(bestSellingCategories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve best selling categories' });
    }
};


// Function to get best selling products
const getBestSellingProducts = async () => {
    try {
        const bestSellingProducts = await order.aggregate([
            { $unwind: "$items" },
            { $group: {
                _id: "$items.productId",
                totalQuantity: { $sum: "$items.quantity" }
            }},
            { $lookup: {
                from: 'productvariations',
                localField: '_id',
                foreignField: '_id',
                as: 'productVariation'
            }},
            { $unwind: '$productVariation' },
            { $lookup: {
                from: 'products',
                localField: 'productVariation.productId',
                foreignField: '_id',
                as: 'product'
            }},
            { $unwind: '$product' },
            { $lookup: {
                from: 'categories',
                localField: 'product.categoryId',
                foreignField: '_id',
                as: 'category'
            }},
            { $project: {
                productName: '$product.name',
                categoryName: '$category.name',
                totalQuantity: '$totalQuantity'
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        return bestSellingProducts;
    } catch (error) {
        throw new Error(error);
    }
};

// Route for getting best selling products
exports.bestProducts = async (req, res) => {
    try {
        const bestSellingProducts = await getBestSellingProducts();
        res.json(bestSellingProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve best selling products' });
    }
};


// Function to get best selling product variations
const getBestSellingProductVariations = async () => {
    try {
        const bestSellingProductVariations = await order.aggregate([
            { $unwind: "$items" },
            { $group: {
                _id: "$items.productId",
                totalQuantity: { $sum: "$items.quantity" }
            }},
            { $lookup: {
                from: 'productvariations',
                localField: '_id',
                foreignField: '_id',
                as: 'productVariation'
            }},
            { $unwind: '$productVariation' },
            { $lookup: {
                from: 'products',
                localField: 'productVariation.productId',
                foreignField: '_id',
                as: 'product'
            }},
            { $unwind: '$product' },
            { $lookup: {
                from: 'categories',
                localField: 'product.categoryId',
                foreignField: '_id',
                as: 'category'
            }},
            { $project: {
                productVariationSKU: '$productVariation.sku',
                productName: '$productVariation.attributeValue',
                categoryName: '$category.name',
                totalQuantity: '$totalQuantity'
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        return bestSellingProductVariations;
    } catch (error) {
        throw new Error(error);
    }
};

// Route for getting best selling product variations
exports.bestVariations =async (req, res) => {
    try {
        const bestSellingProductVariations = await getBestSellingProductVariations();
        res.json(bestSellingProductVariations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve best selling product variations' });
    }
};


