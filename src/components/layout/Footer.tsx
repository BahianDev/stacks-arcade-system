import React from 'react';
import { Search } from 'lucide-react';

interface FooterProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  showSearch?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ 
  searchTerm = '', 
  onSearchChange, 
  showSearch = false 
}) => {
  return (
    <footer className="relative z-10 border-t-2" style={{ borderColor: '#FFFFFF', background: 'transparent' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Search Games */}
          {showSearch && onSearchChange && (
            <div className="relative order-2 md:order-1">
              <div className="flex items-center">
                <Search className="absolute left-3 w-4 h-4 z-10" style={{ color: '#FFFFFF' }} />
                <input
                  type="text"
                  placeholder="SEARCH GAMES..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-black border-2 focus:outline-none transition-all duration-200 w-48 md:w-64 font-mono text-sm tracking-wider"
                  style={{
                    borderColor: '#FFFFFF',
                    color: '#FFFFFF',
                    fontFamily: "'Press Start 2P', monospace"
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Copyright */}
          <div className="text-center order-1 md:order-2">
            <p className="text-xs md:text-sm tracking-wider font-mono" style={{ 
              color: '#FFFFFF',
              fontFamily: "'Press Start 2P', monospace"
            }}>
              © 2025 SANSALABS • RETRO ARCADE COLLECTION
            </p>
          </div>
          
          {/* Links */}
          <div className="flex items-center space-x-4 order-3">
            <button className="hover:opacity-80 transition-colors duration-200 font-bold tracking-wider text-xs md:text-sm font-mono" style={{ 
              color: '#FFFFFF',
              fontFamily: "'Press Start 2P', monospace"
            }}>
              ABOUT
            </button>
            <button className="hover:opacity-80 transition-colors duration-200 font-bold tracking-wider text-xs md:text-sm font-mono" style={{ 
              color: '#FFFFFF',
              fontFamily: "'Press Start 2P', monospace"
            }}>
              CREDITS
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};