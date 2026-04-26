import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/auth/verify?token=${token}`);
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
    <div className="min-vh-100 flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center p-6 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {status === 'verifying' && "Verifying Email..."}
            {status === 'success' && "Verification Successful!"}
            {status === 'error' && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={status === 'error' ? "text-red-500" : "text-gray-600"}>
            {message}
          </p>
          {status !== 'verifying' && (
            <Button asChild className="w-full">
              <Link to={status === 'success' ? "/login" : "/signup"}>
                {status === 'success' ? "Proceed to Login" : "Back to Signup"}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
