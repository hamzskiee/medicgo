import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export const MedicineIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <rect
      x="8"
      y="12"
      width="32"
      height="28"
      rx="4"
      fill="hsl(var(--primary))"
    />
    <rect
      x="16"
      y="4"
      width="16"
      height="12"
      rx="3"
      fill="hsl(var(--muted-foreground))"
    />
    <rect
      x="18"
      y="8"
      width="12"
      height="4"
      rx="1"
      fill="hsl(var(--background))"
    />
    <rect
      x="12"
      y="22"
      width="24"
      height="14"
      rx="2"
      fill="hsl(var(--background))"
    />
    <rect
      x="21"
      y="25"
      width="6"
      height="8"
      rx="1"
      fill="hsl(var(--primary))"
    />
    <rect
      x="18"
      y="28"
      width="12"
      height="2"
      rx="1"
      fill="hsl(var(--primary))"
    />
  </svg>
);

export const VitaminIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <circle cx="24" cy="24" r="18" fill="hsl(var(--orange-light))" />
    <circle cx="24" cy="24" r="12" fill="hsl(var(--orange))" />
    <text
      x="24"
      y="29"
      textAnchor="middle"
      fill="white"
      fontSize="14"
      fontWeight="bold"
    >
      C
    </text>
    <circle cx="38" cy="12" r="6" fill="hsl(var(--secondary))" />
    <text
      x="38"
      y="15"
      textAnchor="middle"
      fill="white"
      fontSize="8"
      fontWeight="bold"
    >
      +
    </text>
  </svg>
);

export const DeviceIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <rect
      x="8"
      y="14"
      width="32"
      height="24"
      rx="4"
      fill="hsl(var(--primary))"
    />
    <rect
      x="12"
      y="18"
      width="24"
      height="12"
      rx="2"
      fill="hsl(var(--background))"
    />
    <path
      d="M16 24 L20 24 L22 20 L26 28 L28 22 L32 24"
      stroke="hsl(var(--secondary))"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="24" cy="34" r="2" fill="hsl(var(--background))" />
    <rect
      x="20"
      y="38"
      width="8"
      height="4"
      rx="1"
      fill="hsl(var(--muted-foreground))"
    />
  </svg>
);

export const CareIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <circle cx="24" cy="20" r="14" fill="hsl(var(--mint-light))" />
    <path
      d="M24 10 C20 10 16 14 16 18 C16 26 24 32 24 32 C24 32 32 26 32 18 C32 14 28 10 24 10"
      fill="hsl(var(--secondary))"
    />
    <rect
      x="20"
      y="34"
      width="8"
      height="10"
      rx="2"
      fill="hsl(var(--primary))"
    />
    <rect
      x="22"
      y="36"
      width="4"
      height="6"
      rx="1"
      fill="hsl(var(--background))"
    />
  </svg>
);

export const PrescriptionIcon: React.FC<IconProps> = ({
  className,
  size = 48,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <rect
      x="8"
      y="4"
      width="32"
      height="40"
      rx="4"
      fill="hsl(var(--background))"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
    />
    <circle cx="24" cy="16" r="8" fill="hsl(var(--medical-blue-light))" />
    <path
      d="M21 16 L23 18 L28 13"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="14" y="28" width="20" height="2" rx="1" fill="hsl(var(--muted))" />
    <rect x="14" y="34" width="16" height="2" rx="1" fill="hsl(var(--muted))" />
  </svg>
);

export const DeliveryIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <rect
      x="4"
      y="16"
      width="24"
      height="20"
      rx="3"
      fill="hsl(var(--secondary))"
    />
    <rect
      x="8"
      y="20"
      width="16"
      height="12"
      rx="2"
      fill="hsl(var(--background))"
    />
    <rect
      x="13"
      y="23"
      width="6"
      height="6"
      rx="1"
      fill="hsl(var(--primary))"
    />
    <path d="M28 20 L36 20 L44 28 L44 36 L28 36 Z" fill="hsl(var(--primary))" />
    <circle cx="14" cy="40" r="4" fill="hsl(var(--foreground))" />
    <circle cx="38" cy="40" r="4" fill="hsl(var(--foreground))" />
    <rect
      x="34"
      y="24"
      width="6"
      height="6"
      rx="1"
      fill="hsl(var(--medical-blue-light))"
    />
  </svg>
);

export const PharmacistIcon: React.FC<IconProps> = ({
  className,
  size = 48,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <circle cx="24" cy="14" r="10" fill="hsl(var(--primary))" />
    <circle cx="24" cy="12" r="6" fill="hsl(var(--background))" />
    <circle cx="22" cy="11" r="1" fill="hsl(var(--foreground))" />
    <circle cx="26" cy="11" r="1" fill="hsl(var(--foreground))" />
    <path
      d="M22 14 Q24 16 26 14"
      stroke="hsl(var(--foreground))"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M14 26 L14 44 L34 44 L34 26 Q34 20 24 20 Q14 20 14 26"
      fill="hsl(var(--background))"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
    />
    <rect
      x="20"
      y="28"
      width="8"
      height="10"
      rx="1"
      fill="hsl(var(--secondary))"
    />
    <rect
      x="22"
      y="30"
      width="4"
      height="1"
      rx="0.5"
      fill="hsl(var(--background))"
    />
    <rect
      x="22"
      y="33"
      width="4"
      height="1"
      rx="0.5"
      fill="hsl(var(--background))"
    />
  </svg>
);
