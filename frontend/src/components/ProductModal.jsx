import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports & Fitness',
  'Accessories',
  'Other'
];

const ProductModal = ({ isOpen, onClose, onSuccess, productToEdit }) => {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price !== undefined ? productToEdit.price : '',
        category: productToEdit.category || 'Electronics',
        stock: productToEdit.stock !== undefined ? productToEdit.stock : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '0'
      });
    }
    setFieldErrors({});
    setGeneralError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError('');

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock, 10)
    };

    try {
      if (isEditing) {
        await api.put(`/products/${productToEdit._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const errorsMap = {};
        err.response.data.errors.forEach((item) => {
          errorsMap[item.field] = item.message;
        });
        setFieldErrors(errorsMap);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to save product.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div className="alert alert-danger" style={{ margin: '1rem 1.5rem 0' }}>
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="prod-name">Product Name *</label>
            <input
              id="prod-name"
              type="text"
              name="name"
              className={`input-field ${fieldErrors.name ? 'has-error' : ''}`}
              placeholder="e.g. Ergonomic Office Chair"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name && (
              <span className="field-error-text">{fieldErrors.name}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prod-category">Category *</label>
              <select
                id="prod-category"
                name="category"
                className={`input-field ${fieldErrors.category ? 'has-error' : ''}`}
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <span className="field-error-text">{fieldErrors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="prod-price">Price ($) *</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                className={`input-field ${fieldErrors.price ? 'has-error' : ''}`}
                placeholder="29.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
              {fieldErrors.price && (
                <span className="field-error-text">{fieldErrors.price}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="prod-stock">Stock Quantity *</label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                name="stock"
                className={`input-field ${fieldErrors.stock ? 'has-error' : ''}`}
                placeholder="15"
                value={formData.stock}
                onChange={handleChange}
                required
              />
              {fieldErrors.stock && (
                <span className="field-error-text">{fieldErrors.stock}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prod-desc">Description *</label>
            <textarea
              id="prod-desc"
              name="description"
              rows={3}
              className={`input-field ${fieldErrors.description ? 'has-error' : ''}`}
              placeholder="Detailed description of product features, dimensions, etc."
              value={formData.description}
              onChange={handleChange}
              required
            />
            {fieldErrors.description && (
              <span className="field-error-text">{fieldErrors.description}</span>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Update Product'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
