import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductModal from './components/ProductModal';
import DeleteModal from './components/DeleteModal';
import api from './api/axios';

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  const [currentView, setCurrentView] = useState('products'); // 'products' | 'login' | 'register'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      setCurrentView('login');
      return;
    }
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setProductToEdit(prod);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (prod) => {
    setProductToDelete(prod);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProductToDelete(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Delete product error:', err);
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-layout">
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onOpenAddModal={handleOpenAddModal}
      />

      <main className="main-content">
        {currentView === 'products' && (
          <Products
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentView === 'login' && <Login setView={setCurrentView} />}

        {currentView === 'register' && <Register setView={setCurrentView} />}
      </main>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        productToEdit={productToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
