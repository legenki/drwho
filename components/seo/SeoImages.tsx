import { SeoImagesData } from "./types"

export function SeoImages({ data }: { data: SeoImagesData }) {
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 text-sm text-N800 dark:text-DN800">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="atl-card p-4 text-center">
          <div className="text-3xl font-bold text-B400">{data.total}</div>
          <div className="text-xs font-semibold text-N200 dark:text-DN200 mt-1 uppercase">Total Images</div>
        </div>
        <div className="atl-card p-4 text-center">
          <div className={`text-3xl font-bold ${data.withoutAlt > 0 ? "text-Y400" : "text-G400"}`}>
            {data.withoutAlt}
          </div>
          <div className="text-xs font-semibold text-N200 dark:text-DN200 mt-1 uppercase">Without ALT</div>
        </div>
        <div className="atl-card p-4 text-center">
          <div className="text-3xl font-bold text-P400">{data.withoutTitle}</div>
          <div className="text-xs font-semibold text-N200 dark:text-DN200 mt-1 uppercase">Without TITLE</div>
        </div>
      </div>

      <div className="atl-card p-4 flex flex-col gap-2">
        <h4 className="font-semibold mb-2">Image Details</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-N0 dark:bg-DN20 z-10 border-b-2 border-N40 dark:border-DN40">
              <tr>
                <th className="pb-2 text-N500 dark:text-DN300 font-semibold w-12 text-center">ALT</th>
                <th className="pb-2 text-N500 dark:text-DN300 font-semibold w-12 text-center">TITLE</th>
                <th className="pb-2 text-N500 dark:text-DN300 font-semibold">SRC</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((img, i) => (
                <tr key={i} className="border-b border-N40 dark:border-DN40 last:border-0 hover:bg-N20 dark:hover:bg-DN30 transition-colors">
                  <td className="py-2 text-center align-top">
                    {img.hasAlt ? <span className="text-G400">✓</span> : <span className="text-Y400 font-bold">✕</span>}
                  </td>
                  <td className="py-2 text-center align-top">
                    {img.hasTitle ? <span className="text-G400">✓</span> : <span className="text-P400 font-bold">✕</span>}
                  </td>
                  <td className="py-2 break-all align-top">
                    <a href={img.src} target="_blank" rel="noreferrer" className="hover:text-B400 hover:underline">{img.src}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
