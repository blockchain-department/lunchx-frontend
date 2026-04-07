import React, { useEffect, useRef, useState } from "react";
import {
  Film,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Zap,
  Mail,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#072542]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className=" rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-14 h-14" />
            </div>
            <span className="font-medium text-white">Launch X</span>
          </div>

          <div className="flex gap-2 text-sm text-white">
            <Mail className="hover:text-[#E8BE04]" />
            <a
              href="mailto: mitch@rivermindpictures.com"
              className="hover:text-[#E8BE04] text-white transition-colors"
            >
              presale@launch X.com
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-white">
          © 2026 Launch X. Built on Solana.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
