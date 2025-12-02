const CryptoStackIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => {
  // Колір "обводки", щоб відділити монети одна від одної.
  // Для темного сайту краще "black" або колір твого фону (напр. "#111827").
  // Я поставив "currentColor", щоб воно брало колір тексту батьківського елемента.
  const separatorColor = "var(--bg-base, #000000)"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 24" // Широкий формат, щоб вмістити 3 монети
      fill="none"
      className={`h-8 w-auto ${className}`} // w-auto важливо, щоб зберегти пропорції
      {...props}
    >
      {/* --- 1. BTC (Лівіше, знизу) --- */}
      <g transform="translate(12, 12)">
        <circle r="11" fill="#F7931A" /> {/* Помаранчевий фон */}
        <path
          fill="white"
          d="M16.04 12.06c.19 1.1-.38 1.95-1.13 2.53l.6 2.4-1.45.36-.58-2.33c-.38.1-.78.18-1.17.27l.59 2.36-1.46.36-.6-2.4c-.3.08-.6.15-.9.23l-2.02.5.38-1.53s1.07.25 1.05.27c.58.14.69.05.8-.1l1.13-4.54c.07-.17.03-.36-.16-.4l-1.05-.27c.02.02-1.05.26-1.05.26l-.7-1.63 1.9-.47c.36-.1.71-.18 1.06-.26l.6-2.43 1.46-.36.6 2.4c.4-.1.78-.18 1.16-.26l.6-2.4 1.45-.37.6 2.42c1.23.1 2.16.63 2.55 1.77.3 1.07-.03 1.95-.87 2.62.62.14 1.08.52 1.2 1.33z"
          transform="scale(0.65) translate(-11, -12)" // Центрування символу
        />
      </g>

      {/* --- 2. USDT (По центру) --- */}
      <g transform="translate(28, 12)">
        {/* Stroke тут створює "відступ" від першої монети */}
        <circle r="11" fill="#26A17B" stroke={separatorColor} strokeWidth="3" />
        <path
          fill="white"
          d="M14.5 7.5h-9v2.5h3.25v7.5h2.5v-7.5h3.25z"
          transform="scale(0.7) translate(-10, -11)"
        />
      </g>

      {/* --- 3. USDC (Справа, зверху) --- */}
      <g transform="translate(44, 12)">
        <circle r="11" fill="#2775CA" stroke={separatorColor} strokeWidth="3" />
        <path
          fill="white"
          d="M12.5 7c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 8c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm.5-5.5h-1v1h-1v1h1v2h-1v1h1v1h1v-1h1v-1h-1v-2h1v-1h-1z"
          transform="scale(0.9) translate(-12.5, -11.5)"
        />
      </g>
    </svg>
  )
}
export default CryptoStackIcon
