import productServices from '../models/productModel.js';
const {
    getAllProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService,
    patchProductService
} = productServices;

const handleResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await getAllProductsService();
        handleResponse(res, 200, 'Products fetched successfully', products);
    } catch (error) {
        next(error);
    }
};
export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await getProductByIdService(id);    
        if (!product) {
            return handleResponse(res, 404, 'Product not found', null);
        }
        handleResponse(res, 200, 'Product fetched successfully', product);
    } catch (error) {
        next(error);
    }
};
export const createProduct = async (req, res, next) => {
    try {
        const product = await createProductService(req.body);
        handleResponse(res, 201, 'Product created successfully', product);
    } catch (error) {
        next(error);
    }
};
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await updateProductService(id, req.body);
        handleResponse(res, 200, 'Product updated successfully', product);
    } catch (error) {
        next(error);
    }
};
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await deleteProductService(id);
        handleResponse(res, 200, 'Product deleted successfully', product);
    } catch (error) {
        next(error);
    }
};
export const patchProduct = async (req, res, next) => {
      try {
          const { id } = req.params;
          const updates = { ...req.body };
  
          if (Object.keys(updates).length === 0) {
              return handleResponse(res, 400, 'No fields provided for update', null);
          }
  
          if (Object.prototype.hasOwnProperty.call(updates, 'desc') && updates.desc === undefined) {
              updates.desc = null;
          }
  
          const product = await patchProductService(id, updates);
          if (!product) {
              return handleResponse(res, 404, 'Product not found', null);
          }
  
          handleResponse(res, 200, 'Product updated successfully', product);
      } catch (error) {
          next(error);
      }
  };
export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    patchProduct
};