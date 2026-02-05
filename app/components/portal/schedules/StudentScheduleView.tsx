"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Video, ExternalLink, Users } from "lucide-react"
import { PageHeader } from "@/app/components/portal/common"
import { toast } from "react-toastify"
import Link from "next/link"

interface ClassInfo {
  id: string
  className: string
  classCode: string
  level?: string
}

interface Schedule {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  meetingLink?: string
  status: string
  class: ClassInfo
}

export default function StudentScheduleView() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [enrolledClasses, setEnrolledClasses] = useState<ClassInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today'>('upcoming')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch enrolled classes
      const classesRes = await fetch('/api/portal/classes')
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setEnrolledClasses(classesData)
      }

      // Fetch schedules
      const schedulesRes = await fetch('/api/portal/schedules')
      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Không thể tải lịch học')
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredSchedules = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let filtered = schedules

    if (filter === 'today') {
      filtered = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.startTime)
        return scheduleDate >= today && scheduleDate < tomorrow
      })
    } else if (filter === 'upcoming') {
      filtered = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.startTime)
        return scheduleDate >= now
      })
    }

    return filtered.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
  }

  const groupSchedulesByDate = (schedules: Schedule[]) => {
    const grouped: Record<string, Schedule[]> = {}
    
    schedules.forEach(schedule => {
      const date = new Date(schedule.startTime).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(schedule)
    })
    
    return grouped
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const filteredSchedules = getFilteredSchedules()
  const groupedSchedules = groupSchedulesByDate(filteredSchedules)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch học của tôi"
        description="Xem lịch học sắp tới và tham gia lớp học"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'today'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Hôm nay
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'upcoming'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Sắp tới
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tất cả
        </button>
      </div>

      {/* Enrolled Classes Summary */}
      {enrolledClasses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Lớp học của tôi</h3>
            <Link
              href="/portal/student/classes"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {enrolledClasses.map(cls => (
              <div
                key={cls.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{cls.className}</span>
                {cls.level && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">
                    {cls.level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule List */}
      {Object.keys(groupedSchedules).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {filter === 'today' ? 'Không có lịch học hôm nay' : 'Không có lịch học sắp tới'}
          </h3>
          <p className="text-gray-500">
            {filter === 'today' ? 'Thư giãn và chuẩn bị cho buổi học tiếp theo!' : 'Hãy đăng ký lớp học để bắt đầu'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([date, schedules]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 sticky top-0 bg-gray-50 py-2 z-10">
                {date}
              </h3>
              <div className="space-y-3">
                {schedules.map(schedule => {
                  const startTime = new Date(schedule.startTime)
                  const endTime = new Date(schedule.endTime)
                  const upcoming = isUpcoming(schedule.startTime)
                  const today = isToday(schedule.startTime)

                  return (
                    <div
                      key={schedule.id}
                      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${
                        today ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{schedule.title}</h4>
                            {today && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full">
                                HÔM NAY
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="px-2 py-1 bg-gray-100 rounded font-medium">
                              {schedule.class.className}
                            </span>
                            {schedule.class.level && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold text-xs">
                                {schedule.class.level}
                              </span>
                            )}
                          </div>

                          {schedule.description && (
                            <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {schedule.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {schedule.meetingLink && upcoming && (
                          <a
                            href={schedule.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                          >
                            <Video className="w-4 h-4" />
                            Tham gia
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
