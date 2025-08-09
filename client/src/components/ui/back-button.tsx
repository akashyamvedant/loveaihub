import { useLocation } from "wouter";
import { Button } from "./button";
import { ArrowLeft, Home } from "lucide-react";

interface BackButtonProps {
  label?: string;
  destination?: string;
  className?: string;
  showIcon?: boolean;
}

export function BackButton({ 
  label = "Back to Dashboard", 
  destination = "/", 
  className = "",
  showIcon = true 
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation(destination);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-6 left-6 z-50 ${className}`}
    >
      <Button
        variant="ghost"
        onClick={handleBack}
        className="group bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/50 hover:border-purple-500/50 text-white hover:text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105"
      >
        <div className="flex items-center gap-3">
          {showIcon && (
            <div className="relative">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0 }}
                animate={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Home className="w-4 h-4 text-purple-400" />
              </motion.div>
            </div>
          )}
          <span className="font-medium">{label}</span>
          <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </Button>
    </motion.div>
  );
}

export function FloatingBackButton({ 
  label = "Dashboard", 
  destination = "/",
  className = "" 
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation(destination);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={`fixed top-6 left-6 z-50 ${className}`}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Main button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="relative w-12 h-12 p-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-600/50 hover:border-purple-500/70 rounded-full shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-110 group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-purple-300 transition-all duration-200 group-hover:-translate-x-0.5" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-150 pointer-events-none">
          <div className="bg-slate-800/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg border border-slate-600/50 shadow-lg whitespace-nowrap">
            {label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800/95 border-l border-b border-slate-600/50 rotate-45"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MinimalBackButton({ 
  label = "Back", 
  destination = "/",
  className = "" 
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation(destination);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-6 ${className}`}
    >
      <Button
        variant="ghost"
        onClick={handleBack}
        className="group text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        {label}
      </Button>
    </motion.div>
  );
}

export default BackButton;
