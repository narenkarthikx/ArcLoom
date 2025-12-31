import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InteractiveBackground from '../components/InteractiveBackground';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
                alert('Check your email for the confirmation link!');
            }
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <InteractiveBackground>
            <div className="min-h-screen w-full flex items-center justify-center p-4 z-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2 py-1 filter drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                                ArcLoom
                            </h1>
                            <p className="text-slate-400 mt-2">
                                {isLogin ? 'Welcome back, weaver.' : 'Start weaving your destiny.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all text-slate-100 placeholder-slate-600"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all text-slate-100 placeholder-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                                <span className="relative z-10">{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-white/5 pt-6">
                            <p className="text-sm text-slate-400">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                                >
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </InteractiveBackground>
    );
}
