"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-700">
      <div className="relative flex flex-col items-center">
        {/* Glow Effect behind logo */}
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl animate-pulse"></div>
        
        {/* Animated Logo Container */}
        <div className="relative h-40 w-40 flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping [animation-duration:3s]"></div>
            
            <div className="relative h-32 w-32 animate-bounce [animation-duration:2s]">
                <Image
                    src="/logo.png"
                    alt="Anozon Logo"
                    fill
                    sizes="128px"
                    className="object-contain drop-shadow-xl"
                    priority
                />
            </div>
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-12 flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"></div>
          </div>
          
          <div className="overflow-hidden h-1 w-48 rounded-full bg-primary/10">
            <div className="h-full bg-primary animate-[shimmer_2s_infinite] origin-left scale-x-0 w-full" 
                 style={{ animationName: 'progress' }}></div>
          </div>

          <p className="text-sm font-medium tracking-wide text-muted-foreground/80 animate-pulse uppercase">
            Loading Excellence...
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: scaleX(0); opacity: 0.5; }
          50% { transform: scaleX(0.7); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
