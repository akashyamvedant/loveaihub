import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthBannerProps {
  onClose: () => void;
  onOpenAuth: () => void;
}

export function AuthBanner({ onClose, onOpenAuth }: AuthBannerProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">Google Sign-in Temporarily Unavailable</p>
            <p className="text-slate-300 text-sm">Please use email registration or try Google sign-in again later.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAuth}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            Sign Up with Email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}