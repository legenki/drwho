import { SeoLinksData } from "./types"

export function SeoLinks({ data }: { data: SeoLinksData }) {
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 text-sm text-N800 dark:text-DN800">
      <div className="grid grid-cols-2 gap-4">
        <div className="atl-card p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-B400">{data.total}</div>
          <div className="text-xs font-medium text-N200 dark:text-DN200 uppercase mt-1">Total Links</div>
        </div>
        <div className="atl-card p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-B400">{data.unique}</div>
          <div className="text-xs font-medium text-N200 dark:text-DN200 uppercase mt-1">Unique Links</div>
        </div>
        <div className="atl-card p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-B400">{data.internal}</div>
          <div className="text-xs font-medium text-N200 dark:text-DN200 uppercase mt-1">Internal Links</div>
        </div>
        <div className="atl-card p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-R400">{data.withoutTitle}</div>
          <div className="text-xs font-medium text-N200 dark:text-DN200 uppercase mt-1">Without TITLE</div>
        </div>
      </div>

      <div className="atl-card p-4 flex flex-col gap-2">
        <h4 className="font-semibold mb-2">Links Detail</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-N0 dark:bg-DN20 z-10 border-b-2 border-N40 dark:border-DN40">
              <tr>
                <th className="py-2 text-N500 dark:text-DN300 font-semibold w-16 text-center">INT/EXT</th>
                <th className="py-2 text-N500 dark:text-DN300 font-semibold w-16 text-center">TITLE</th>
                <th className="py-2 text-N500 dark:text-DN300 font-semibold w-1/4">TEXT</th>
                <th className="py-2 text-N500 dark:text-DN300 font-semibold">HREF</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((link, i) => (
                <tr key={i} className="border-b border-N40 dark:border-DN40 last:border-0 hover:bg-N20 dark:hover:bg-DN30 transition-colors">
                  <td className="py-2 text-center align-top font-bold">
                    {link.isInternal ? <span className="text-B400">INT</span> : <span className="text-N200">EXT</span>}
                  </td>
                  <td className="py-2 text-center align-top">
                    {link.hasTitle ? <span className="text-G400">✓</span> : <span className="text-R400 font-bold">✕</span>}
                  </td>
                  <td className="py-2 align-top max-w-[150px] truncate" title={link.text}>
                    {link.text || <span className="text-N200 italic">Empty</span>}
                  </td>
                  <td className="py-2 break-all align-top">
                    <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-B400 hover:underline">{link.href}</a>
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
