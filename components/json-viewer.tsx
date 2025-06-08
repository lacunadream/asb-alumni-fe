"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonViewerProps {
  data: any
  initialExpanded?: boolean
  level?: number
  maxLevel?: number
}

export function JsonViewer({ data, initialExpanded = true, level = 0, maxLevel = 2 }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded || level < maxLevel)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  if (data === null) return <span className="text-gray-500">null</span>
  if (data === undefined) return <span className="text-gray-500">undefined</span>

  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data)
    const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0

    if (isEmpty) {
      return <span>{isArray ? "[]" : "{}"}</span>
    }

    return (
      <div className="pl-4 border-l border-gray-200">
        <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded px-1" onClick={toggleExpand}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-mono">{isArray ? `Array(${data.length})` : `Object(${Object.keys(data).length})`}</span>
        </div>

        {isExpanded && (
          <div className="ml-2">
            {isArray
              ? data.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 my-1">
                    <span className="text-gray-500 font-mono">{index}:</span>
                    <JsonViewer data={item} level={level + 1} maxLevel={maxLevel} />
                  </div>
                ))
              : Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 my-1">
                    <span className={cn("font-mono", typeof key === "string" && "text-blue-600")}>{key}:</span>
                    <JsonViewer data={value} level={level + 1} maxLevel={maxLevel} />
                  </div>
                ))}
          </div>
        )}
      </div>
    )
  }

  // Primitive values
  if (typeof data === "string") return <span className="text-green-600">"{data}"</span>
  if (typeof data === "number") return <span className="text-purple-600">{data}</span>
  if (typeof data === "boolean") return <span className="text-orange-600">{data.toString()}</span>

  return <span>{String(data)}</span>
}
