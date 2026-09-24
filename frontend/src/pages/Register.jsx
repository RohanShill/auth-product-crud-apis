import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const Register = ({ setView }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');
    setSuccessMessage('');

    try {
      const response = await register(formData);
      setSuccessMessage(response.message || 'Registration successful! You can now log in.');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const errorsMap = {};
        err.response.data.errors.forEach((item) => {
          errorsMap[item.field] = item.message;
        });
        setFieldErrors(errorsMap);
      } else if (err.response?.status === 409) {
        setGeneralError(err.response?.data?.message || 'Email already exists.');
      } else {
        setGeneralError(err.response?.data?.message || 'An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} />
          </div>
          <h2>Create Account</h2>
          <p>Register to add products, manage inventory and explore CRUD APIs.</p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <div>
              <p className="font-semibold">{successMessage}</p>
              <button
                type="button"
                className="link-button"
                onClick={() => setView('login')}
                style={{ marginTop: '0.25rem', display: 'inline-block' }}
              >
                Click here to Sign In &rarr;
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div className={`input-wrapper ${fieldErrors.name ? 'has-error' : ''}`}>
              <User className="input-icon" size={18} />
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="Jane Developer"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            {fieldErrors.name && (
              <span className="field-error-text">{fieldErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
              <Mail className="input-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error-text">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
              <Lock className="input-icon" size={18} />
              <input
                id="reg-password"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error-text">{fieldErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <div className={`input-wrapper ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
              <Lock className="input-icon" size={18} />
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error-text">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => setView('login')}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
