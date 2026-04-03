"use client";

export default function LogisticsTicker() {
  return (
    <div className="relative w-full h-12 overflow-hidden bg-stone-950 flex items-center border-b-2 border-violet-500 shadow-[0_4px_20px_-2px_rgba(167,139,250,0.7)] z-50">
  
      
      <div className="animate-ticker">
        <p className="text-sm font-black uppercase tracking-[0.4em] text-white flex items-center">
          <span>
            <span className="text-violet-400 mr-2">📍 Pickup:</span> 
            Fridays @ 12:00PM (Nextech High)
          </span>

          <span className="mx-20 text-stone-800">//</span> 

          <span>
            <span className="text-violet-400 mr-2">📦 Shipping:</span> 
            All orders sent every Friday
          </span>

          <span className="mx-20 text-stone-800">//</span> 

          <span>
            <span className="text-violet-400 mr-2">📍 Pickup:</span> 
            Fridays @ 12:00PM (Nextech High)
          </span>

          <span className="mx-20 text-stone-800">//</span> 

          <span>
            <span className="text-violet-400 mr-2">📦 Shipping:</span> 
            All orders sent every Friday
          </span>
          
          <span className="ml-[20vw]"></span> 
        </p>
      </div>
    </div>
  );
}