import React from "react";

export const DeliveryIllustration: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background clouds */}
      <ellipse
        cx="80"
        cy="60"
        rx="40"
        ry="20"
        fill="hsl(var(--medical-blue-light))"
        opacity="0.5"
      />
      <ellipse
        cx="420"
        cy="80"
        rx="50"
        ry="25"
        fill="hsl(var(--mint-light))"
        opacity="0.5"
      />
      <ellipse
        cx="350"
        cy="50"
        rx="30"
        ry="15"
        fill="hsl(var(--medical-blue-light))"
        opacity="0.3"
      />

      {/* Road */}
      <path
        d="M0 320 Q 150 300 250 320 T 500 300"
        stroke="hsl(var(--border))"
        strokeWidth="40"
        fill="none"
      />
      <path
        d="M0 320 Q 150 300 250 320 T 500 300"
        stroke="hsl(var(--muted))"
        strokeWidth="4"
        strokeDasharray="20 15"
        fill="none"
      />

      {/* Scooter base */}
      <g className="animate-float">
        {/* Wheels */}
        <circle cx="160" cy="310" r="30" fill="hsl(var(--foreground))" />
        <circle cx="160" cy="310" r="20" fill="hsl(var(--muted))" />
        <circle cx="160" cy="310" r="8" fill="hsl(var(--foreground))" />

        <circle cx="320" cy="310" r="30" fill="hsl(var(--foreground))" />
        <circle cx="320" cy="310" r="20" fill="hsl(var(--muted))" />
        <circle cx="320" cy="310" r="8" fill="hsl(var(--foreground))" />

        {/* Scooter body */}
        <path
          d="M140 280 L180 280 L200 240 L280 240 L300 280 L340 280 L340 300 L140 300 Z"
          fill="hsl(var(--primary))"
        />
        <rect
          x="180"
          y="250"
          width="100"
          height="30"
          rx="5"
          fill="hsl(var(--primary))"
        />

        {/* Seat */}
        <ellipse
          cx="230"
          cy="235"
          rx="40"
          ry="12"
          fill="hsl(var(--foreground))"
        />

        {/* Handlebar */}
        <rect
          x="280"
          y="180"
          width="8"
          height="60"
          rx="4"
          fill="hsl(var(--muted-foreground))"
        />
        <rect
          x="265"
          y="175"
          width="40"
          height="10"
          rx="5"
          fill="hsl(var(--foreground))"
        />

        {/* Front light */}
        <circle cx="310" cy="270" r="8" fill="hsl(var(--orange))" />

        {/* Delivery box */}
        <rect
          x="145"
          y="180"
          width="80"
          height="60"
          rx="8"
          fill="hsl(var(--secondary))"
        />
        <rect
          x="155"
          y="190"
          width="60"
          height="40"
          rx="4"
          fill="hsl(var(--background))"
        />

        {/* Cross symbol on box */}
        <rect
          x="178"
          y="198"
          width="14"
          height="24"
          rx="2"
          fill="hsl(var(--primary))"
        />
        <rect
          x="172"
          y="205"
          width="26"
          height="10"
          rx="2"
          fill="hsl(var(--primary))"
        />

        {/* Driver */}
        {/* Helmet */}
        <ellipse cx="250" cy="160" rx="28" ry="25" fill="hsl(var(--primary))" />
        <ellipse
          cx="250"
          cy="165"
          rx="22"
          ry="18"
          fill="hsl(var(--primary-foreground))"
          opacity="0.3"
        />

        {/* Body */}
        <path
          d="M225 185 Q 225 220 230 240 L 270 240 Q 275 220 275 185"
          fill="hsl(var(--secondary))"
        />

        {/* Arms */}
        <path
          d="M225 190 Q 200 200 205 230"
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M275 190 Q 290 195 285 220"
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Floating medical items */}
      <g className="animate-pulse-gentle">
        {/* Pill */}
        <g transform="translate(400, 150) rotate(-15)">
          <rect
            x="0"
            y="0"
            width="40"
            height="20"
            rx="10"
            fill="hsl(var(--primary))"
          />
          <rect
            x="20"
            y="0"
            width="20"
            height="20"
            rx="10"
            fill="hsl(var(--secondary))"
          />
        </g>

        {/* Medicine bottle */}
        <g transform="translate(70, 120)">
          <rect
            x="0"
            y="10"
            width="30"
            height="40"
            rx="4"
            fill="hsl(var(--secondary))"
          />
          <rect
            x="5"
            y="0"
            width="20"
            height="15"
            rx="3"
            fill="hsl(var(--muted-foreground))"
          />
          <rect
            x="8"
            y="25"
            width="14"
            height="15"
            rx="2"
            fill="hsl(var(--background))"
          />
        </g>

        {/* Heart rate */}
        <g transform="translate(420, 220)">
          <circle
            cx="20"
            cy="20"
            r="20"
            fill="hsl(var(--destructive))"
            opacity="0.2"
          />
          <path
            d="M10 20 L15 20 L18 10 L22 30 L25 15 L30 20"
            stroke="hsl(var(--destructive))"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </g>

      {/* Speed lines */}
      <g opacity="0.5">
        <line
          x1="80"
          y1="260"
          x2="120"
          y2="260"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="280"
          x2="110"
          y2="280"
          stroke="hsl(var(--secondary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="70"
          y1="300"
          x2="100"
          y2="300"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
