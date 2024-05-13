const user = require('../../modals/user')
const category = require('../../modals/categories')
const { upload, resizeImages } = require('../../config/multer');
const mongoose = require('mongoose')
const path = require('path');

//Get Category Management Page
exports.getCategoryPage = async (req, res) => {

    try {
        const locals = {
            title: 'Get Category page',
            description: 'Organic'
        }

        const Category = await category.find({ isDeleted: false }).lean();
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        res.render('admin/category/category', { locals, Category, layout: 'adminlayout', success: successMessage, error: errorMessage })
    } catch (error) {
        console.log(error)
        req.flash('error', 'Server Error');
        res.redirect('/admin/category');
    }
}

//GET Add Category Page
exports.getaddCategoryPage = (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('admin/category/addCategory', { layout: 'adminlayout', success: successMessage, error: errorMessage })
}


//POST Add Category Page
exports.postaddCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const existingCategory = await category.findOne({ name: req.body.name });

        // If another category with the same name exists
        if (existingCategory) {
            req.flash('error', 'Category name already exists');
            return res.redirect(`/admin/category`);
        }

        const imagePaths = req.resizedImages.map(relativeImagePath => {
            return `uploads\\${path.basename(relativeImagePath)}`;
        });

        const newCategory = new category({
            name,
            description,
            images: imagePaths,
            isActive: isActive === 'on' ? true : false // Convert string to boolean
        });
        await category.create(newCategory);
        req.flash('success', 'Category added successfully');
        res.redirect('/admin/category');
    } catch (error) {
        console.error('Error saving category:', error);
        req.flash('error', 'Server Error');
        res.redirect('/admin/addCategory');
    }

}

//* GET Edit Category page. */

exports.editCategory = async (req, res) => {
    const locals = {
        title: 'Edit Category page',
        description: 'Organic'
    }
    try {
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        const categoryDetailsViewing = await category.findOne({ _id: req.params._id }).lean();
        console.log(categoryDetailsViewing)
        res.render('admin/category/editCategory', { locals, categoryDetailsViewing, layout: 'adminlayout', success: successMessage, error: errorMessage });
    } catch (error) {
        req.flash('error', 'Server Error');
        res.redirect('/admin/category');
        console.log(error)
    }

};
/* POST Edit Product page.(UPDATE) */

exports.editPutcategory = async (req, res) => {
    console.log(req.body)
    try {
        const existingCategory = await category.findOne({ name: req.body.categoryName });

        // If another category with the same name exists and has a different ID
        if (existingCategory && existingCategory._id.toString() !== req.params._id) {
            req.flash('error', 'Category name already exists');
            return res.redirect(`/admin/editCategory/${req.params._id}`);
        }

        let imagePath = [];
        if (req.resizedImages && req.resizedImages.length > 0) {
            imagePath = req.resizedImages.map(relativeImagePath => {
                return `uploads\\${path.basename(relativeImagePath)}`
            })
        } else {
            const existingCategory = await category.findById(req.params._id);
            imagePath = existingCategory.images;
        }
        console.log(imagePath);

        await category.findByIdAndUpdate(req.params._id, {
            name: req.body.categoryName,
            description: req.body.categoryDetails,
            images: imagePath,
            isActive: req.body.isActive === 'on',
            isDeleted: req.body.isDeleted === 'on',
        })

        console.log('Category updated Successfully');
        req.flash('success', 'Category updated successfully');
        res.redirect(`/admin/category`);
    } catch (error) {
        console.log(error)
        req.flash('error', 'Server Error');
        res.redirect(`/admin/category`);
    }
}


exports.markdeleteCategory = async (req, res) => {
    try {
        await category.findByIdAndUpdate(req.params._id, {
            $set: {
                isActive: false,
                isDeleted: true
            }
        })
        console.log('Category  marked as deleted Successfully');
        req.flash('success', 'Category deleted successfully');
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error)
        req.flash('error', 'Server Error');
        res.redirect('/admin/category');
    }
}