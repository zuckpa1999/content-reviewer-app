
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { Film } from 'lucide-react';
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}



// function FacebookIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true" style={{ flexShrink: 0 }}>
//       <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//     </svg>
//   );
// }

// function Spinner() {
//   return (
//     <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//     </svg>
//   );
// }

export default function LoginScreen() {
  //const { login, isLoading } = useAuth();

  // const handleLogin = (provider: AuthProvider) => {
  //   if (!isLoading) login(provider);
  // };

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  }
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  console.log("session", session);

  if (!session) {
    return (
      <>
        {/* <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />; */}
        {/* <button onClick={signUp}>Sign in with Google</button> */}

        <div
          className="min-h-dvh bg-dark-900 flex items-center justify-center px-4"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(229,9,20,0.07) 0%, transparent 70%)',
          }}
        >
          <div className="w-full max-w-sm animate-scale-in">

            {/* Card */}
            <div className="bg-dark-800 rounded-2xl border border-dark-700/60 shadow-2xl shadow-black/60 overflow-hidden">

              {/* Top accent stripe */}
              <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

              <div className="px-8 pt-8 pb-7">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-9">
                  <div className="w-10 h-10 rounded-xl bg-accent shadow-lg shadow-accent/30 flex items-center justify-center">
                    <Film className="text-white" style={{ width: '20px', height: '20px' }} />
                  </div>
                  <span className="font-black text-white text-2xl tracking-tight">
                    Media<span className="text-accent">Vault</span>
                  </span>
                </div>

                {/* Heading */}
                <div className="text-center mb-7">
                  <h1 className="text-xl font-bold text-white mb-1.5">Sign in to your account</h1>
                  <p className="text-dark-400 text-sm leading-relaxed">
                    Track your movies, series &amp; anime
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">

                  {/* Google */}
                  <button
                    onClick={() => signUp()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                           bg-white text-gray-800 font-semibold text-sm
                           border border-gray-200/10 shadow-sm
                           hover:bg-gray-50 active:scale-[0.98] transition-all duration-150
                           focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-dark-800
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    <span className="flex items-center justify-center w-5 h-5">
                      <GoogleIcon />
                    </span>
                    <span className="flex-1 text-center">Continue with Google</span>
                  </button>


                </div>

              </div>

            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div
        className="min-h-dvh bg-dark-900 flex items-center justify-center px-4"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(229,9,20,0.07) 0%, transparent 70%)',
        }}
      >
        <div className="flex flex-col">
          <h2>Welcome, {session?.user?.email}</h2>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }
}

