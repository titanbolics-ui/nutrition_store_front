import React from "react"

import { IconProps } from "types/icon"

/** Glass ampoule: narrow snap-off neck flaring into a body with a fill line. */
const Ampoule: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M8.75 2.5H11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 2.5V7L7.25 9.5V16C7.25 16.8284 7.92157 17.5 8.75 17.5H11.25C12.0784 17.5 12.75 16.8284 12.75 16V9.5L10.75 7V2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.25 12H12.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Ampoule
