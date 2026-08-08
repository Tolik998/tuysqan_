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
      className="pointer-events-none absolute -right-5 top-0 hidden h-80 w-80 overflow-hidden text-[#D9B98F] opacity-38 lg:block"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M224-20c-20 57 32 87 39 139 8 59-25 103-78 103-38 0-62-25-54-55 7-27 36-39 57-24 19 13 19 42 2 57-12 10-30 8-38-4"
          stroke="currentColor"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M184 216c-12 41-47 80-94 88-40 7-67-18-58-51 7-27 35-41 58-27 21 13 23 41 6 58-12 12-31 13-43 3"
          stroke="currentColor"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M187 216c17 50 43 91 88 97 38 5 64-19 56-50-7-27-34-40-56-27-21 13-23 40-7 57 11 12 29 14 42 4"
          stroke="currentColor"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
