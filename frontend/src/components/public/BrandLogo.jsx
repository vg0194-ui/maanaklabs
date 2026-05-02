function BrandLogo({
  className = "",
  stacked = false,
  showTagline = true,
  siteName = "Maanak Labs",
  tagline = "A Unit of Entorno Greens Seeds Private Limited",
}) {
  return (
    <div className={`flex ${stacked ? "flex-col" : "items-center"} gap-3 ${className}`}>
      <img
        src="/images/maanak-labs-logo.png"
        alt="Maanak Labs logo"
        className={stacked ? "h-20 w-auto object-contain" : "h-16 w-auto object-contain"}
      />
      <div>
        <div className="font-display text-[2rem] font-extrabold leading-none text-brand-ink">{siteName}</div>
        {showTagline ? <div className="mt-1 text-sm leading-6 text-slate-500">{tagline}</div> : null}
      </div>
    </div>
  );
}

export default BrandLogo;
