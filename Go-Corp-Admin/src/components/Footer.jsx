import React from 'react';
import { Shield, Globe, Landmark, LayoutDashboard, Building2, Trees } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full pb-8 pt-4 px-4 relative z-20">
            <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-70">
                {/* Mock logos styled like government seals */}
                <div className="flex flex-col items-center gap-2">
                    <Shield size={36} strokeWidth={1.5} />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">State of<br />Florida</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Landmark size={36} strokeWidth={1.5} />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">Dept of<br />Agriculture</div>
                </div>
                <div className="flex flex-col items-center gap-2 max-w-[120px]">
                    <div className="flex items-center gap-2">
                        <Globe size={40} strokeWidth={1} />
                        <div className="text-left font-bold leading-tight">
                            <span className="text-sm">DARS</span><br />
                            <span className="text-[8px] opacity-70">Virginia Dept</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2 flex-row items-center">
                    <Building2 size={36} strokeWidth={1.2} />
                    <div className="text-left leading-tight ml-2">
                        <span className="text-[13px] font-bold whitespace-nowrap">Choctaw Nation</span><br />
                        <span className="text-[10px] opacity-80 font-medium tracking-wide">Summer EBT</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Trees size={40} strokeWidth={1.2} />
                    <div className="text-[11px] font-bold uppercase tracking-wide leading-[1.1]">Montana<br />DPHHS</div>
                </div>
                <div className="flex gap-2 items-center">
                    <LayoutDashboard size={40} strokeWidth={1.5} />
                    <div className="text-[16px] font-bold lowercase tracking-tighter">dss</div>
                </div>
            </div>
        </footer>
    );
}
