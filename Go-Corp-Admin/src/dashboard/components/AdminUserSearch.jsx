import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import * as adminAPI from '../../services/adminAPI';

export default function AdminUserSearch({ officeId, onSelect, onClear }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const users = await adminAPI.searchEmployees(val, officeId);
            setResults(users);
            setShowResults(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = (user) => {
        setQuery(`${user.name.first_name} ${user.name.last_name}`);
        setShowResults(false);
        onSelect(user);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
        onClear();
    };

    return (
        <div ref={searchRef} className="w-full">
            <div className={`relative group transition-all duration-300 ${showResults && results.length > 0 ? 'rounded-t-2xl bg-white shadow-xl' : 'rounded-2xl bg-white border border-dash-border shadow-sm group-hover:shadow-md'}`}>
                <div className="flex items-center px-4 py-3">
                    <Search className={`w-5 h-5 transition-colors ${isSearching ? 'text-dash-blue animate-pulse' : 'text-dash-muted'}`} />
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search employee ride..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-dash-text px-3 placeholder:text-dash-muted/50"
                    />
                    {query && (
                        <button onClick={clearSearch} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={16} className="text-dash-muted" />
                        </button>
                    )}
                </div>

                {/* Autocomplete Results */}
                {showResults && results.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border border-dash-border border-t-0 shadow-2xl rounded-b-[1.5rem] overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[9999]">

                        {results.map((user) => (
                            <button 
                                key={user._id}
                                onClick={() => handleSelect(user)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dash-bg transition-colors border-b border-gray-50 last:border-none group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-dash-blue/10 flex items-center justify-center text-dash-blue group-hover:bg-dash-blue group-hover:text-white transition-all">
                                    <User size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-dash-text">{user.name.first_name} {user.name.last_name}</p>
                                    <p className="text-[10px] text-dash-muted font-bold uppercase">{user.email}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
