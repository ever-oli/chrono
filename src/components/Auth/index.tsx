import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

export default function AuthComponent() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-oxford-blue">Welcome to Timey</h2>
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
        redirectTo={window.location.origin}
      />
    </div>
  );
}