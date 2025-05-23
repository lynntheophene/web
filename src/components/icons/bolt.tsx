import type { SVGProps } from 'react'

export function Bolt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 384 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M192 0L0 288h160l-32 224 192-288H224l32-224H192z"
      />
    </svg>
  )
}
