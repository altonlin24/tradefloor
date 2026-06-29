import { useQuotes } from '../../hooks/useQuotes'
import './LiveQuotes.css'

function formatPrice(key, price) {
  if (price == null) return '—'
  if (key === 'NQ') return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (key === 'ES') return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (key === 'GC') return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (key === 'SI') return price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  return price.toLocaleString()
}

export default function LiveQuotes() {
  const { quotes, loading, error } = useQuotes()

  const keys = ['NQ', 'ES', 'GC', 'SI']

  return (
    <section className="rp-section">
      <h2 className="rp-title">
        Live quotes
        <span className="lq-dot" title="Updates every 60s" />
      </h2>

      {loading ? (
        <div className="lq-loading">Fetching prices...</div>
      ) : error ? (
        <div className="lq-error">Couldn't load quotes</div>
      ) : (
        <div className="lq-list">
          {keys.map(key => {
            const q = quotes[key]
            const up = q?.changePct >= 0
            return (
              <div key={key} className="lq-row">
                <span className={`lq-badge badge-${key}`}>{key}</span>
                <div className="lq-info">
                  <span className="lq-price">
                    {formatPrice(key, q?.price)}
                  </span>
                  <span className={`lq-change ${q?.changePct == null ? '' : up ? 'up' : 'dn'}`}>
                    {q?.changePct == null
                      ? '—'
                      : `${up ? '+' : ''}${q.changePct.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
