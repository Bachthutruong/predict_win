'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { verifyEmailAction } from '@/app/actions';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await verifyEmailAction(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Icons.logo className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">PredictWin</span>
          </div>
          <CardTitle className="text-2xl text-center">
            {status === 'loading' ? 'Verifying Email...' : 
             status === 'success' ? 'Email Verified!' : 
             'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' ? 'Please wait while we verify your email address.' :
             status === 'success' ? 'Your email has been successfully verified.' :
             'There was an issue verifying your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {status !== 'loading' && (
            <Alert variant={status === 'success' ? 'default' : 'destructive'}>
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'success' && (
            <div className="mt-6 text-center">
              <Link href="/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-6 text-center space-y-2">
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Try Registering Again
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                Or <Link href="/login" className="text-primary hover:underline">go to login</Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading verification...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}