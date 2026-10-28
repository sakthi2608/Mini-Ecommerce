const productModel = require('../models/productModel');

// Get products API - /api/v1/product
exports.getProducts = async (req,res, next) => {

let query = req.query.keyword ? { 
    name: {
        $regex: req.query.keyword,
        $options: 'i'
    } 
} : {}

const products = await productModel.find(query); // ✅ FIXED

res.json({
    success: true,
    products
})
}

// Get single products API - /api/v1/product : id
exports.getSingleProduct = async (req,res, next) => {

console.log(req.params.id, 'ID')

try{
const product = await productModel.findById(req.params.id);

res.json({
    success: true,
    product
})

}catch (error){
res.status(404).json({
success: false,
message: 'Unable to get product with that id'
})
}

}