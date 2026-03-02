"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface Event {
  id: number
  titleEn: string
  titleVi: string
  descriptionEn: string
  descriptionVi: string
  slug: string
  image: string | null
  eventDate: string
  eventTime: string | null
  locationEn: string | null
  locationVi: string | null
  addressEn: string | null
  addressVi: string | null
  maxAttendees: number | null
  currentAttendees: number
  price: number | null
  category: string | null
  featured: boolean
  registrationUrl: string | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("upcoming")

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === "upcoming") {
        params.append("upcoming", "true")
      } else if (filter === "featured") {
        params.append("featured", "true")
      }

      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const isPastEvent = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        <div className="bg-amber-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Events & Workshops
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join us for exciting culinary events, workshops, and tastings
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 flex justify-center gap-4">
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === "all"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("featured")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === "featured"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Featured
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No events found. Check back soon for upcoming workshops and tastings!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const past = isPastEvent(event.eventDate)
                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                      past ? "opacity-75" : ""
                    }`}
                  >
                    {event.image ? (
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={event.image}
                          alt={event.titleEn}
                          className="w-full h-full object-cover"
                        />
                        {event.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
                              Featured
                            </span>
                          </div>
                        )}
                        {past && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
                              Past Event
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center relative">
                        <span className="text-4xl">📅</span>
                        {event.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      {event.category && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                            {event.category}
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.titleEn}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {event.titleVi}
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-start text-sm text-gray-600">
                          <span className="font-semibold mr-2">📅</span>
                          <span>{formatDate(event.eventDate)}</span>
                        </div>

                        {event.eventTime && (
                          <div className="flex items-start text-sm text-gray-600">
                            <span className="font-semibold mr-2">🕐</span>
                            <span>{event.eventTime}</span>
                          </div>
                        )}

                        {event.locationEn && (
                          <div className="flex items-start text-sm text-gray-600">
                            <span className="font-semibold mr-2">📍</span>
                            <div>
                              <div>{event.locationEn}</div>
                              {event.locationVi && (
                                <div className="text-xs">{event.locationVi}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {event.maxAttendees && (
                          <div className="flex items-start text-sm text-gray-600">
                            <span className="font-semibold mr-2">👥</span>
                            <span>
                              {event.currentAttendees} / {event.maxAttendees} attendees
                            </span>
                          </div>
                        )}

                        <div className="flex items-start text-sm">
                          <span className="font-semibold mr-2">💰</span>
                          <span className="font-bold text-gray-900">
                            {event.price ? `£${event.price}` : "Free"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                        {event.descriptionEn}
                      </p>

                      {!past && event.registrationUrl && (
                        <div className="mt-6">
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 transition-colors"
                          >
                            Register Now
                          </a>
                        </div>
                      )}

                      {!past && !event.registrationUrl && (
                        <div className="mt-6">
                          <button className="block w-full text-center px-4 py-2 bg-gray-300 text-gray-600 font-medium rounded-md cursor-not-allowed">
                            Registration Coming Soon
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
