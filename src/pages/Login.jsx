import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import { KeyRound, Mail, Eye, EyeOff, ShieldAlert, CheckSquare } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isAdminLogin, setIsAdminLogin] = useState(false); // Admin/Teacher Switch
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Verify User Role in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const userRole = userData.role;

                // Strict validation according to dynamic selection
                if (isAdminLogin && userRole !== "admin") {
                    await auth.signOut();
                    showErrorToast("Access Denied: You do not have Admin privileges.");
                    setLoading(false);
                    return;
                } else if (!isAdminLogin && userRole === "admin") {
                    showSuccessToast("Admin logged in through Staff route!");
                }
            }

            showSuccessToast(`Welcome back, ${user.displayName || "User"}!`);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            showErrorToast("Invalid credentials. Please verify your email and password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins px-4 py-8">
            <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-145">

                {/* LEFT SIDE - Elegant Blueprint & Branding */}
                <div className="hidden md:flex flex-col justify-between w-1/2 bg-linear-to-tr from-slate-950 via-slate-900 to-slate-900 p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05]" style={{
                        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "24px 28px",
                    }} />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="bg-amber-400 text-slate-950 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-400/20">
                                M
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-white tracking-wide">MaintainIQ</h1>
                                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">Asset Lifecycle Ops</p>
                            </div>
                        </div>
                    </div>

                    {/* Minimal security layout rendering */}
                    <div className="relative z-10 flex flex-col items-center justify-center py-12">
                        <div className="relative w-48 h-48 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/50 backdrop-blur-sm animate-pulse">
                            <CheckSquare size={72} className="text-amber-400" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-white mb-2">
                            Secure. Track. Manage.
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            A smart, modern system engineered for managing and maintaining assets efficiently in real-time.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE - Authentication form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isAdminLogin ? "Admin Control Portal" : "Staff Control Center"}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Please input your authorized credentials below.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.com"
                                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full border border-slate-200 rounded-xl pl-11 pr-11 py-2.5 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-400" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="text-amber-600 font-semibold hover:underline">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-950/10"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {loading ? "Authenticating..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="relative flex py-2 items-center">
                            <div className="grow border-t border-slate-200"></div>
                            <span className="shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Gateways</span>
                            <div className="grow border-t border-slate-200"></div>
                        </div>

                        {/* Premium toggle switch button (MUI aesthetic but pure, lightweight Tailwind) */}
                        <button
                            type="button"
                            onClick={() => setIsAdminLogin(!isAdminLogin)}
                            className="w-full border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <ShieldAlert size={16} className={isAdminLogin ? "text-amber-500 animate-bounce" : "text-slate-400"} />
                            {isAdminLogin ? "Login as Teacher / Staff" : "Login as Admin"}
                        </button>

                        <p className="text-sm text-slate-500 text-center mt-3">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-amber-600 font-bold hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;