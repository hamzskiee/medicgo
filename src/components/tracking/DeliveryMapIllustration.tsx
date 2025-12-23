import React from "react";

interface DeliveryMapIllustrationProps {
  progress: number; // 0-100
}

export const DeliveryMapIllustration: React.FC<
  DeliveryMapIllustrationProps
> = ({ progress }) => {
  // Calculate scooter position along the path
  const scooterX = 80 + (progress / 100) * 320;
  const scooterY = 280 - (progress / 100) * 140;

  return (
    <div className="relative bg-gradient-to-b from-muted/30 to-muted/50 p-4">
      {/* Distance badge */}
      <div className="absolute top-4 left-4 bg-background rounded-lg px-3 py-2 shadow-sm border">
        <p className="text-xs text-muted-foreground">Jarak tempuh</p>
        <p className="text-lg font-bold text-foreground">2.3 km</p>
      </div>

      <svg
        viewBox="0 0 500 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-64"
      >
        {/* Grid lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 45 + 20}
            y1="20"
            x2={i * 45 + 20}
            y2="300"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="20"
            y1={i * 45 + 20}
            x2="480"
            y2={i * 45 + 20}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Main road path */}
        <path
          d="M 30 290 Q 80 290 120 270 Q 180 240 250 200 Q 320 160 380 140 Q 420 125 450 110"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Dashed route line */}
        <path
          d="M 30 290 Q 80 290 120 270 Q 180 240 250 200 Q 320 160 380 140 Q 420 125 450 110"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8 6"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Start point - Pharmacy */}
        <g transform="translate(30, 290)">
          <circle r="8" fill="hsl(var(--secondary))" />
          <circle r="4" fill="hsl(var(--background))" />
        </g>

        {/* Destination point B */}
        <g transform="translate(450, 110)">
          <circle r="20" fill="hsl(var(--foreground))" />
          <text
            x="0"
            y="6"
            textAnchor="middle"
            fill="hsl(var(--background))"
            fontSize="16"
            fontWeight="bold"
          >
            B
          </text>
        </g>
        <text
          x="450"
          y="150"
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontSize="12"
          fontWeight="500"
        >
          Alamat Anda
        </text>

        {/* Scooter/Delivery icon */}
        <g transform={`translate(${scooterX}, ${scooterY})`}>
          {/* Glow effect */}
          <circle r="25" fill="hsl(var(--orange))" opacity="0.2" />
          <circle r="18" fill="hsl(var(--orange))" opacity="0.3" />

          {/* Scooter background */}
          <circle r="14" fill="hsl(var(--orange))" />

          {/* Scooter emoji/icon */}
          <text x="0" y="5" textAnchor="middle" fontSize="14">
            🛵
          </text>
        </g>

        {/* Secondary roads */}
        <path
          d="M 100 50 L 100 200"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M 200 80 L 200 250"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M 300 40 L 300 180"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M 50 180 L 250 180"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M 280 100 L 480 100"
          stroke="hsl(var(--border))"
          strokeWidth="3"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
