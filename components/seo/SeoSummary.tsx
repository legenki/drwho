import { SeoSummaryData } from "./types"

export function SeoSummary({ data }: { data: SeoSummaryData }) {
  if (!data) return null

  const getLengthColor = (len: number, min: number, max: number) => {
    if (len === 0) return "text-red-500"
    if (len < min || len > max) return "text-orange-500"
    return "text-green-500"
  }

  return (
    <div className="flex flex-col gap-4 text-sm text-N800 dark:text-DN800">
      <div className="atl-card p-4 flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="font-semibold">Title</span>
          <span className={`font-mono text-xs ${getLengthColor(data.title?.length || 0, 30, 65)}`}>
            {data.title?.length || 0} chars (30-65)
          </span>
        </div>
        <div className="text-N800 dark:text-DN800 break-words">{data.title || <span className="text-R400 italic">Missing</span>}</div>
      </div>

      <div className="atl-card p-4 flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="font-semibold">Description</span>
          <span className={`font-mono text-xs ${getLengthColor(data.description?.length || 0, 120, 320)}`}>
            {data.description?.length || 0} chars (120-320)
          </span>
        </div>
        <div className="text-N800 dark:text-DN800 break-words">{data.description || <span className="text-R400 italic">Missing</span>}</div>
      </div>

      <div className="atl-card p-4 flex flex-col gap-2">
        <div className="flex justify-between border-b border-N40 dark:border-DN40 pb-2">
          <span className="font-medium text-N200 dark:text-DN200">Keywords</span>
          <span className="max-w-[70%] text-right break-words">{data.keywords || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-N40 dark:border-DN40 pb-2">
          <span className="font-medium text-N200 dark:text-DN200">Canonical</span>
          <span className="truncate max-w-[70%]">{data.canonical || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-N40 dark:border-DN40 pb-2">
          <span className="font-medium text-N200 dark:text-DN200">Robots</span>
          <span>{data.robots || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-N40 dark:border-DN40 pb-2">
          <span className="font-medium text-N200 dark:text-DN200">Lang</span>
          <span>{data.lang || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-N40 dark:border-DN40 pb-2">
          <span className="font-medium text-N200 dark:text-DN200">Google Analytics</span>
          <span className={data.hasGa ? "text-G400 font-semibold" : "text-N200"}>
            {data.hasGa ? "Found" : "Not Found"}
          </span>
        </div>
        <div className="flex justify-between border-b border-N40 dark:border-DN40 pb-2">
          <span className="font-medium text-N200 dark:text-DN200">robots.txt</span>
          <a href={data.robotsTxtUrl} target="_blank" rel="noreferrer" className="text-B400 hover:underline truncate max-w-[70%]">
            {data.robotsTxtUrl}
          </a>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-N200 dark:text-DN200">sitemap.xml</span>
          <a href={data.sitemapXmlUrl} target="_blank" rel="noreferrer" className="text-B400 hover:underline truncate max-w-[70%]">
            {data.sitemapXmlUrl}
          </a>
        </div>
      </div>

      {data.xfnRel.length > 0 && (
        <div className="atl-card p-4 flex flex-col gap-2">
          <h4 className="font-medium mb-2">XFN / Rel Attributes</h4>
          <div className="flex flex-col gap-2">
            {data.xfnRel.map((xfn, i) => (
              <div key={i} className="flex flex-col border-b border-N40 dark:border-DN40 pb-2 last:border-0 last:pb-0">
                <span className="text-xs font-semibold text-P400">{xfn.rel}</span>
                <span className="text-N800 dark:text-DN800 truncate">{xfn.href}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
