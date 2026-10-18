const BrandMark = ({ className = "" }) => (
  <span
    className={`relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400/20 to-pink-400/20 shadow-lg ring-1 ring-white/10 ${className}`}
    aria-hidden="true"
  >
    <img
      src="/brand/skillforge-fox.png"
      alt=""
      className="h-full w-full object-contain p-1"
    />
  </span>
);

export default BrandMark;
