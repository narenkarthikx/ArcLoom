import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtext, icon: Icon, color = "indigo" }) {
    const colorStyles = {
        indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400",
        violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400",
        emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
        rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
    };

    // Default to indigo if color key not found
    const style = colorStyles[color] || colorStyles.indigo;
    const highlightColor = style.split(' ').pop(); // e.g. text-indigo-400

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${style} backdrop-blur-md p-6 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150 translate-x-1/4 -translate-y-1/4">
                {Icon && <Icon size={80} />}
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${highlightColor}`}>
                        {Icon && <Icon size={20} />}
                    </div>
                    <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                </div>

                <div className="text-3xl font-bold text-slate-100 mb-1 tracking-tight">
                    {value}
                </div>

                {subtext && (
                    <p className="text-xs text-slate-500 font-medium">
                        {subtext}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
