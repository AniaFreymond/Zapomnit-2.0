import { Link } from "wouter";
import { GithubIcon, TwitterIcon, MailIcon, InfoIcon, InstagramIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm shadow-md border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold gradient-text mb-4">Zapomnit 2.0</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              A futuristic flashcard application designed for mathematics and technical learning.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <GithubIcon className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="mailto:info@zapomnit.com" className="text-gray-500 hover:text-primary transition-colors">
                <MailIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> LaTeX Support
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Tag Organization
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Advanced Search
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-primary">✓</span> Dark/Light Mode
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            © {new Date().getFullYear()} Zapomnit 2.0. All rights reserved.
          </p>
          <div className="flex justify-center items-center mt-2 text-sm">
            <InfoIcon className="h-4 w-4 mr-1" />
            <span>Made with cutting-edge technologies for the future of learning.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
