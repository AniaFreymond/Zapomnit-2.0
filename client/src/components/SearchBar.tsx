import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, ScanSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search input to avoid too many requests
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    // Clean up the timer
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, onSearch]);

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
    inputRef.current?.focus();
  };
  
  return (
    <div className={`relative max-w-2xl mx-auto transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
      {/* Background glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 blur-lg opacity-0 transition-opacity duration-500 rounded-full"
        style={{ opacity: isFocused ? 0.7 : 0 }}
      ></div>

      <div 
        className={`
          relative flex items-center justify-between bg-white/90 dark:bg-gray-900/80 
          backdrop-blur-sm border-2 rounded-full px-6 py-3 transition-all duration-300
          ${isFocused 
            ? 'shadow-[0_0_20px_rgba(96,165,250,0.5)] border-blue-400 dark:shadow-[0_0_25px_rgba(59,130,246,0.5)] dark:border-blue-500' 
            : 'shadow-md border-gray-200 dark:border-gray-800'}
        `}
      >
        {/* Light reflection effect */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div 
            className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] opacity-70 dark:opacity-30 transition-transform duration-1500"
            style={{ transform: `translateX(${isFocused ? '200%' : '-100%'}) skewX(-30deg)` }}
          ></div>
        </div>

        <div className="flex items-center flex-1 relative z-10">
          {isFocused ? (
            <ScanSearch className="h-5 w-5 mr-3 text-blue-500 transition-all animate-pulse" />
          ) : (
            <Search className="h-5 w-5 mr-3 text-gray-400 transition-all" />
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for mathematical definitions, equations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="border-0 p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
        </div>
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 h-8 w-8 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 relative z-10"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Search pulse effect */}
      {isFocused && (
        <div className="absolute inset-0 rounded-full pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-blue-400/5 dark:bg-blue-600/10 animate-ping-slow"></div>
        </div>
      )}
    </div>
  );
}
