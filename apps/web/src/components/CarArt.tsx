import { useId } from "react";
export function CarArt({
  category = "SUV",
  large = false,
}: {
  category?: string;
  large?: boolean;
}) {
  const gradientId = useId();
  const color =
    category === "Electric"
      ? "#5ab6ad"
      : category === "Sedan"
        ? "#b5b8c5"
        : category === "Hybrid"
          ? "#99a5b3"
          : "#7e98bb";
  return (
    <svg
      viewBox="0 0 640 280"
      role="img"
      aria-label={category + " vehicle illustration"}
      className={
        large
          ? "w-full"
          : "w-full transition-transform duration-500 group-hover:scale-105"
      }
    >
      <defs>
        <linearGradient id={gradientId} x2="0.3" y2="1">
          <stop stopColor="#e8f0fc" />
          <stop offset=".5" stopColor={color} />
          <stop offset="1" stopColor="#27374c" />
        </linearGradient>
      </defs>
      <ellipse cx="324" cy="230" rx="250" ry="20" fill="#030712" opacity=".6" />
      <path
        d="M69 164 112 149 166 80 Q179 64 216 64 L390 69 Q414 73 449 118 L480 143 557 162 Q578 168 580 191 L572 215 68 215 56 188Z"
        fill={"url(#" + gradientId + ")"}
        stroke="#a5bad5"
        strokeWidth="2"
      />
      <path
        d="m167 90 51-8 74 1-1 61-170 1Zm139-6 80 5q24 4 57 54l-137 1Z"
        fill="#152535"
        stroke="#667e99"
        strokeWidth="3"
      />
      <path
        d="m307 149 1 53m-101-52-6 52M81 173h53m375-3 48 9"
        stroke="#ceddec"
        strokeWidth="5"
      />
      <path d="M105 202h411" stroke="#293b51" strokeWidth="10" />
      <path d="m459 158 46 1 10 13-54-2" fill="#f4f4df" />
      <path d="m70 166 15-4 1 16-17 2" fill="#e68d68" />
      {[165, 475].map((x) => (
        <g key={x}>
          <circle cx={x} cy="211" r="43" fill="#111823" />
          <circle cx={x} cy="211" r="27" fill="#93a5b8" />
          <circle cx={x} cy="211" r="20" fill="#29394b" />
          <path
            d={"M" + x + " 191v40m-20-20h40m-34-14 28 28m-28 0 28-28"}
            stroke="#b6c4d4"
            strokeWidth="4"
          />
          <circle cx={x} cy="211" r="6" fill="#b6c4d4" />
        </g>
      ))}
      <path d="M321 155h23m-111 0h23" stroke="#e0e8ef" strokeWidth="4" />
    </svg>
  );
}
