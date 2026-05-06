/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavLink } from "react-router-dom";
import { motion } from "motion/react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-neutral-100">
      <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-black tracking-tighter text-neutral-900">
          |ketAI&gt;
        </NavLink>
        <div className="flex gap-10">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:text-neutral-900 border-b-2 ${
                isActive ? "text-neutral-900 border-neutral-900" : "text-neutral-400 border-transparent"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/strange-works" 
            className={({ isActive }) => 
              `text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:text-neutral-900 border-b-2 ${
                isActive ? "text-neutral-900 border-neutral-900" : "text-neutral-400 border-transparent"
              }`
            }
          >
            Strange Works
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
