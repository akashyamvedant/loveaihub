export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float" />
      <div 
        className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" 
        style={{ animationDelay: '-2s' }}
      />
      <div 
        className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-float" 
        style={{ animationDelay: '-4s' }}
      />
      <div 
        className="absolute top-1/3 left-1/3 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-float" 
        style={{ animationDelay: '-1s' }}
      />
      <div 
        className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl animate-float" 
        style={{ animationDelay: '-3s' }}
      />

      {/* Neural Network Lines */}
      <div className="neural-lines opacity-30" />

      {/* Matrix Rain Effect */}
      <div className="matrix-rain opacity-20" />

      {/* Floating AI Particles */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary rounded-full animate-float opacity-60" />
      <div 
        className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-500 rounded-full animate-float opacity-40" 
        style={{ animationDelay: '-1.5s' }}
      />
      <div 
        className="absolute top-3/4 right-1/2 w-3 h-3 bg-cyan-500 rounded-full animate-float opacity-50" 
        style={{ animationDelay: '-2.5s' }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-float" />
      <div 
        className="absolute bottom-10 left-10 w-36 h-36 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-float" 
        style={{ animationDelay: '-3s' }}
      />

      {/* Holographic Grid Lines */}
      <div className="absolute inset-0 holographic opacity-10" />

      {/* Particle Background */}
      <div className="particles-bg opacity-40" />
    </div>
  );
}
