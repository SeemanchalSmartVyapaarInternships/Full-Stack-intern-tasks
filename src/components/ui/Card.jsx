export default function Card({ title, subtitle, action, children, className = '', noPadding = false }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-xs transition-shadow ${className}`}
    >
      {(title || subtitle || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
}
