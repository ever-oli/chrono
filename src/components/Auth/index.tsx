import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function AuthComponent() {
  // Get the current URL for redirect
  const redirectTo = `${window.location.origin}`;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-oxford-blue">Welcome to Timey</h2>
        <p className="text-space-cadet mt-2">Track your time, achieve more.</p>
      </div>
      
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#DC9E82',
                brandAccent: '#C16E70',
              },
            },
          },
        }}
        providers={['google']}
        redirectTo={redirectTo}
        queryParams={{
          access_type: 'offline',
          prompt: 'consent',
        }}
      />
      
      <div className="mt-6 text-center text-sm text-space-cadet">
        <p>
          By signing in, you agree to our{' '}
          <Link to="/privacy-policy" className="text-buff hover:text-old-rose underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}