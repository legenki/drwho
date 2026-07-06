import { SeoHeaderData } from "./types"

export function SeoHeaders({ data }: { data: SeoHeaderData[] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-N200 dark:text-DN200 italic text-center p-4">No headers found.</div>
  }

  const counts = data.reduce((acc, h) => {
    acc[h.tag] = (acc[h.tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col gap-4 text-sm text-N800 dark:text-DN800">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {["H1", "H2", "H3", "H4", "H5", "H6"].map(tag => (
          <div key={tag} className="atl-card flex flex-col items-center justify-center p-2 rounded text-center">
            <span className="text-xs text-N200 dark:text-DN200 font-semibold">{tag}</span>
            <span className={`text-lg font-bold ${counts[tag] === 0 && tag === 'H1' ? 'text-R400' : 'text-B400'}`}>
              {counts[tag] || 0}
            </span>
          </div>
        ))}
      </div>

      <div className="atl-card p-4 flex flex-col gap-2">
        {data.map((h, i) => (
          <div key={i} className="flex gap-3 items-start border-b border-N40 dark:border-DN40 pb-2 last:border-0 last:pb-0">
            <span className="atl-lozenge atl-lozenge-inprogress shrink-0">{h.tag}</span>
            <span className="text-N800 dark:text-DN800">{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
