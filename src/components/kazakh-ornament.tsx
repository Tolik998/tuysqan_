import Image from "next/image";

export function KazakhOrnament() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-10 overflow-hidden text-[#D7B56D] opacity-45 sm:h-14 lg:opacity-55"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 960 56"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="qoshqar-muyiz"
            width="120"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 28h16c0-12 8-20 20-20 9 0 16 6 16 15 0 7-5 12-12 12-5 0-9-4-9-9 0-4 3-7 7-7 3 0 6 2 7 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M120 28h-16c0-12-8-20-20-20-9 0-16 6-16 15 0 7 5 12 12 12 5 0 9-4 9-9 0-4-3-7-7-7-3 0-6 2-7 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m52 28 8-8 8 8-8 8-8-8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="28" r="2" fill="currentColor" />
          </pattern>
          <linearGradient id="ornament-fade" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="white" stopOpacity="0" />
            <stop offset="0.12" stopColor="white" />
            <stop offset="0.88" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="ornament-mask">
            <rect width="960" height="56" fill="url(#ornament-fade)" />
          </mask>
        </defs>
        <g mask="url(#ornament-mask)">
          <rect width="960" height="56" fill="url(#qoshqar-muyiz)" />
          <path
            d="M0 28h960"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
        </g>
      </svg>
    </div>
  );
}

export function KazakhCornerOrnament() {
  return (
    <div
      className="pointer-events-none absolute right-6 top-0 hidden h-[340px] w-[246px] opacity-55 lg:block xl:right-10 xl:h-[390px] xl:w-[282px]"
      aria-hidden="true"
    >
      <Image
        src="/brand-assets/page31-corner-ornament.svg"
        alt=""
        fill
        sizes="282px"
        className="object-contain object-right-top"
      />
    </div>
  );
}
