import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function AuthComponent() {
  const redirectTo = `${window.location.origin}/`;

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-frosted">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-oxford-blue mb-2">Welcome to Timey</h1>
        <p className="text-space-cadet">Track your time, achieve more.</p>
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
                inputBackground: 'white',
                inputBorder: '#E2E8F0',
                inputBorderHover: '#CBD5E1',
                inputBorderFocus: '#DC9E82',
              },
              radii: {
                borderRadiusButton: '0.5rem',
                buttonBorderRadius: '0.5rem',
                inputBorderRadius: '0.5rem',
              },
              space: {
                inputPadding: '0.75rem 1rem',
                buttonPadding: '0.75rem 1rem',
              },
              fonts: {
                bodyFontFamily: `'Inter', system-ui, sans-serif`,
                buttonFontFamily: `'Inter', system-ui, sans-serif`,
                inputFontFamily: `'Inter', system-ui, sans-serif`,
              },
            },
          },
          style: {
            button: {
              border: '1px solid #E2E8F0',
              fontWeight: '500',
              backgroundColor: '#FFFFFF',
              ':hover': {
                backgroundColor: '#F8FAFC',
              },
            },
            container: {
              gap: '1rem',
            },
            input: {
              backgroundColor: 'white',
            },
            message: {
              color: '#64748B',
              fontSize: '0.875rem',
            },
          },
        }}
        providers={['google']}
        redirectTo={redirectTo}
        queryParams={{
          access_type: 'offline',
          prompt: 'consent',
        }}
        showLinks={false}
        view="sign_in"
      />
      
      <div className="mt-4 text-center text-sm text-space-cadet">
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