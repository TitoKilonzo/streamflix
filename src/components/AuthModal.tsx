import React, { useState } from 'react';
import { 
  Lock, Mail, User as UserIcon, Shield, CreditCard, Phone, Smartphone, 
  Check, Play, ArrowRight, CheckCircle2, RefreshCw, X, Eye, EyeOff
} from 'lucide-react';
import { User, Profile } from '../types';

interface AuthModalProps {
  currentUser: User | null;
  onLogin: (email: string, name: string, isSocial?: boolean) => void;
  onLogout: () => void;
  onUpdateUser: (updated: User) => void;
  onSelectProfile: (profileId: string) => void;
  onClose: () => void;
  onAddTransaction: (plan: 'basic' | 'standard' | 'premium', amount: number, method: 'Stripe' | 'M-Pesa') => void;
}

const STREAM_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', // elegant female
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', // casual male
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80', // young female
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80', // hipster male
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&q=80', // animated icon
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&q=80'  // kids fun colorful
];

export default function AuthModal({
  currentUser,
  onLogin,
  onLogout,
  onUpdateUser,
  onSelectProfile,
  onClose,
  onAddTransaction
}: AuthModalProps) {
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'profiles' | 'plans' | 'checkout'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Plans & Checkout State
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'standard' | 'premium'>('premium');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'M-Pesa'>('Stripe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'stk-push' | 'success'>('idle');
  const [mpesaPin, setMpesaPin] = useState('');

  // Stripe Inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('311');

  // Profiles State
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);
  const [newProfileAvatar, setNewProfileAvatar] = useState(STREAM_AVATARS[0]);
  const [showAddProfileForm, setShowAddProfileForm] = useState(false);

  const planPrices = {
    basic: 7.99,
    standard: 11.99,
    premium: 15.99
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authView === 'login') {
      const parsedName = email.split('@')[0];
      onLogin(email, parsedName.charAt(0).toUpperCase() + parsedName.slice(1));
      setAuthView('profiles');
    } else if (authView === 'register') {
      onLogin(email, name || 'User');
      setAuthView('plans');
    } else if (authView === 'forgot') {
      alert('Password reset trigger link dispatched to ' + email);
      setAuthView('login');
    }
  };

  const triggerSocialLogin = (provider: 'Google' | 'Apple') => {
    const mockEmail = `social.${provider.toLowerCase()}@streamflix.example.com`;
    onLogin(mockEmail, `${provider} Streamer`, true);
    setAuthView('profiles');
  };

  // M-PESA STK Push Sim
  const triggerMpesaCheckout = () => {
    if (!phoneNumber) {
      alert('Safaricom Contact line is required for M-Pesa STK push!');
      return;
    }
    setIsProcessingPayment(true);
    setPaymentStep('stk-push');
    
    // Simulate STK push trigger response
    setTimeout(() => {
      // Prompt user inside check-flow or auto pincode
    }, 1500);
  };

  const confirmStkPin = () => {
    if (mpesaPin.length < 4) {
      alert('Please enter valid 4-digit Safaricom M-Pesa PIN!');
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      onAddTransaction(selectedPlan, planPrices[selectedPlan], 'M-Pesa');
      if (currentUser) {
        onUpdateUser({
          ...currentUser,
          subscription: selectedPlan,
          subscriptionStatus: 'active',
          phoneNumber: phoneNumber
        });
      }
      setIsProcessingPayment(false);
      setPaymentStep('success');
    }, 2000);
  };

  // STRIPE PAYMENTS
  const handleStripeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      onAddTransaction(selectedPlan, planPrices[selectedPlan], 'Stripe');
      if (currentUser) {
        onUpdateUser({
          ...currentUser,
          subscription: selectedPlan,
          subscriptionStatus: 'active'
        });
      }
      setIsProcessingPayment(false);
      setPaymentStep('success');
    }, 1800);
  };

  const handleProfileCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName || !currentUser) return;

    const newProfile: Profile = {
      id: `p_${Date.now()}`,
      name: newProfileName,
      avatarUrl: newProfileAvatar,
      isKids: newProfileIsKids,
      watchlist: [],
      continueWatching: [],
      downloads: []
    };

    onUpdateUser({
      ...currentUser,
      profiles: [...currentUser.profiles, newProfile]
    });

    setNewProfileName('');
    setNewProfileIsKids(false);
    setShowAddProfileForm(false);
  };

  const removeProfile = (profileId: string) => {
    if (!currentUser) return;
    if (currentUser.profiles.length === 1) {
      alert('You must have at least one active profile tier!');
      return;
    }
    onUpdateUser({
      ...currentUser,
      profiles: currentUser.profiles.filter(p => p.id !== profileId)
    });
  };

  return (
    <div id="auth-modal-root" className="fixed inset-0 bg-black/90 backdrop-blur-md z-45 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden relative shadow-2xl">
        
        {/* Absolute Banner Close Button (Only if authenticated and has active profile, to allow dismissal) */}
        {currentUser && currentUser.subscriptionStatus === 'active' && currentUser.currentProfileId && (
          <button 
            id="close-auth-modal-abs"
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-[#1e1e1e] hover:bg-[#E50914] transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* LOGO TITLE HEADER */}
        <div className="p-6 text-center border-b border-neutral-800 bg-gradient-to-r from-[#E50914]/10 via-[#121212] to-[#E50914]/10">
          <span className="text-3xl font-black tracking-tighter text-[#E50914] uppercase font-sans">
            STREAM<span className="text-white">FLIX</span>
          </span>
          <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest font-mono">Premium HLS Streaming Studio</p>
        </div>

        {/* 1. LOGIN MODE */}
        {authView === 'login' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white text-center">Hello Streamer, Sign In</h3>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 block">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 block">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button type="button" onClick={() => setAuthView('forgot')} className="text-[#E50914] hover:underline">Forgot password?</button>
                <button type="button" onClick={() => setAuthView('register')} className="text-white/60 hover:text-white">New here? Sign up</button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold p-3 rounded-lg text-xs tracking-wider transition-colors shadow-lg"
              >
                Sign In
              </button>
            </form>

            <div className="relative flex items-center justify-center py-2">
              <span className="absolute bg-[#121212] px-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">Or Use Social Accounts</span>
              <div className="w-full border-t border-neutral-800"></div>
            </div>

            {/* Google / Apple Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                id="social-login-google"
                onClick={() => triggerSocialLogin('Google')}
                className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.415 0-6.19-2.775-6.19-6.19s2.775-6.19 6.19-6.19c1.55 0 2.96.57 4.05 1.51l3.1-3.1C18.99 1.48 15.83 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.8 0 11.45-4.75 11.45-11.45 0-.7-.07-1.35-.2-1.93l-11.25-.015z" />
                </svg>
                Google
              </button>
              <button 
                id="social-login-apple"
                onClick={() => triggerSocialLogin('Apple')}
                className="bg-[#161616] hover:bg-[#222222] text-white border border-neutral-800 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.66.75-1.24 1.89-1.08 3 1.1.08 2.27-.58 3.03-1.45z" />
                </svg>
                Apple Pay
              </button>
            </div>
          </div>
        )}

        {/* 2. REGISTER SIGN-UP */}
        {authView === 'register' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white text-center">Create Brand New Session Account</h3>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                    placeholder="Kilonzo Tito"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                    placeholder="Min 6 characters"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button type="button" onClick={() => setAuthView('login')} className="text-[#E50914] hover:underline">Already registered? Log in</button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold p-3 rounded-lg text-xs tracking-wider transition-colors shadow-lg"
              >
                Sign Up & Select Plan
              </button>
            </form>
          </div>
        )}

        {/* 3. FORGOT PASSWORD */}
        {authView === 'forgot' && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white text-center">Trouble Logging In?</h3>
            <p className="text-xs text-white/50 text-center leading-relaxed">Enter your registered email below, and we will send you a secure link to reset password instantly.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70 block">Your Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold py-2.5 rounded text-xs transition-colors">Dispatch Reset Token</button>
              <button type="button" onClick={() => setAuthView('login')} className="w-full text-xs text-white/50 hover:text-white text-center">Back to Login</button>
            </form>
          </div>
        )}

        {/* 4. PROFILES PANEL SUMMARY */}
        {authView === 'profiles' && currentUser && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white text-center font-sans tracking-wide">Who is watching today?</h3>
            
            {/* Profiles Selection list */}
            <div className="grid grid-cols-2 gap-4 justify-items-center py-2">
              {currentUser.profiles.map((pr) => (
                <div key={pr.id} className="text-center space-y-2 relative group w-24">
                  <button 
                    id={`profile-selector-${pr.id}`}
                    onClick={() => {
                      onSelectProfile(pr.id);
                      if (currentUser.subscriptionStatus !== 'active') {
                        setAuthView('plans');
                      } else {
                        onClose();
                      }
                    }}
                    className="w-20 h-20 rounded-md overflow-hidden border-2 border-transparent hover:border-[#E50914] transition-all transform hover:scale-105 shadow-xl bg-black/40 flex items-center justify-center relative"
                  >
                    <img 
                      src={pr.avatarUrl} 
                      alt={pr.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {pr.isKids && (
                      <span className="absolute bottom-1 right-1 bg-[#E50914] text-[8px] font-bold text-white font-mono px-1 rounded uppercase tracking-wider">
                        KIDS
                      </span>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-semibold text-white line-clamp-1">{pr.name}</span>
                    <button 
                      onClick={() => removeProfile(pr.id)}
                      className="text-white/30 hover:text-red-500 hover:scale-115 text-[10px] hidden group-hover:inline-block"
                      title="Delete profile"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Profiles Creation Add Button toggle */}
            {!showAddProfileForm ? (
              <button
                id="btn-show-add-profile"
                onClick={() => setShowAddProfileForm(true)}
                className="w-full border border-dashed border-white/20 hover:border-white text-white/70 hover:text-white text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
              >
                + Add Custom Profile
              </button>
            ) : (
              <form onSubmit={handleProfileCreate} className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Create Stream Profile</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-bold">Profile Name</label>
                  <input 
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="e.g., Mom, Kid Jr"
                    className="w-full bg-[#121212] border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#E50914]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase font-bold">Choose Avatar</label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {STREAM_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setNewProfileAvatar(av)}
                        className={`w-10 h-10 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                          newProfileAvatar === av ? 'border-[#E50914] scale-110' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={av} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer py-1">
                  <input 
                    type="checkbox"
                    checked={newProfileIsKids}
                    onChange={(e) => setNewProfileIsKids(e.target.checked)}
                    className="w-4 h-4 text-[#E50914] accent-[#E50914]"
                  />
                  <span className="text-xs text-white/80">Kids Profile (Only anime, cartoons, kids tags)</span>
                </label>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddProfileForm(false)} 
                    className="text-[10px] uppercase font-bold text-white/50 px-3 py-1 bg-white/5 rounded hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="text-[10px] uppercase font-bold bg-[#E50914] hover:bg-[#b80710] text-white px-3.5 py-1.5 rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* Logout link */}
            <div className="border-t border-neutral-800 pt-4 text-center">
              <button 
                id="profiles-logout-btn"
                onClick={onLogout} 
                className="text-xs text-white/40 hover:text-[#E50914] tracking-wide uppercase font-mono font-bold flex items-center justify-center gap-1 mx-auto"
              >
                Sign out of StreamFlix
              </button>
            </div>
          </div>
        )}

        {/* 5. SELECT PLANS SYSTEM */}
        {authView === 'plans' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white text-center">Select Streaming Subscription Plan</h3>
            <p className="text-xs text-white/50 text-center leading-relaxed">Commit monthly or cancel at any second. Includes multi-language premium VTT subtitles, live castings, and offline download simulators.</p>

            <div className="space-y-3">
              <button
                type="button"
                id="plan-basic-btn"
                onClick={() => setSelectedPlan('basic')}
                className={`w-full border p-4 rounded-xl text-left transition-all ${
                  selectedPlan === 'basic' ? 'border-[#E50914] bg-[#E50914]/10 shadow-lg' : 'border-neutral-800 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">Basic HLS Tier</span>
                  <span className="font-mono text-sm text-gray-300 font-bold">$7.99 / mo</span>
                </div>
                <p className="text-[11px] text-white/60 mt-1">720p HD resolution quality on single screen. Single cached local downloads.</p>
              </button>

              <button
                type="button"
                id="plan-standard-btn"
                onClick={() => setSelectedPlan('standard')}
                className={`w-full border p-4 rounded-xl text-left transition-all ${
                  selectedPlan === 'standard' ? 'border-[#E50914] bg-[#E50914]/10 shadow-lg' : 'border-neutral-800 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white font-sans">Standard HD Plus</span>
                  <span className="font-mono text-sm text-gray-300 font-bold">$11.99 / mo</span>
                </div>
                <p className="text-[11px] text-white/60 mt-1">1080p FHD resolution streaming on up to 2 active screens concurrently.</p>
              </button>

              <button
                type="button"
                id="plan-premium-btn"
                onClick={() => setSelectedPlan('premium')}
                className={`w-full border p-4 rounded-xl text-left transition-all ${
                  selectedPlan === 'premium' ? 'border-[#E50914] bg-[#E50914]/15 shadow-lg shadow-[#E50914]/10' : 'border-neutral-800 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-red-400 flex items-center gap-1">
                    Premium Ultra 4K
                    <span className="bg-[#E50914] text-white text-[8px] px-1 rounded uppercase">BEST</span>
                  </span>
                  <span className="font-mono text-sm text-[#E50914] font-bold">$15.99 / mo</span>
                </div>
                <p className="text-[11px] text-white/60 mt-1 font-sans">4K UHD + HDR playback on 4 active screens. Includes immersive spatial audio channels.</p>
              </button>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button 
                onClick={() => setAuthView('profiles')} 
                className="bg-[#1a1a1a] hover:bg-neutral-800 text-white text-xs px-4 py-2 rounded-lg"
              >
                Profiles
              </button>
              <button 
                id="confirm-plans-selection"
                onClick={() => setAuthView('checkout')}
                className="bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-extrabold px-6 py-2.5 rounded-lg flex items-center gap-1 shadow-md shadow-[#E50914]/10"
              >
                Go to Pay Check <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 6. PAYMENTS CHECKOUT FORM */}
        {authView === 'checkout' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-white text-center">Choose Payment Processing Endpoint</h3>
            
            {/* Payment Options Button Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#0a0a0a] border border-neutral-800 p-1 rounded-lg">
              <button 
                type="button"
                id="checkout-tab-stripe"
                onClick={() => { setPaymentMethod('Stripe'); setPaymentStep('idle'); }}
                className={`py-2 text-xs rounded font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'Stripe' ? 'bg-[#E50914] text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Stripe Gateway
              </button>
              <button 
                type="button"
                id="checkout-tab-mpesa"
                onClick={() => { setPaymentMethod('M-Pesa'); setPaymentStep('idle'); }}
                className={`py-2 text-xs rounded font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'M-Pesa' ? 'bg-[#138a36] text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Safaricom M-Pesa
              </button>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 p-3 rounded-lg text-xs flex justify-between items-center">
              <div>
                <span className="text-white font-mono uppercase font-bold">{selectedPlan} Member Tier</span>
                <span className="text-[10px] text-white/50 block">Billing monthly recurrently</span>
              </div>
              <span className="text-base text-[#E50914] font-mono font-bold">${planPrices[selectedPlan]}</span>
            </div>

            {/* M-PESA CHECKOUT PANEL */}
            {paymentMethod === 'M-Pesa' && (
              <div className="space-y-4">
                {paymentStep === 'idle' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70 block">Safaricom Number (Ksh dynamic conversion)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                        <input 
                          type="tel" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#138a36]"
                          placeholder="e.g., +254 712 345 678"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-white/40 block mt-1 leading-normal">
                        Conversions calculated instantly via central Nairobi CBK exchange API rates (~ KES {(planPrices[selectedPlan] * 133).toFixed(0)} KES).
                      </span>
                    </div>

                    <button 
                      id="mpesa-stk-push-trigger"
                      onClick={triggerMpesaCheckout}
                      className="w-full bg-[#138a36] hover:bg-[#0f6f2b] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-colors"
                    >
                      Trigger M-Pesa STK Push
                    </button>
                  </div>
                )}

                {/* Simulated STK PIN push dialog */}
                {paymentStep === 'stk-push' && (
                  <div className="bg-[#0a0a0a] border border-green-500/20 p-4 rounded-lg space-y-3 text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-[#138a36] animate-pulse"></div>
                    <Smartphone className="w-12 h-12 text-green-400 mx-auto animate-bounce" />
                    <h4 className="text-sm font-bold text-white leading-tight">PIN Authorization Required</h4>
                    <p className="text-[11px] text-white/60">An M-Pesa push window has been sent to +254 {phoneNumber.slice(-9)}. Check your mobile instantly and input PIN to authorize.</p>
                    
                    <div className="max-w-xs mx-auto space-y-2">
                      <input 
                        type="password" 
                        maxLength={4} 
                        value={mpesaPin}
                        onChange={(e) => setMpesaPin(e.target.value)}
                        placeholder="Enter 4-Digit M-Pesa PIN"
                        className="w-36 text-center text-xl tracking-widest bg-[#121212] border border-neutral-800 rounded py-1.5 text-white placeholder-white/10 focus:outline-none font-mono"
                      />
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => setPaymentStep('idle')} 
                          className="bg-white/10 text-white text-[10px] px-3 py-1.5 rounded"
                        >
                          Retry
                        </button>
                        <button 
                          onClick={confirmStkPin} 
                          disabled={isProcessingPayment && mpesaPin.length < 4}
                          className="bg-[#138a36] text-white font-bold text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1 hover:bg-[#0f6f2b] transition-colors"
                        >
                          {isProcessingPayment && <RefreshCw className="w-3 h-3 animate-spin" />} Confirm Pay
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STRIPE CHECKOUT FORM */}
            {paymentMethod === 'Stripe' && paymentStep === 'idle' && (
              <form onSubmit={handleStripeCheckout} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/70 block">Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2 text-xs text-white placeholder-white/20 font-mono focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70 block">Expiration Date</label>
                      <input 
                        type="text" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2 text-xs text-white placeholder-white/20 font-mono focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/70 block">CVC Security code</label>
                      <input 
                        type="text" 
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2 text-xs text-white placeholder-white/10 font-mono focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  id="stripe-checkout-trigger"
                  type="submit" 
                  disabled={isProcessingPayment}
                  className="w-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold p-3 rounded-lg text-xs tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authorization Security validation...
                    </>
                  ) : (
                    `Pay $${planPrices[selectedPlan]} with Stripe Gateway`
                  )}
                </button>
              </form>
            )}

            {/* PAYMENT SUCCESS SCREENS */}
            {paymentStep === 'success' && (
              <div id="payment-success-screen" className="text-center p-6 space-y-4 scale-up-animate">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white leading-tight">Payment Dispatched Successfully!</h3>
                <p className="text-xs text-white/60">Your billing ledger checks out. Welcome to StreamFlix Premium Cinema channels!</p>
                <button
                  id="payment-success-continue-btn"
                  onClick={() => {
                    setAuthView('profiles');
                  }}
                  className="w-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold py-2.5 rounded text-xs transition-colors"
                >
                  Continue to Select profile
                </button>
              </div>
            )}

            {paymentStep !== 'success' && (
              <button 
                type="button" 
                onClick={() => setAuthView('plans')} 
                className="w-full text-xs text-white/50 hover:text-white text-center mt-2"
              >
                Back to Subscription Plans
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
