"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JsonViewer } from "@/components/json-viewer"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function DebugPage() {
  const [jsonData, setJsonData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("linkedinProfiles")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setJsonData(parsedData)
      } catch (error) {
        console.error("Error parsing JSON data:", error)
        setJsonData({ error: "Invalid JSON data in localStorage" })
      }
    }
  }, [])

  const clearData = () => {
    localStorage.removeItem("linkedinProfiles")
    setJsonData(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>JSON Data Viewer</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={clearData}>
                <RefreshCw className="w-4 h-4" />
                Clear Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jsonData ? (
              <div className="bg-white p-4 rounded-md border overflow-auto max-h-[70vh]">
                <JsonViewer data={jsonData} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No JSON data available. Upload a JSON file from the home page.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
