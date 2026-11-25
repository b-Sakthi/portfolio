import type { SVGProps } from "react";

interface StarMotifProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Minimal 4-point editorial star accent inspired by the dark portfolio reference.
 * Marked aria-hidden by default as purely decorative geometry.
 */
export function StarMotif({ size = 24, className = "", ...props }: StarMotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4L12 1Z"
        fill="currentColor"
      />
    </svg>
  );
}
