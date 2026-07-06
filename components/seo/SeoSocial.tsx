import { SeoSocialData } from "./types"

export function SeoSocial({ data }: { data: SeoSocialData }) {
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 text-sm text-N800 dark:text-DN800">
      {/* Open Graph */}
      <div className="atl-card p-4">
        <h4 className="font-semibold mb-3">Open Graph</h4>
        {data.og.length === 0 ? (
          <div className="text-N200 dark:text-DN200 italic text-xs">No Open Graph tags found.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.og.map((item, i) => (
              <div key={i} className="flex flex-col border-b border-N40 dark:border-DN40 pb-2 last:border-0 last:pb-0">
                <span className="text-xs font-semibold text-P400">{item.property}</span>
                <span className="break-words mt-0.5">{item.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Twitter Cards */}
      <div className="atl-card p-4">
        <h4 className="font-semibold mb-3">Twitter Cards</h4>
        {data.twitter.length === 0 ? (
          <div className="text-N200 dark:text-DN200 italic text-xs">No Twitter tags found.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.twitter.map((item, i) => (
              <div key={i} className="flex flex-col border-b border-N40 dark:border-DN40 pb-2 last:border-0 last:pb-0">
                <span className="text-xs font-semibold text-B400">{item.name}</span>
                <span className="break-words mt-0.5">{item.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schema.org & Others */}
      <div className="atl-card p-4">
        <h4 className="font-semibold mb-3">Other Tags</h4>
        <div className="flex flex-col gap-2">
          {data.imageSrc && (
            <div className="flex flex-col border-b border-N40 dark:border-DN40 pb-2">
              <span className="text-xs font-semibold text-N200 dark:text-DN200">image_src</span>
              <a href={data.imageSrc} target="_blank" rel="noreferrer" className="text-B400 hover:underline break-words mt-0.5">{data.imageSrc}</a>
            </div>
          )}
          {data.schema.length > 0 && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-N200 dark:text-DN200 mb-1">Schema.org (itemtype)</span>
              <div className="flex flex-col gap-1 pl-2 border-l-2 border-B400/30">
                {data.schema.map((sch, i) => (
                  <span key={i} className="break-words text-xs">{sch}</span>
                ))}
              </div>
            </div>
          )}
          {!data.imageSrc && data.schema.length === 0 && (
            <div className="text-N200 dark:text-DN200 italic text-xs">No additional tags found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
