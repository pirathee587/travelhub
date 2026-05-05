import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success(t('login_success'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || t('login_failed'));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-success text-white text-center py-4">
              <h2>{t('login')}</h2>
            </div>
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">{t('email')}</label>
                  <input type="email" name="email" className="form-control" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('password')}</label>
                  <input type="password" name="password" className="form-control" onChange={handleChange} required />
                </div>
                <div className="text-end mb-3">
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>Forgot Password?</Link>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-success btn-lg">{t('login')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
