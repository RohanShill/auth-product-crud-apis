import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Package,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports & Fitness',
  'Accessories',
  'Other'
];

const Products = ({ onEditProduct, onDeleteProduct, refreshTrigger }) => {
  const { user, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page,
        limit: 8,
        sort: sortBy
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Could not load products. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshTrigger]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Seed sample products if database is empty
  const handleSeedProducts = async () => {
    if (!isAuthenticated) {
      alert('Please log in first to add sample products.');
      return;
    }

    try {
      const sampleItems = [
        {
          name: 'Mechanical Gaming Keyboard',
          description: 'Tactile mechanical keyboard with RGB backlighting and hot-swappable switches.',
          price: 89.99,
          category: 'Electronics',
          stock: 18
        },
        {
          name: 'Wireless Noise-Cancelling Headphones',
          description: 'High-fidelity audio with 40-hour battery life and fast charging support.',
          price: 149.5,
          category: 'Electronics',
          stock: 30
        },
        {
          name: 'Classic Cotton Oxford Shirt',
          description: '100% breathable organic cotton shirt with tailored modern fit.',
          price: 45.0,
          category: 'Clothing',
          stock: 12
        },
        {
          name: 'Stainless Steel Insulated Water Bottle',
          description: 'Double-walled vacuum insulated bottle keeping drinks cold for 24 hours.',
          price: 24.99,
          category: 'Sports & Fitness',
          stock: 55
        }
      ];

      for (const item of sampleItems) {
        await api.post('/products', item);
      }

      fetchProducts();
    } catch (err) {
      console.error('Seeding error:', err);
      alert('Failed to seed products: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="products-page">
      {/* Hero / Filter Bar */}
      <section className="products-toolbar">
        <div className="toolbar-header">
          <div>
            <h1>Products Directory</h1>
            <p className="toolbar-subtitle">
              Browse products, filter by category, or manage your inventory in real time.
            </p>
          </div>

          {isAuthenticated && totalCount === 0 && !loading && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSeedProducts}
            >
              <Sparkles size={16} />
              <span>Generate Sample Products</span>
            </button>
          )}
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="filter-controls">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
              >
                &times;
              </button>
            )}
          </div>

          <div className="sort-bar">
            <ArrowUpDown size={16} />
            <select value={sortBy} onChange={handleSortChange}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="products-grid-section">
        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <h3>No products found</h3>
            <p>
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search criteria or category filter.'
                : 'No products have been added yet. Sign in and create the first product!'}
            </p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((item) => {
                const isOwner =
                  user &&
                  item.createdBy &&
                  (item.createdBy._id === user._id || item.createdBy === user._id);

                return (
                  <div key={item._id} className="product-card">
                    <div className="card-top">
                      <span className="category-tag">{item.category}</span>
                      <span
                        className={`stock-badge ${
                          item.stock > 0 ? 'in-stock' : 'out-of-stock'
                        }`}
                      >
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    <h3 className="product-title">{item.name}</h3>
                    <p className="product-description">{item.description}</p>

                    <div className="card-divider" />

                    <div className="card-bottom">
                      <div className="price-tag">
                        <span className="currency">$</span>
                        <span className="amount">
                          {Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="creator-info">
                        <Layers size={14} />
                        <span>
                          {item.createdBy?.name
                            ? `By ${item.createdBy.name}`
                            : 'Verified Product'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (only show if logged in and owner) */}
                    {isAuthenticated && isOwner && (
                      <div className="card-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => onEditProduct(item)}
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => onDeleteProduct(item)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <span className="pagination-info">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> (
                  {totalCount} items)
                </span>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Products;
