const category = require('../../modals/categories')
const product = require('../../modals/product')
const offer = require('../../modals/offer'); 


exports.getOfferManage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; 
        const skip = (page - 1) * limit;
    
        const offers = await offer.find({}).skip(skip).limit(limit).lean();
        // Update the status of offers based on their end date
        const currentDate = new Date();
        offers.forEach(async (Offer) => {
            if (new Date(Offer.endDate) < currentDate) {
                Offer.isActive = false;
                await offer.updateOne({ _id: Offer._id }, { isActive: false });
            }else{
                Offer.isActive = true;
                await offer.updateOne({ _id: Offer._id }, { isActive: true });
            }
        });
        const totaloffers = await offer.countDocuments({});
        const totalPages = Math.ceil(totaloffers / limit);


        res.render('admin/offer/offerManage', {
            layout: 'adminlayout',
            offers: offers,
            currentPage: page,
            totalPages: totalPages, 
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await product.find({ isActive: true }).lean();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await category.find({ isActive: true }).lean();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addOffers = async (req, res) => {
    const{title,type,applicableItems,discountType,discountValue,startDate,endDate} = req.body
    console.log(req.body);
    if(discountType==='Percentage' && discountValue > 90){
        return res.status(400).json({error:'For percentage Type discount cant be grater than 90% '});
    }
    const currentDate = new Date();
    const isActive = (new Date(startDate) <= currentDate && new Date(endDate) >= currentDate);


    //create new offer object
    const newOffer = new offer({
        title,
        type,
        applicableItems,
        discountType,
        discountValue,
        startDate,
        endDate,
        isActive
    })
    try{
        const savedOffer = await offer.create(newOffer);

        // Update the categoryOffer field and productOffer field
        if (type === 'Category') {
            const categories = await category.find({ name: { $in: applicableItems } }).select('_id');
            const categoryIds = categories.map(category => category._id);
            await product.updateMany(
                { categoryId: { $in: categoryIds } },
                { categoryOffer: savedOffer._id }
            );
        } else if (type === 'Product') {
            const products = await product.find({ name: { $in: applicableItems } }).select('_id');
            const productIds = products.map(product => product._id);
            await product.updateMany(
                { _id: { $in: productIds } },
                { productOffer: savedOffer._id }
            );
        }
        res.status(200).json('Offer Added Successfully');
    }catch(error){
        console.log(error);
        res.status(500).json('Server Error');
    }
    
};

exports.getOffer = async (req, res) => {
    try {
        const offers = await offer.findById(req.params._id).lean();
        if (!offers) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        console.log(offers);
        res.json(offers);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
};

// Edit an offer
exports.editOffer = async (req, res) => {
    const { title, type, applicableItems, discountType, discountValue, startDate, endDate, isActive } = req.body;
    //console.log(req.body);
    const offerId = req.params._id;
    //console.log(offerId);
    try {
        const existingOfferCheck = await offer.findOne({ title });
        //if not the same document
        if (existingOfferCheck && existingOfferCheck._id.toString() !== offerId) {
            const existingOfferName = existingOfferCheck.title.toLowerCase().trim();
            const requestedOfferName = req.body.title.toLowerCase().trim();
    
            if (existingOfferName === requestedOfferName) {
                req.flash('error', 'Offer Name already exists');
                res.status(400).json()
            }
        }

        const currentDate = new Date();
        const newIsActive = (new Date(startDate) <= currentDate && new Date(endDate) >= currentDate);

        const updatedOffer = await offer.findByIdAndUpdate(req.params._id, {
            title,
            type,
            applicableItems,
            discountType,
            discountValue,
            startDate,
            endDate,
            isActive: newIsActive
        })

        // Clear previous offer from products
        if (type === 'Category') {
            await product.updateMany({ categoryOffer: offerId },{ categoryOffer: null });
            const categories = await category.find({ name: { $in: applicableItems } }).select('_id');
            const categoryIds = categories.map(category => category._id);
            await product.updateMany({ categoryId: { $in: categoryIds } },{ categoryOffer: updatedOffer._id });
        } else if (type === 'Product') {
            await product.updateMany({ productOffer: offerId },{ productOffer: null });
            const products = await product.find({ name: { $in: applicableItems } }).select('_id');
            const productIds = products.map(product => product._id);
            await product.updateMany({ _id: { $in: productIds } },{ productOffer: updatedOffer._id });
        }

        req.flash('success', 'Offers updated successfully');
        res.status(200).send('Offer updated successfully!');
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to update offer');
    }
};

// Delete an offer
exports.deleteOffer = async (req, res) => {
    try {
        const offers = await offer.findById(req.params._id);
        if (!offers) {
            return res.status(404).send('Offer not found');
        }

        await offer.findByIdAndDelete(req.params._id)
        res.status(200).send('Offer deleted successfully!');
    } catch (error) {
        res.status(500).send('Failed to delete offer');
    }
};
