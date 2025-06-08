"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Building, Users, Award, Briefcase, Globe, Mail, Info, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NestedPosition {
  title: string;
  subtitle: string;
  meta: string;
  description: string;
  description_html?: string;
  start_date: string;
  end_date: string;
  location?: string;
}  
interface RelatedProfile {
  id: string;
  name: string;
  avatar: string;
  short_summary: string;
}

// Define the profile structure based on the JSON format
interface ProfileData {
  id?: number
  name: string
  city?: string
  country_code?: string
  position?: string
  about?: string
  avatar?: string
  current_company?: {
    name?: string
    title?: string
    location?: string
  }
  experience?: Array<{
    title: string;
    location?: string;
    description?: string;
    description_html?: string | null;
    start_date: string;
    end_date: string;
    company: string;
    company_id?: string;
    url?: string;
    company_logo_url?: string;
    duration?: string;
    positions?: NestedPosition[];
  }>
  certifications?: Array<{
    name?: string
    issuer?: string
    date?: string
    url?: string
  }>
  education?: Array<{
    title: string;
    degree: string;
    field?: string;
    url?: string;
    start_year: string;
    end_year?: string;
    description?: string;
    description_html?: string;
    institute_logo_url?: string;
  }>
  skills?: string[]
  ai_summary?: string
  ai_industry?: {
    industry?: string
    expertise_level?: string
  }
  ai_refresh_date?: string
  next_refresh_date?: string
  ai_related_profile?:RelatedProfile[],
  [key: string]: any // Allow for additional fields
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [allProfiles, setAllProfiles] = useState<ProfileData[]>([])

  // Fetch all profiles from API and set state
  const fetchProfilesFromApi = async (profileId: string) => {
    try {
      // const res = await fetch(`htpp://localhost:4000/api/profiles/${profileId}`)
      const res = await fetch(`http://localhost:4000/profiles/${profileId}`)
      // const res = await fetch("http://localhost:4000/profiles")
      if (!res.ok) throw new Error("Failed to fetch profiles")
      const data = await res.json()
      let foundProfile = null
      let profilesArray: ProfileData[] = []

      if (Array.isArray(data)) {
        foundProfile = data.find((p) => p.id === profileId)
        profilesArray = data
      } else if (data.profiles && Array.isArray(data.profiles)) {
        foundProfile = data.profiles.find((p) => p.id === profileId)
        profilesArray = data.profiles
      } else if (typeof data === "object" && data.name) {
        foundProfile = data
        profilesArray = [data]
      } else if (typeof data === "object") {
        foundProfile = data[profileId]
        profilesArray = Object.values(data).filter((p) => typeof p === "object" && p !== null)
      }

      if (foundProfile) {
        setProfile(foundProfile)
        setAllProfiles(profilesArray)
      }
    } catch (error) {
      console.error("Error fetching profiles from API:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfilesFromApi(profileId)
  }, [profileId])


  // Function to format refresh date
  const formatRefreshDate = (profile: ProfileData): string => {
    const refreshDate = profile.ai_next_crawl
    if (!refreshDate) return "Not scheduled"

    try {
      const date = new Date(refreshDate)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return refreshDate // Return raw value if parsing fails
    }
  }

  // Generate similar profiles if not provided in the JSON
  const getSimilarProfiles = () => {
    // If similar profiles are already defined in the JSON, use those
    if (profile?.ai_related_profile	 && profile.ai_related_profile	.length > 0) {
      return profile.ai_related_profile	
    }

    return []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#b91c1c] mb-4">Loading profile...</h1>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#b91c1c] mb-4">Profile Not Found</h1>
          <Button onClick={() => router.push("/")} className="bg-[#b91c1c] hover:bg-[#991b1b] text-white">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Extract skills from profile
  const skills = profile.skills || []
  const similarProfiles = getSimilarProfiles()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="gap-2 text-[#b91c1c] hover:bg-[#fee2e2] hover:text-[#991b1b]"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <Button
            variant="outline"
            className="gap-2 border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white"
            onClick={() => router.push("/")}
          >
            <Home className="w-4 h-4" />
            Dashboard Home
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="border-[#b91c1c] border">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar || "/placeholder.svg"}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                              ${profile.name.charAt(0).toUpperCase()}
                            </div>
                          `
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-[#b91c1c] mb-2">{profile.name}</h1>
                    <p className="text-xl text-gray-600 mb-3">
                      {profile.position || profile.current_company?.title || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-4">
                      {(profile.city || profile.current_company?.location) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {profile.city || profile.current_company?.location}, {profile.country_code || ""}
                          </span>
                        </div>
                      )}
                      {profile.current_company?.name && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{profile.current_company.name}</span>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.ai_industry?.industry && (
                        <Badge variant="outline" className="text-[#b91c1c] border-[#b91c1c] bg-[#fee2e2]">
                          Industry: {profile.ai_industry.industry}
                        </Badge>
                      )}
                      {profile.ai_industry?.expertise_level && (
                        <Badge variant="outline" className="text-[#b91c1c] border-[#b91c1c] bg-[#fee2e2]">
                          Expertise: {profile.ai_industry.expertise_level}
                        </Badge>
                      )}
                    </div>

                    <div className="relative">
                      {profile.ai_summary && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="absolute top-0 right-0 h-6 w-6 p-0">
                                <Info className="h-4 w-4 text-[#b91c1c]" />
                                <span className="sr-only">AI Summary</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{profile.ai_summary}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="experience" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4 bg-gray-100">
                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#b91c1c]"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#b91c1c]"
                >
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="certifications"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#b91c1c]"
                >
                  Certifications
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:text-[#b91c1c]">
                  Skills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="experience" className="space-y-4">
                <Card className="border-[#b91c1c] border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#b91c1c]">
                      <Briefcase className="w-5 h-5" />
                      Professional Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* {profile.experience && profile.experience.length > 0 ? (
                      profile.experience.map((exp, index) => (
                        <div key={index} className="relative">
                          {index !== profile.experience!.length - 1 && (
                            <div className="absolute left-6 top-8 w-px h-16 bg-gray-200" />
                          )}
                          <div className="flex gap-4">
                            <div className="w-3 h-3 bg-[#b91c1c] rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900">{exp.title}</h3>
                              <p className="text-[#b91c1c] font-medium">{exp.company}</p>
                              <p className="text-gray-500 text-sm mb-2">
                                {exp.start_date} - {exp.end_date} {exp.location ? `• ${exp.location}` : ""}
                              </p>
                              <p className="text-gray-700">{exp.description || "No description available"}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No experience information available</p>
                    )} */}
{profile.experience && profile.experience.length > 0 ? (
  profile.experience.map((exp, index) => (
    <div key={index} className="relative">
      {index !== profile.experience!.length - 1 && (
        <div className="absolute left-6 top-8 w-px h-16 bg-gray-200" />
      )}
      <div className="flex gap-4">
        {/* Company Logo */}
        {exp.company_logo_url && (
          <img
            src={exp.company_logo_url}
            alt={exp.company}
            className="w-10 h-10 object-contain rounded bg-gray-100 mt-1"
            style={{ minWidth: 40 }}
          />
        )}
        <div className="w-3 h-3 bg-[#b91c1c] rounded-full mt-2 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">
            {exp.title}
            {exp.url && (
              <a
                href={exp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs underline text-[#b91c1c]"
              >
                View
              </a>
            )}
          </h3>
          <p className="text-[#b91c1c] font-medium">
            {exp.company}
            {exp.company_id && (
              <span className="ml-2 text-xs text-gray-400">({exp.company_id})</span>
            )}
          </p>
          <p className="text-gray-500 text-sm mb-2">
            {exp.start_date} - {exp.end_date}
            {exp.duration && <span className="ml-2">({exp.duration})</span>}
            {exp.location ? ` • ${exp.location}` : ""}
          </p>
          {/* {exp.description && (
            <p className="text-gray-700">{exp.description}</p>
          )} */}
          {exp.description_html && (
            <div
              className="text-gray-700 text-sm mt-1"
              dangerouslySetInnerHTML={{ __html: exp.description_html }}
            />
          )}
          {/* Nested Positions */}
          {exp.positions && Array.isArray(exp.positions) && exp.positions.length > 0 && (
            <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-4">
              <h4 className="font-semibold text-sm text-gray-800 mb-1">Other Positions:</h4>
              <ul className="list-disc list-inside space-y-1">
                {exp.positions.map((pos, posIdx) => (
                  <li key={posIdx} className="text-gray-700 text-sm">
                    {pos.title}
                    {pos.start_date && ` (${pos.start_date} - ${pos.end_date || "Present"})`}
                    {pos.location && ` • ${pos.location}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  ))
) : (
  <p className="text-gray-500">No experience information available</p>
)}                    
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <Card className="border-[#b91c1c] border">
                  <CardHeader>
                    <CardTitle className="text-[#b91c1c]">Education</CardTitle>
                  </CardHeader>
                  <CardContent>
{profile.education && profile.education.length > 0 ? (
  <div className="space-y-4">
    {profile.education.map((edu, index) => (
      <div key={index} className="border-b pb-4 last:border-0 flex gap-4 items-start">
        {edu.institute_logo_url && (
          <img
            src={edu.institute_logo_url}
            alt={edu.title}
            className="w-10 h-10 object-contain rounded bg-gray-100"
            style={{ minWidth: 40 }}
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {edu.degree}
            {edu.field ? ` in ${edu.field}` : ""}
          </h3>
          <p className="text-[#b91c1c] font-medium">
            {edu.title}
            {edu.url && (
              <a
                href={edu.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs underline text-[#b91c1c]"
              >
                View
              </a>
            )}
          </p>
          <p className="text-gray-500 text-sm">
            {edu.start_year}
            {edu.end_year ? ` - ${edu.end_year}` : ""}
          </p>
          {edu.description && (
            <p className="text-gray-700 text-sm mt-1">{edu.description}</p>
          )}
          {edu.description_html && (
            <div
              className="text-gray-700 text-sm mt-1"
              dangerouslySetInnerHTML={{ __html: edu.description_html }}
            />
          )}
        </div>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500">No education information available</p>
)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certifications" className="space-y-4">
                <Card className="border-[#b91c1c] border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#b91c1c]">
                      <Award className="w-5 h-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.certifications && profile.certifications.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {profile.certifications.map((cert, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                            <p className="text-[#b91c1c]">{cert.issuer}</p>
                            <p className="text-gray-500 text-sm mb-2">{cert.date}</p>
                            {cert.url && (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#b91c1c] hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                View Certificate
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No certifications available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <Card className="border-[#b91c1c] border">
                  <CardHeader>
                    <CardTitle className="text-[#b91c1c]">Skills & Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {skills && skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No skills information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Similar Profiles Sidebar */}
          <div className="space-y-6">
            {/* AI Refresh Card */}
            <Card className="border-[#b91c1c] border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#b91c1c]">
                  <RefreshCw className="w-5 h-5" />
                  AI Refresh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Based on current work experience, this profile is predicted to be next refreshed on{" "}
                  <span className="font-medium font-bold text-gray-900">{formatRefreshDate(profile)}</span>
                </p>
              </CardContent>
            </Card>

            {/* AI Summary Card */}
            <Card className="border-[#b91c1c] border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#b91c1c]">
                  <Info className="w-5 h-5" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              {/* <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Industry</h4>
                  <p className="text-sm text-gray-900">{profile.ai_industry?.industry || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Expertise</h4>
                  <p className="text-sm text-gray-900">{profile.ai_industry?.expertise_level || "Not specified"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">AI Summary</h4>
                  <p className="text-sm text-gray-700">{profile.ai_summary || "No AI summary available"}</p>
                </div>
              </CardContent> */}
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Industry & Expertise</h4>
                  {Array.isArray(profile.ai_industry) && profile.ai_industry.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {profile.ai_industry.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-900">
                          <span className="font-semibold">{item.industry}</span>
                          {item.expertise && (
                            <span className="text-gray-600"> &mdash; {item.expertise.charAt(0).toUpperCase() + item.expertise.slice(1)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <p className="text-sm text-gray-900">
                        {profile.ai_industry?.industry || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-900">
                        {profile.ai_industry?.expertise_level || "Not specified"}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">AI Summary</h4>
                  <p className="text-sm text-gray-700">
                    {profile.ai_summary
                      ? (() => {
                          // Split into sentences, add <br /> after the second sentence
                          const sentences = profile.ai_summary.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g) || [profile.ai_summary];
                          if (sentences.length <= 2) {
                            return sentences.join(" ");
                          }
                          return (
                            <>
                              {sentences.slice(0, 2).join(" ")}
                              <br />
                              <br />
                              {sentences.slice(2).join(" ")}
                            </>
                          );
                        })()
                      : "No AI summary available"}
                  </p>
                </div>
              </CardContent>              
            </Card>

            {/* Similar Profiles Card - now properly separated */}
            <Card className="border-[#b91c1c] border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#b91c1c]">
                  <Users className="w-5 h-5" />
                  Similar Profiles
                </CardTitle>
                <p className="text-sm text-gray-600">Profiles with similar attributes</p>
              </CardHeader>
<CardContent className="space-y-4">
  {similarProfiles.length > 0 ? (
    similarProfiles.map((similar: RelatedProfile, index) => (
      <div
        key={index}
        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
        onClick={() => similar.id && router.push(`/profile/${similar.id}`)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-3 items-start">
            {similar.avatar && (
              <img
                src={similar.avatar}
                alt={similar.name}
                className="w-10 h-10 rounded-full object-cover bg-gray-100"
                style={{ minWidth: 40 }}
              />
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{similar.name}</h4>
              {similar.short_summary && (
                <p className="text-xs text-gray-500 mb-1">{similar.short_summary}</p>
              )}
              {/* Optionally add more fields here if needed */}
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-center py-4">
      No profiles with similar skills and experience found.
    </p>
  )}
</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
