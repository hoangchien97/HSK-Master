interface MessengerIconProps {
  size?: number;
  className?: string;
}

export function MessengerIcon({ size = 32, className = "fill-white" }: MessengerIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.51 3.03 7.42V22l2.76-1.52c1.3.36 2.69.56 4.14.56 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.09 12.91l-2.61-2.77-5.11 2.77 5.62-5.96 2.68 2.77 5.03-2.77-5.61 5.96z" />
    </svg>
  );
}
