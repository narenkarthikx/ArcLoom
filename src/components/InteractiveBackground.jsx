export default function InteractiveBackground({ children }) {
    return (
        <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden text-slate-100 selection:bg-indigo-500/30 font-sans">

            {/* Simple Background Gradients */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-slate-950" />
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-violet-500/5 rounded-full blur-[100px]" />

                {/* Texture Overlay - Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex min-h-screen">
                {children}
            </div>
        </div>
    );
}
