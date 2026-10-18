const BrandMark = ({ className = "" }) => (
  <span
    className={`relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#fffdf7] shadow-lg ${className}`}
    aria-hidden="true"
  >
    <img
      src="/brand/skillforge-logo.png"
      alt=""
      className="absolute left-[-21px] top-[-1px] h-auto w-[94px] max-w-none"
    />
  </span>
);

export default BrandMark;
