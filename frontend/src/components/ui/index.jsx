// StatCard — used on dashboards
export function StatCard({ icon: Icon, label, value, iconBg = 'bg-primary-100', iconColor = 'text-primary-600', trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {trend && <p className="text-xs text-slate-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}

// OrderStatusBadge
export function OrderStatusBadge({ status }) {
  return <span className={`badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

// EmptyState
export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Spinner
export function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${className}`} />
  )
}

// PageHeader
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// FormInput
export function FormInput({ label, error, id, ...props }) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <input id={id} className={`input ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}

// FormSelect
export function FormSelect({ label, error, id, children, ...props }) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <select id={id} className={`input ${error ? 'input-error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}

// Modal
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ConfirmModal
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <div className="modal max-w-sm">
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 justify-end">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Currency formatter
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// Date formatter
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
