import React from "react";

const statsData = [
  { value: "$0.00420", label: "Presale Price" },
  { value: "$0.01", label: "Launch Price"},
  { value: "2.7M+", label: "Reward Tokens"},
  {value: "4.2B", label : "Total Supply"}
];

const Stats = () => {
  return (
    <div className="w-full flex justify-center bg-secondary pt-10">
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-12 text-center">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="group relative flex flex-col items-center justify-center cursor-pointer animate-fade-in-up"
            style={{ animationDelay: stat.delay }}
          >
            
            <div className="relative flex flex-col items-center justify-center bg-secondary rounded-xl">
              <div
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 text-tertiary transition-transform group-hover:scale-110 glow"
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: stat.delay,
                }}
              >
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-primary font-semibold uppercase tracking-wider">
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