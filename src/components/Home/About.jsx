import React, { useEffect, useRef, useState } from 'react';
import { Film, ArrowRight, Sparkles, Lock, Globe, Zap } from 'lucide-react';
import Bg from "../../assets/global/bgggg.jpeg";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const About = () => {

  const cardsRef = useRef([]);

  const features = [
    { icon: Lock, title: 'Smart Contracts', desc: 'Automated profit distribution via blockchain' },
    { icon: Globe, title: 'Global Access', desc: 'Invest from anywhere, anytime' },
    { icon: Zap, title: 'Instant Returns', desc: 'Revenue sharing in real-time' }
  ];

  useGSAP(()=>{

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
        trigger: '#about',
        start: 'top 80%',
        end: 'bottom 80%',
        scrub: 1
      }
      })
        .from("#heading",
          {
            x: -150,
            opacity: 0,
          }
        )
        .from("#subHeading",
          {
            x: -150,
            opacity: 0,
          }
        )
        .from(cardsRef.current,
          {
            x: -150,
            opacity: 0,
            stagger: 0.3
          }
        );
    });

    return () => ctx.revert();

  },{})

  return (
    <section id="about" className="py-10 md:py-0 min-h-screen relative flex items-center justify-center" style={{backgroundImage: `url(${Bg})`, backgroundRepeat: "no-repeat", backgroundSize: "cover"}}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight" id="heading">
            Why Invest in RIVERMINED?
          </h2>
          <p className="text-xl text-white" id='subHeading'>
            Traditional film investment is opaque and exclusive. 
            We're democratizing it with blockchain technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="group bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-l-[#E8BE04] hover:border-b-[#E8BE04] hover:bg-white/[0.04] hover:border-white/10"
            >
              <feature.icon className="w-10 h-10 mb-6 text-white group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;