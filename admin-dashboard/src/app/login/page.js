"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Mail, Lock, User, Eye, EyeOff, ShieldCheck,
  ArrowRight, AlertCircle, CheckCircle2, Phone,
  KeyRound, ArrowLeft
} from "lucide-react";

const API = "http://localhost:8000/api/auth";

export default function LoginPage() {
  const [tab, setTab] = useState("login"); // "login" | "register" | "forgot"
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
  
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showPwd, setShowPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  
  const [forgotForm, setForgotForm] = useState({ email: "", otp: "", newPassword: "", resetToken: "" });

  const { login } = useAuth();
  const router = useRouter();

  function switchTab(next) {
    if (next === tab || animating) return;
    const dir = next === "register" || next === "forgot" ? "left" : "right";
    setSlideDir(dir);
    setAnimating(true);
    setError("");
    setSuccess("");
    setTimeout(() => {
      setTab(next);
      if (next === "forgot") setForgotStep(1);
      setAnimating(false);
    }, 280);
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(""); setLoading(true);
      try {
        const res = await fetch(`${API}/google`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || "Google login failed."); }
        else { login(data.data.accessToken, data.data.user); router.replace("/dashboard"); }
      } catch { setError("Google login failed."); }
      finally { setLoading(false); }
    },
    onError: () => setError("Google sign-in cancelled."),
  });

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed."); }
      else { login(data.data.accessToken, data.data.user); router.replace("/dashboard"); }
    } catch { setError("Cannot reach the server."); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const fullName = `${registerForm.firstName.trim()} ${registerForm.lastName.trim()}`;
      const res = await fetch(`${API}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email: registerForm.email, password: registerForm.password, phone: registerForm.phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); }
      else {
        setSuccess("Account created! You can now sign in.");
        switchTab("login");
        setLoginForm({ email: registerForm.email, password: "" });
        setRegisterForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
      }
    } catch { setError("Cannot reach the server."); }
    finally { setLoading(false); }
  }

  // OTP Forgot Password Handlers
  async function handleSendOtp(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); }
      else { setSuccess("OTP sent to your email!"); setForgotStep(2); }
    } catch { setError("Cannot reach the server."); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email, otp: forgotForm.otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); }
      else {
        setSuccess("OTP Verified. Create a new password.");
        setForgotForm({ ...forgotForm, resetToken: data.data.resetToken });
        setForgotStep(3);
      }
    } catch { setError("Cannot reach the server."); }
    finally { setLoading(false); }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: forgotForm.resetToken, newPassword: forgotForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); }
      else {
        setSuccess("Password reset successfully. You can now login.");
        setTimeout(() => switchTab("login"), 2000);
      }
    } catch { setError("Cannot reach the server."); }
    finally { setLoading(false); }
  }

  const slideStyle = {
    transform: animating ? `translateX(${slideDir === "left" ? "-40px" : "40px"})` : "translateX(0)",
    opacity: animating ? 0 : 1,
    transition: "transform 0.28s ease, opacity 0.28s ease",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--sidebar-bg)" }}>
      {/* Holographic Card Wrapper */}
      <div className="w-full max-w-3xl flex rounded-2xl shadow-2xl overflow-hidden relative holographic-card" style={{ minHeight: "520px" }}>
        
        {/* Left Holographic Panel */}
        <div className="hidden md:flex flex-col w-[42%] relative z-10" style={{ backgroundColor: "#1d4ed8" }}>
          <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(150deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)" }} />

          {/* Geometric chevron layers */}
          {[
            { w: "200%", h: "200%", t: "-60%", l: "-80%", op: 0.07, rot: "-35deg", skew: "-12deg" },
            { w: "180%", h: "180%", t: "-40%", l: "-65%", op: 0.09, rot: "-35deg", skew: "-12deg" },
            { w: "155%", h: "155%", t: "-20%", l: "-48%", op: 0.12, rot: "-35deg", skew: "-12deg" },
          ].map((l, i) => (
            <div key={i} className="absolute rounded-3xl z-0"
              style={{
                width: l.w, height: l.h, top: l.t, left: l.l,
                background: `rgba(255,255,255,${l.op})`,
                transform: `rotate(${l.rot}) skewX(${l.skew})`,
              }} />
          ))}

          {/* Tab Pill */}
          <div className="relative z-20 p-6 flex flex-col gap-2">
            <div className="relative flex w-full max-w-[240px] rounded-full p-0.5" style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <div className="absolute top-0.5 bottom-0.5 w-1/2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  backgroundColor: tab === "forgot" ? "transparent" : "#fff",
                  left: tab === "register" ? "calc(50% - 2px)" : "2px",
                  opacity: tab === "forgot" ? 0 : 1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }} />
              {[{ key: "login", label: "Login" }, { key: "register", label: "Register" }].map(({ key, label }) => (
                <button key={key} onClick={() => switchTab(key)}
                  className="relative z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-full text-center"
                  style={{ color: tab === key ? "var(--blue)" : "rgba(255,255,255,0.75)" }}>
                  {label}
                </button>
              ))}
            </div>
            
            {tab === "forgot" && (
              <button onClick={() => switchTab("login")} className="flex items-center gap-1.5 text-xs text-white opacity-80 hover:opacity-100 transition-opacity w-fit mt-2">
                <ArrowLeft size={14} /> Back to Login
              </button>
            )}
          </div>

          <div className="relative z-20 mt-auto p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white" style={{ opacity: 0.6 }}>
              {tab === "login" ? "Sign In" : tab === "register" ? "Create Account" : "Recover Account"}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>SmartVyapar ERP Platform</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex flex-col z-20 relative bg-white" style={{ backgroundColor: "var(--card-bg)" }}>
          
          {/* Mobile Tab */}
          <div className="flex md:hidden p-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <div className="relative flex w-full rounded-xl p-0.5" style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)" }}>
              <div className="absolute top-0.5 bottom-0.5 w-1/2 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  backgroundColor: "var(--blue)",
                  left: tab === "register" ? "calc(50% - 2px)" : "2px",
                  opacity: tab === "forgot" ? 0 : 1,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                }} />
              {[{ key: "login", label: "Sign In" }, { key: "register", label: "Register" }].map(({ key, label }) => (
                <button key={key} onClick={() => switchTab(key)}
                  className="relative z-10 flex-1 py-2 text-xs font-bold transition-colors duration-200 rounded-lg"
                  style={{ color: tab === key ? "#fff" : "var(--text-muted)" }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col px-8 py-7" style={slideStyle}>
            {/* Avatar Head */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2.5"
                style={{ backgroundColor: "var(--blue-bg)", boxShadow: "0 0 0 4px var(--card-bg), 0 0 0 7px var(--blue-muted)" }}>
                {tab === "forgot" ? <KeyRound size={28} style={{ color: "var(--blue)" }} /> : <User size={28} style={{ color: "var(--blue)" }} />}
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-[0.2em]" style={{ color: "var(--blue)" }}>
                {tab === "login" ? "Login" : tab === "register" ? "Register" : "Recovery"}
              </h2>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs" style={{ backgroundColor: "var(--red-bg)", color: "var(--red-text)" }}>
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs" style={{ backgroundColor: "var(--green-bg)", color: "var(--green-text)" }}>
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> {success}
              </div>
            )}

            {/* Forgot Password Flow */}
            {tab === "forgot" && (
              <div className="flex-1">
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <p className="text-xs text-center mb-4" style={{ color: "var(--text-secondary)" }}>Enter your email address to receive a 6-digit OTP.</p>
                    <UnderlineInput id="forgot-email" type="email" placeholder="Email Address" icon={<Mail size={15} />}
                      value={forgotForm.email} onChange={v => setForgotForm({ ...forgotForm, email: v })} />
                    <div className="flex justify-center pt-2">
                      <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: "var(--blue)", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
                        {loading ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                  </form>
                )}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <p className="text-xs text-center mb-4" style={{ color: "var(--text-secondary)" }}>Enter the 6-digit code sent to {forgotForm.email}</p>
                    <UnderlineInput id="forgot-otp" type="text" placeholder="6-digit OTP" icon={<ShieldCheck size={15} />}
                      value={forgotForm.otp} onChange={v => setForgotForm({ ...forgotForm, otp: v })} />
                    <div className="flex justify-center pt-2">
                      <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: "var(--blue)", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
                        {loading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  </form>
                )}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <p className="text-xs text-center mb-4" style={{ color: "var(--text-secondary)" }}>Enter your new password.</p>
                    <UnderlineInput id="forgot-newpwd" type={showPwd ? "text" : "password"} placeholder="New Password" icon={<Lock size={15} />}
                      value={forgotForm.newPassword} onChange={v => setForgotForm({ ...forgotForm, newPassword: v })}
                      suffix={<button type="button" onClick={() => setShowPwd(!showPwd)} style={{ color: "var(--text-muted)" }}>{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                    <div className="flex justify-center pt-2">
                      <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: "var(--blue)", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
                        {loading ? "Resetting..." : "Reset Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Login form */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5 flex-1">
                <UnderlineInput id="login-email" type="email" placeholder="Email" icon={<Mail size={15} />}
                  value={loginForm.email} onChange={v => setLoginForm({ ...loginForm, email: v })} />
                <UnderlineInput id="login-password" type={showPwd ? "text" : "password"} placeholder="Password" icon={<Lock size={15} />}
                  value={loginForm.password} onChange={v => setLoginForm({ ...loginForm, password: v })}
                  suffix={<button type="button" onClick={() => setShowPwd(p => !p)} style={{ color: "var(--text-muted)" }}>{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => switchTab("forgot")} className="text-xs font-medium hover:underline" style={{ color: "var(--blue)" }}>
                    Forgot Password?
                  </button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-60 transition-all hover:opacity-90"
                    style={{ backgroundColor: "var(--blue)", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
                    {loading ? "Signing in…" : <><span>Login</span><ArrowRight size={14} /></>}
                  </button>
                </div>
              </form>
            )}

            {/* Register form */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4 flex-1">
                <div className="flex gap-3">
                  <UnderlineInput id="register-firstname" type="text" placeholder="First Name" icon={<User size={15} />}
                    value={registerForm.firstName} onChange={v => setRegisterForm({ ...registerForm, firstName: v })} />
                  <UnderlineInput id="register-lastname" type="text" placeholder="Last Name" icon={<User size={15} />}
                    value={registerForm.lastName} onChange={v => setRegisterForm({ ...registerForm, lastName: v })} />
                </div>
                <UnderlineInput id="register-phone" type="tel" placeholder="Phone Number" icon={<Phone size={15} />}
                  value={registerForm.phone} onChange={v => setRegisterForm({ ...registerForm, phone: v })} />
                <UnderlineInput id="register-email" type="email" placeholder="Email Address" icon={<Mail size={15} />}
                  value={registerForm.email} onChange={v => setRegisterForm({ ...registerForm, email: v })} />
                <UnderlineInput id="register-password" type={showRegPwd ? "text" : "password"} placeholder="Password (min. 6 chars)" icon={<Lock size={15} />}
                  value={registerForm.password} onChange={v => setRegisterForm({ ...registerForm, password: v })}
                  suffix={<button type="button" onClick={() => setShowRegPwd(p => !p)} style={{ color: "var(--text-muted)" }}>{showRegPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-60 transition-all hover:opacity-90"
                    style={{ backgroundColor: "var(--blue)", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
                    {loading ? "Creating…" : <><span>Create Account</span><ArrowRight size={14} /></>}
                  </button>
                </div>
              </form>
            )}

            {/* Google sign-in (Only on Login/Register) */}
            {tab !== "forgot" && (
              <div className="mt-auto pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-color)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Or Login With</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-color)" }} />
                </div>
                <div className="flex justify-center">
                  <button onClick={() => googleLogin()} disabled={loading}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-md disabled:opacity-60"
                    style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-body)" }}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UnderlineInput({ id, type, placeholder, icon, value, onChange, suffix }) {
  return (
    <div className="flex items-center gap-3 pb-1.5" style={{ borderBottom: "1px solid var(--input-border)" }}>
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <input id={id} type={type} required suppressHydrationWarning placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: "var(--input-text)" }} />
      {suffix && <span className="shrink-0">{suffix}</span>}
    </div>
  );
}
