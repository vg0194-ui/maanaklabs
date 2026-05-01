function SectionHeader({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-slate-600">{description}</p> : null}
    </div>
  );
}

export default SectionHeader;

