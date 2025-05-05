import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import ParticleTitle from "./ParticleTitle";

export default function Navbar() {
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    
    // Save preference to localStorage
    if (document.documentElement.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || 
        (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/20 z-0"></div>
      <div className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          <Link href="/" className="block relative">
            <div className="relative">
              <ParticleTitle 
                text="Zapomnit 2.0" 
                className="text-5xl font-extrabold gradient-text tracking-tight"
              />
            </div>
          </Link>
          <p className="ml-4 text-gray-500 dark:text-gray-400 hidden md:block text-sm italic">
            Modern Flashcards with LaTeX
          </p>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
              location === "/" 
                ? "text-primary border-b-2 border-primary pb-1" 
                : "text-gray-600 dark:text-gray-300 hover:text-primary hover:dark:text-primary"
            }`}>
              Home
          </Link>
          <Link href="/about" className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
              location === "/about" 
                ? "text-primary border-b-2 border-primary pb-1" 
                : "text-gray-600 dark:text-gray-300 hover:text-primary hover:dark:text-primary"
            }`}>
              About
          </Link>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode} 
            aria-label="Toggle dark mode"
            className="rounded-full w-10 h-10 border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
          >
            {isDarkMode ? <SunIcon className="h-5 w-5 text-yellow-500" /> : <MoonIcon className="h-5 w-5 text-blue-500" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
