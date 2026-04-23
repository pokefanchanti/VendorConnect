/**
 * VendorConnect flat text logo.
 *
 * Variants:
 *   "sidebar"  — compact horizontal (monogram + wordmark), used inside the sidebar
 *   "auth"     — stacked vertical (large monogram above wordmark), used on login/register
 */
export default function Logo({ variant = 'sidebar' }) {
  if (variant === 'auth') {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Flat monogram block — no shadow, no gradient, no border-radius */}
        <div
          className="w-14 h-14 bg-secondary-900 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-white text-xl font-black tracking-tighter leading-none select-none">
            VC
          </span>
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <p className="text-2xl font-black tracking-tight text-secondary-900 leading-none">
            Vendor
            <span className="text-primary-700">Connect</span>
          </p>
          <p className="text-xs font-medium text-secondary-400 tracking-widest uppercase mt-1">
            B2B Marketplace
          </p>
        </div>
      </div>
    )
  }

  // sidebar variant — compact horizontal
  return (
    <div className="flex items-center gap-2.5">
      {/* Flat monogram block */}
      <div
        className="w-8 h-8 bg-secondary-900 flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-white text-xs font-black tracking-tighter leading-none select-none">
          VC
        </span>
      </div>

      {/* Wordmark */}
      <span className="font-black text-base tracking-tight text-secondary-900 leading-none">
        Vendor<span className="text-primary-700">Connect</span>
      </span>
    </div>
  )
}
