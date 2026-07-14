import type { ContentBlock } from "./types"

const ContentBlocks = ({ blocks }: { blocks: ContentBlock[] }) => {
  if (!blocks.length) return null

  return (
    <div className="flex flex-col gap-6" data-testid="content-blocks">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <div key={i} data-testid="content-block-text">
                {block.title && (
                  <h4
                    data-testid="content-block-title"
                    className="mb-2 text-base font-semibold text-white"
                  >
                    {block.title}
                  </h4>
                )}
                <p className="whitespace-pre-line text-sm text-gray-300">
                  {block.body}
                </p>
              </div>
            )
          case "image":
            return (
              <figure key={i} data-testid="content-block-image">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary content-authored URL, not a static asset */}
                <img
                  src={block.url}
                  alt={block.caption ?? ""}
                  className="w-full rounded-lg"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-xs text-gray-500">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          case "callout":
            return (
              <div
                key={i}
                data-testid="content-block-callout"
                className="rounded-lg border border-[#ccff00]/40 bg-[#ccff00]/5 p-4 text-sm text-gray-200"
              >
                {block.title && (
                  <div
                    data-testid="content-block-title"
                    className="mb-1 font-semibold text-white"
                  >
                    {block.title}
                  </div>
                )}
                {block.body}
              </div>
            )
          case "table":
            return (
              <div
                key={i}
                data-testid="content-block-table"
                className="overflow-x-auto"
              >
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {block.headers.map((header, hi) => (
                        <th
                          key={hi}
                          className="border-b border-gray-800 px-3 py-2 text-left text-gray-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="border-b border-gray-800/50 px-3 py-2 text-gray-200"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

export default ContentBlocks
