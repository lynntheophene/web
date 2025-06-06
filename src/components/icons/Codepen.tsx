import type { SVGProps } from 'react'

export function Codepen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden='true'
      xmlns='http://www.w3.org/2000/svg'
      width='1em'
      height='1em'
      viewBox='0 0 256 256'
      {...props}
    >
      <path
        fill='currentColor'
        d='m234.85 90.72l-104-56a6 6 0 0 0-5.68 0l-104 56A6 6 0 0 0 18 96v64a6 6 0 0 0 3.15 5.28l104 56a6 6 0 0 0 5.68 0l104-56A6 6 0 0 0 238 160V96a6 6 0 0 0-3.15-5.28M226 150l-40.77-22L226 106Zm-53.43-28.77L134 100.42V50l85.34 46Zm-44.57 24L96.08 128L128 110.81L159.92 128ZM122 50v50.38l-38.57 20.8L36.66 96Zm-92 56l40.77 22L30 150Zm53.43 28.76L122 155.58V206l-85.34-46ZM134 206v-50.42l38.57-20.77L219.34 160Z'
      ></path>
    </svg>
  )
}
