import React from "react"
import { Activity, Shield, Link2, Share2, Wrench, Search } from "lucide-react"

// Import tool icons as URLs
import googleIcon from "data-base64:~assets/tool-icons/google.svg"
import pagespeedIcon from "data-base64:~assets/tool-icons/pagespeed.svg"
import w3cIcon from "data-base64:~assets/tool-icons/w3c.svg"
import alexaIcon from "data-base64:~assets/tool-icons/alexa.svg"
import quantcastIcon from "data-base64:~assets/tool-icons/quantcast.svg"
import facebookIcon from "data-base64:~assets/tool-icons/facebook.svg"
import twitterIcon from "data-base64:~assets/tool-icons/twitter.svg"
import pinterestIcon from "data-base64:~assets/tool-icons/pinterest.svg"

interface Tool {
  name: string
  link: string
  icon?: string
}

interface ToolCategory {
  title: string
  categoryIcon: React.ReactNode
  tools: Tool[]
}

export function SeoTools({ url, hostname }: { url: string, hostname: string }) {
  if (!url || !hostname) return null

  const encodedUrl = encodeURIComponent(url)
  const encodedHost = encodeURIComponent(hostname)

  const toolCategories: ToolCategory[] = [
    {
      title: "Performance & Validation",
      categoryIcon: <Activity className="w-4 h-4 text-N500 dark:text-DN300" />,
      tools: [
        { name: "Mobile-Friendly Test (Google)", link: `https://search.google.com/test/mobile-friendly?url=${encodedUrl}`, icon: googleIcon },
        { name: "GTmetrix", link: `https://gtmetrix.com/?url=${url}` },
        { name: "PageSpeed Insights", link: `https://developers.google.com/speed/pagespeed/insights/?url=${encodedUrl}`, icon: pagespeedIcon },
        { name: "W3C HTML Validator", link: `https://validator.w3.org/check?uri=${url}`, icon: w3cIcon },
        { name: "W3C CSS Validator", link: `https://jigsaw.w3.org/css-validator/validator?uri=${url}`, icon: w3cIcon },
        { name: "Rich Results Test (Google)", link: `https://search.google.com/test/rich-results?url=${encodedUrl}`, icon: googleIcon },
      ]
    },
    {
      title: "SEO",
      categoryIcon: <Search className="w-4 h-4 text-N500 dark:text-DN300" />,
      tools: [
        { name: "Alexa Site Info", link: `https://www.alexa.com/siteinfo/${hostname}`, icon: alexaIcon },
        { name: "Majestic Site Explorer", link: `https://majestic.com/reports/site-explorer/summary/${hostname}` },
        { name: "MetricSpot", link: `https://metricspot.com/` },
        { name: "WMtips Keyword Analyzer", link: `http://www.wmtips.com/tools/keyword-density-analyzer/?&url=${url}` },
        { name: "Quantcast", link: `https://www.quantcast.com/${hostname}`, icon: quantcastIcon }
      ]
    },
    {
      title: "Social Networks",
      categoryIcon: <Share2 className="w-4 h-4 text-N500 dark:text-DN300" />,
      tools: [
        { name: "Facebook Debugger", link: `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`, icon: facebookIcon },
        { name: "Twitter Card Validator", link: `https://cards-dev.twitter.com/validator`, icon: twitterIcon },
        { name: "Pinterest Validator", link: `https://developers.pinterest.com/tools/url-debugger/?link=${encodedUrl}`, icon: pinterestIcon }
      ]
    },
    {
      title: "Security & Malware",
      categoryIcon: <Shield className="w-4 h-4 text-N500 dark:text-DN300" />,
      tools: [
        { name: "McAfee SiteAdvisor", link: `http://www.siteadvisor.com/sites/${hostname}` },
        { name: "Safe Browsing (Google)", link: `https://transparencyreport.google.com/safe-browsing/search?url=${encodedHost}`, icon: googleIcon }
      ]
    },
    {
      title: "Other Tools",
      categoryIcon: <Wrench className="w-4 h-4 text-N500 dark:text-DN300" />,
      tools: [
        { name: "dnsquery.org - WHOIS", link: `http://dnsquery.org/whois/${hostname.replace('www.', '')}` },
        { name: "REDbot.org HTTP Validator", link: `https://redbot.org/?uri=${encodedUrl}` },
        { name: "Similar Pages (Google)", link: `https://www.google.com/search?q=related:${encodedUrl}`, icon: googleIcon },
        { name: "Links to this page (Google)", link: `https://www.google.com/search?q=link:${encodedUrl}`, icon: googleIcon },
        { name: "Google Images from site", link: `https://www.google.com/search?tbm=isch&q=site:${hostname}`, icon: googleIcon }
      ]
    }
  ]

  return (
    <div className="flex flex-col gap-4 text-sm pb-10 text-N800 dark:text-DN800">
      <div className="atl-card p-4 flex flex-col gap-2 bg-Y50 dark:bg-Y500/20 border border-Y200 dark:border-Y400/50">
        <p>
          Use <strong>CTRL + CLICK</strong> or <strong>CMD + CLICK</strong> to open links in a new background tab.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {toolCategories.map((cat, i) => (
          <div key={i} className="atl-card p-4 flex flex-col gap-3">
            <h4 className="font-semibold flex items-center gap-2 border-b border-N40 dark:border-DN40 pb-2">
              {cat.categoryIcon}
              {cat.title}
            </h4>
            <div className="flex flex-col gap-2">
              {cat.tools.map((tool, j) => (
                <a
                  key={j}
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-B400 hover:underline flex items-center gap-2 group py-0.5"
                >
                  {tool.icon ? (
                    <img
                      src={tool.icon}
                      alt=""
                      className="w-4 h-4 shrink-0 object-contain"
                    />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 shrink-0 text-N200 dark:text-DN200" />
                  )}
                  <span>{tool.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
