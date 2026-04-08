import React from "react";

const statsData = [
  { value: "$0.015", label: "Presale Price", delay: "0s" },
  { value: "$0.02", label: "Launch Price", delay: "0.1s" },
  { value: "1M+", label: "Reward Tokens", delay: "0.2s" },
];

const Stats = () => {
  return (
    <div className="w-full flex justify-center bg-[#072542] pt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="group relative flex flex-col items-center justify-center cursor-pointer animate-fade-in-up"
            style={{ animationDelay: stat.delay }}
          >
            {/* Animated Gradient Border */}
            {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00c6ff] via-[#0072ff] to-[#00ffe0] opacity-60 blur-xl animate-gradient-move"></div> */}

            {/* Inner Card */}
            <div className="relative flex flex-col items-center justify-center bg-[#072542] rounded-xl w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44">
              <div
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 text-white transition-transform group-hover:scale-110 glow"
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: stat.delay,
                }}
              >
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-[#E8BE04] uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.8s forwards;
          }

          .animate-gradient-move {
            background-size: 200% 200%;
            animation: gradient-move 4s ease infinite;
          }

        //   .glow {
        //     text-shadow: 0 0 6px #00c6ff, 0 0 10px #0072ff, 0 0 20px #00ffe0;
        //   }
        `}
      </style>
    </div>
  );
};

export default Stats;