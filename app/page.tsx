"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Download, Eye, FileText, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { format } from "path"

// Define the profile structure based on the JSON format
interface ProfileData {
  id?: number
  name: string
  city?: string
  country_code?: string
  position?: string
  about?: string
  current_company?: {
    name?: string
    title?: string
    location?: string
    date_range?: string
  }
  experience?: Array<{
    company?: string
    title?: string
    description?: string
    date_range?: string
    location?: string
  }>
  ai_summary?: string
  ai_industry?: {
    industry?: string
    expertise_level?: string
  }[]
  ai_refresh_date?: string
  next_refresh_date?: string
  [key: string]: any // Allow for additional fields
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pastCompanySearch, setPastCompanySearch] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileData[]>([])
  const [ignorePrivate, setIgnorePrivate] = useState("false")
  
  const { toast } = useToast()

  // Function to get past companies (excluding current company)
  const getPastCompanies = (profile: ProfileData): string => {
    if (!profile.experience || profile.experience.length === 0) {
      return "Private"
    }

    const currentCompanyName = profile.current_company?.name?.toLowerCase()
    const pastCompanies = profile.experience
      .map((exp) => exp.company)
      .filter((company) => {
        if (!company) return false
        // Exclude current company from past companies list
        return company.toLowerCase() !== currentCompanyName
      })
      .filter((company, index, arr) => arr.indexOf(company) === index) // Remove duplicates

    return pastCompanies.length > 0 ? pastCompanies.join(", ") : "N/A"
  }

  // // Function to calculate years of experience from date_range
  // const calculateYearsOfExperience = (profile: ProfileData): { years: number; dateRange: string } => {
  //   // First check if there's a current company with date_range
  //   let dateRange = profile.current_company?.date_range || ""

  //   // If no current company date_range, check the first experience entry
  //   if (!dateRange && profile.experience && profile.experience.length > 0) {
  //     dateRange = profile.experience[0].date_range || ""
  //   }

  //   if (!dateRange) {
  //     return { years: 0, dateRange: "N/A" }
  //   }

  //   try {
  //     // Common date formats: "Jan 2020 - Present", "Jan 2020 - Dec 2022", "2020 - Present", "2020 - 2022"
  //     const parts = dateRange.split("-").map((part) => part.trim())

  //     if (parts.length < 2) {
  //       return { years: 0, dateRange }
  //     }

  //     const startPart = parts[0]

  //     // Extract year from start date
  //     let startYear: number
  //     let startMonth = 0 // Default to January

  //     // Check if format includes month name (e.g., "Jan 2020")
  //     const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
  //     const startParts = startPart.toLowerCase().split(" ")

  //     if (startParts.length > 1) {
  //       // Format with month name
  //       const monthIndex = monthNames.indexOf(startParts[0].substring(0, 3))
  //       if (monthIndex !== -1) {
  //         startMonth = monthIndex
  //         startYear = Number.parseInt(startParts[1])
  //       } else {
  //         startYear = Number.parseInt(startParts[0])
  //       }
  //     } else {
  //       // Just year format
  //       startYear = Number.parseInt(startPart)
  //     }

  //     if (isNaN(startYear)) {
  //       return { years: 0, dateRange }
  //     }

  //     // Calculate end date
  //     const endPart = parts[1].toLowerCase()
  //     let endDate: Date

  //     if (endPart.includes("present")) {
  //       endDate = new Date() // Current date
  //     } else {
  //       // Try to parse end date
  //       let endYear: number
  //       let endMonth = 11 // Default to December

  //       const endParts = endPart.split(" ")
  //       if (endParts.length > 1) {
  //         const monthIndex = monthNames.indexOf(endParts[0].substring(0, 3))
  //         if (monthIndex !== -1) {
  //           endMonth = monthIndex
  //           endYear = Number.parseInt(endParts[1])
  //         } else {
  //           endYear = Number.parseInt(endParts[0])
  //         }
  //       } else {
  //         endYear = Number.parseInt(endPart)
  //       }

  //       if (isNaN(endYear)) {
  //         endDate = new Date() // Default to current date if parsing fails
  //       } else {
  //         endDate = new Date(endYear, endMonth, 1)
  //       }
  //     }

  //     // Create start date
  //     const startDate = new Date(startYear, startMonth, 1)

  //     // Calculate difference in years
  //     const diffTime = endDate.getTime() - startDate.getTime()
  //     const diffYears = diffTime / (1000 * 3600 * 24 * 365.25)

  //     return {
  //       years: Math.max(0, Math.round(diffYears * 10) / 10), // Round to 1 decimal place
  //       dateRange,
  //     }
  //   } catch (error) {
  //     console.error("Error calculating years of experience:", error)
  //     return { years: 0, dateRange }
  //   }
  // }

const calculateYearsOfExperience = (profile: any): { years: number; dateRange: string } => {
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const parseDate = (input: string | undefined): Date | null => {
    if (!input) return null;

    const [monthStr, yearStr] = input.trim().split(" ");
    const month = monthMap[monthStr.toLowerCase()];
    const year = parseInt(yearStr, 10);

    if (isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, 1);
  };

  const dateRanges = profile?.experience
    ?.map(exp => {
      const start = parseDate(exp.start_date);
      const end = parseDate(exp.end_date) || new Date(); // Treat "Present" or undefined as today
      return start && end ? { start, end } : null;
    })
    .filter((d): d is { start: Date; end: Date } => !!d);

  if (!dateRanges || dateRanges.length === 0) {
    return { years: 'Private', dateRange: "Private" };
  }

  const startDate = new Date(Math.min(...dateRanges.map(d => d.start.getTime())));
  const endDate = new Date(Math.max(...dateRanges.map(d => d.end.getTime())));

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  const formattedRange = `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`;

  return {
    years: Math.round(diffYears * 10) / 10,
    dateRange: formattedRange,
  };
};


  // Function to format refresh date
  const formatRefreshDate = (profile: ProfileData): string => {
    const refreshDate = profile.ai_next_crawl
    if (!refreshDate) return "Not scheduled"

    try {
      const date = new Date(refreshDate)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return refreshDate // Return raw value if parsing fails
    }
  }

// Fetch profiles from API
const fetchProfilesFromApi = async () => {
  try {
    const url = ignorePrivate === "true"
      ? `http://localhost:4000/profiles?ignorePrivate=true`
      : `http://localhost:4000/profiles`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch profiles")
    const data = await res.json()

    // Handle different possible data structures
    if (Array.isArray(data)) {
      setProfiles(data.map((profile, index) => ({ ...profile, id: profile.id || index + 1 })))
    } else if (typeof data === "object" && data !== null) {
      if (data.name) {
        setProfiles([{ ...data, id: 1 }])
      } else {
        const extractedProfiles = Object.entries(data)
          .map(([key, value], index) => {
            if (typeof value === "object" && value !== null && "name" in value) {
              return { ...value, id: Number(key) || index + 1 }
            }
            return null
          })
          .filter(Boolean) as ProfileData[]
        if (extractedProfiles.length > 0) {
          setProfiles(extractedProfiles)
        }
      }
    }
  } catch (error) {
    console.error("Error fetching profiles from API:", error)
  }
}

useEffect(() => {
  fetchProfilesFromApi()
}, [ignorePrivate])

  // Filter profiles based on search and filters
  useEffect(() => {
    const newFilteredProfiles = profiles.filter((profile) => {
      // Current search (name, position, current company)
      const matchesCurrentSearch =
        searchTerm === "" ||
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.current_company?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      // Past companies search
      const pastCompanies = getPastCompanies(profile)
      const matchesPastCompanySearch =
        pastCompanySearch === "" || pastCompanies.toLowerCase().includes(pastCompanySearch.toLowerCase())

      const matchesIndustry = industryFilter === "all" || profile.ai_industry?.flatMap(i => i.industry).includes(industryFilter)

      const matchesPosition = positionFilter === "all" || profile?.experience?.[0]?.title || profile?.current_company?.title === positionFilter

      const matchesCountry =
        countryFilter === "all" || profile.country_code === countryFilter || profile.country === countryFilter

      const matchesCity = cityFilter === "all" || profile.city === cityFilter

      return (
        matchesCurrentSearch &&
        matchesPastCompanySearch &&
        matchesIndustry &&
        matchesPosition &&
        matchesCountry &&
        matchesCity
      )
    })
    setFilteredProfiles(newFilteredProfiles)
  }, [profiles, searchTerm, pastCompanySearch, industryFilter, positionFilter, countryFilter, cityFilter])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    console.log("Selected file:", selectedFile)
    if (selectedFile) {
      setFile(selectedFile)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      })
    }
  }

const handleUpload = async () => {
  if (!file) {
    toast({
      title: "No file selected",
      description: "Please select a CSV file to upload.",
      variant: "destructive",
    })
    return
  }

  setIsProcessing(true)
  setProgress(0)

  try {
    // Prepare FormData for upload
    const formData = new FormData()
    formData.append("file", file)

    // Upload to backend
    const res = await fetch("http://localhost:4000/upload-csv", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error("Failed to upload file")
    }

    // Optionally handle response data
    const result = await res.json()
    console.log("Upload result:", result)

    setIsProcessing(false)
    setProgress(100)

    toast({
      title: "Upload complete!",
      description: "Your file has been uploaded successfully.",
    })

    // Reset file input
    setFile(null)
    const fileInput = document.getElementById("csv-file") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  } catch (error) {
    console.error("Error uploading file:", error)
    setIsProcessing(false)
    toast({
      title: "Error uploading file",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    })
  }
}

  const handleRowClick = (profileId: number) => {
    router.push(`/profile/${profileId}`)
  }

  const handleRowClickLinkedin = (profileId: number) => {
    router.push(`https://www.linkedin.com/in/${profileId}`)
  }  

  // Extract unique values for filters
  // const industries = [...new Set(profiles.map((p) => p.ai_industry?.map(i => i.industry)).filter(Boolean))]
  const industries = [
    ...new Set(
      profiles
        .flatMap(p => p.ai_industry?.map(i => i.industry) || [])
    )
  ];
  const positions = [...new Set(profiles.map((p) => p?.experience?.[0]?.title).filter(Boolean))]
  const countries = [...new Set(profiles.map((p) => p.country_code || p.country).filter(Boolean))]
  const cities = [...new Set(profiles.map((p) => p.city).filter(Boolean))]

  // CSV export function
  const exportToCSV = () => {
    if (filteredProfiles.length === 0) {
      alert("No data to export")
      return
    }

    const headers = [
      "Name",
      "Position",
      "Company",
      "Years of Experience",
      "Country",
      "City",
      "Industry",
      "Expertise",
      "About",
      "Past Companies",
      "AI Refresh",
    ]

    const csvData = filteredProfiles.map((profile) => {
      const { years } = calculateYearsOfExperience(profile)

      return [
        profile.name || "",
        profile.current_company?.title || profile.position || "",
        profile.current_company?.name || "",
        years.toString(),
        profile.country_code || profile.country || "",
        profile.city || "",
        profile.ai_industry?.industry || "",
        profile.ai_industry?.expertise_level || "",
        (profile.about || "").replace(/"/g, '""'), // Escape quotes
        getPastCompanies(profile),
        formatRefreshDate(profile),
      ]
    })

    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((field) => `"${field}"`).join(","))].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `asb-alumni-profiles-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/images/asb-logo.png" alt="Asia School of Business Logo" width={400} height={120} priority />
          </div>
          <h1 className="text-4xl font-bold text-[#b91c1c] mb-4">ASB Alumni Dashboard</h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto mb-8">Professor X's Cerebro... for ASB alumni</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border-[#b91c1c] border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#b91c1c]">
              <FileText className="w-5 h-5" />
              Upload LinkedIn Data
            </CardTitle>
            <CardDescription>Upload a CSV of LinkedIn URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Select File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                  />
                  {file && (
                    <p className="text-sm text-gray-600">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing profiles...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" indicatorClassName="bg-[#b91c1c]" />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || isProcessing}
                  className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white"
                  size="lg"
                >
                  {isProcessing ? "Processing..." : "Upload and Add Profiles"}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Users className="w-8 h-8 text-[#b91c1c] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#b91c1c]">{profiles.length}</div>
                    <div className="text-sm text-gray-600">Total Profiles</div>
                  </div>
                  {/* <div className="p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-[#b91c1c] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#b91c1c]">{industries.length}</div>
                    <div className="text-sm text-gray-600">Industries</div>
                  </div> */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-[#b91c1c] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#b91c1c]">{countries.length}</div>
                    <div className="text-sm text-gray-600">Countries</div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Supported Formats:</strong> CSV of LinkedIn URLs
                  </p>
                  <p>
                    <strong>Note:</strong> New profiles will be added to existing data
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters & Results Section - Always show */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#b91c1c] mb-2">Alumni Profile Analysis</h2>
            <p className="text-gray-600">
              {profiles.length} profiles analyzed • {filteredProfiles.length} shown
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white"
            onClick={exportToCSV}
            disabled={filteredProfiles.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Results
          </Button>
        </div>

        <Card className="mb-6 border-[#b91c1c] border">
          <CardHeader>
            <CardTitle className="text-[#b91c1c]">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, current position, or current company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                  disabled={profiles.length === 0}
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by past companies only..."
                  value={pastCompanySearch}
                  onChange={(e) => setPastCompanySearch(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                  disabled={profiles.length === 0}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Select value={industryFilter} onValueChange={setIndustryFilter} disabled={profiles.length === 0}>
                <SelectTrigger className="border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={positionFilter} onValueChange={setPositionFilter} disabled={profiles.length === 0}>
                <SelectTrigger className="border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter} disabled={profiles.length === 0}>
                <SelectTrigger className="border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter} disabled={profiles.length === 0}>
                <SelectTrigger className="border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ignorePrivate} onValueChange={(val) => setIgnorePrivate(val)}>
                <SelectTrigger className="border-gray-300 focus:border-[#b91c1c] focus:ring-[#b91c1c]">
                  <SelectValue placeholder="Ignore Private Profiles?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Show All Profiles</SelectItem>
                  <SelectItem value="true">Ignore Private Profiles</SelectItem>
                </SelectContent>
              </Select>              
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#b91c1c] border">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto" style={{ maxWidth: "100%" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead style={{ minWidth: "150px" }}>Name</TableHead>
                    <TableHead style={{ minWidth: "150px" }}>Position</TableHead>
                    <TableHead style={{ minWidth: "150px" }}>Company</TableHead>
                    <TableHead style={{ minWidth: "120px" }}>Years of Experience</TableHead>
                    <TableHead style={{ minWidth: "100px" }}>Country</TableHead>
                    <TableHead style={{ minWidth: "100px" }}>City</TableHead>
                    <TableHead style={{ minWidth: "120px" }}>Industry</TableHead>
                    <TableHead style={{ minWidth: "200px" }}>Past Companies</TableHead>
                    <TableHead style={{ minWidth: "120px" }}>AI Refresh</TableHead>
                    <TableHead style={{ minWidth: "100px", position: "sticky", right: 0, backgroundColor: "#f9fafb" }}>
                      Actions
                    </TableHead>
                    <TableHead style={{ minWidth: "100px", position: "sticky", right: 0, backgroundColor: "#f9fafb" }}>
                      Linkedin
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profiles Yet</h3>
                        <p className="text-gray-600">
                          Upload your first LinkedIn data file above to get started with the analysis.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12">
                        <p className="text-gray-500">No profiles match your current filters.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => {
                      const { years, dateRange } = calculateYearsOfExperience(profile)
                      const pastCompanies = getPastCompanies(profile)

                      return (
                        <TableRow
                          key={profile.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleRowClick(profile.id!)}
                        >
                          <TableCell style={{ minWidth: "150px" }} className="font-medium">
                            {profile.name}
                          </TableCell>
                          <TableCell style={{ minWidth: "150px" }}>
                            {profile?.experience?.[0]?.title || profile.current_company?.title || "Private"}
                          </TableCell>
                          <TableCell style={{ minWidth: "150px" }}>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                              {profile.current_company?.name || "Private"}
                            </Badge>
                          </TableCell>
                          <TableCell style={{ minWidth: "120px" }}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>{years > 0 ? `${years} years` : "Private"}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {dateRange !== "N/A" ? `Date range: ${dateRange}` : "No date information available"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell style={{ minWidth: "100px" }}>
                            {profile.country_code || profile.country || "Private"}
                          </TableCell>
                          <TableCell style={{ minWidth: "100px" }}>{profile.city || "Private"}</TableCell>
                          <TableCell style={{ minWidth: "120px" }}>{profile.ai_industry?.[0]?.industry || "Private"}</TableCell>
                          <TableCell style={{ minWidth: "200px" }}>
                            <div className="max-w-[200px] truncate" title={pastCompanies}>
                              {pastCompanies}
                            </div>
                          </TableCell>
                          <TableCell style={{ minWidth: "120px" }}>
                            <span className="text-sm text-gray-600">{formatRefreshDate(profile)}</span>
                          </TableCell>
                          <TableCell
                            style={{
                              minWidth: "100px",
                              position: "sticky",
                              right: 0,
                              backgroundColor: "white",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-[#b91c1c] hover:bg-[#fee2e2] hover:text-[#991b1b]"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRowClick(profile.id!)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </TableCell>
                          <TableCell
                            style={{
                              minWidth: "100px",
                              position: "sticky",
                              right: 0,
                              backgroundColor: "white",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-[#b91c1c] hover:bg-[#fee2e2] hover:text-[#991b1b]"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRowClickLinkedin(profile.id!)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
