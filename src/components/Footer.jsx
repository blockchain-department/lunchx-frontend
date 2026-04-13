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
    <footer className="border-t w-full border-tertiary/5 py-12 bg-secondary flex items-center justify-center">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className=" rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-14 h-14" />
            </div>
            <span className="font-medium text-tertiary">LaunchX</span>
          </div>

          <div className="flex gap-2 text-sm text-tertiary">
            <Mail className="hover:text-primary" />
            <a
              href="mailto:admin@launchxcoin.io"
              className="hover:text-primary text-tertiary transition-colors"
            >
              admin@launchxcoin.io
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-tertiary/5 text-center text-sm text-tertiary">
          © 2026 LaunchX. Built on Solana.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
