import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  const hasVerified = React.useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    
    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      hasVerified.current = true;
      try {
        const response = await api.get(`/auth/verify?token=${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed.');
      }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="container mt-5 text-center">
      <div className="card shadow p-5">
        {status === 'verifying' && <h2>Verifying your email...</h2>}
        {status === 'success' && (
          <>
            <h2 className="text-success">Verification Successful!</h2>
            <p className="mt-3">{message}</p>
            <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-danger">Verification Failed</h2>
            <p className="mt-3">{message}</p>
            <Link to="/signup" className="btn btn-secondary mt-3">Back to Signup</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
