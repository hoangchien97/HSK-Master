"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Video, ExternalLink, Users } from "lucide-react"
import { Card, CardBody, Chip, Button, Spinner, Tabs, Tab, Link as HeroLink } from "@heroui/react"
import { toast } from "react-toastify"
import Link from "next/link"
import api from "@/lib/http/client"

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
      const { data: classesData } = await api.get<ClassInfo[]>('/portal/classes', { meta: { loading: false } })
      setEnrolledClasses(classesData)

      // Fetch schedules
      const { data: schedulesData } = await api.get<Schedule[]>('/portal/schedules', { meta: { loading: false } })
      setSchedules(schedulesData)
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
        <Spinner size="lg" color="danger" />
      </div>
    )
  }

  const filteredSchedules = getFilteredSchedules()
  const groupedSchedules = groupSchedulesByDate(filteredSchedules)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lịch học của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">Xem lịch học sắp tới và tham gia lớp học</p>
      </div>

      {/* Filter Tabs */}
      <Tabs
        aria-label="Bộ lọc lịch"
        variant="underlined"
        color="danger"
        selectedKey={filter}
        onSelectionChange={(key) => setFilter(key as 'all' | 'upcoming' | 'today')}
      >
        <Tab key="today" title="Hôm nay" />
        <Tab key="upcoming" title="Sắp tới" />
        <Tab key="all" title="Tất cả" />
      </Tabs>

      {/* Enrolled Classes Summary */}
      {enrolledClasses.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Lớp học của tôi</h3>
              <HeroLink as={Link} href="/portal/student/classes" color="danger" size="sm">
                Xem tất cả
              </HeroLink>
            </div>
            <div className="flex flex-wrap gap-2">
              {enrolledClasses.map(cls => (
                <Chip key={cls.id} variant="flat" startContent={<Users className="w-3 h-3" />}>
                  {cls.className}
                  {cls.level && (
                    <span className="ml-1 text-xs font-semibold text-red-700">{cls.level}</span>
                  )}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Schedule List */}
      {Object.keys(groupedSchedules).length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {filter === 'today' ? 'Không có lịch học hôm nay' : 'Không có lịch học sắp tới'}
            </h3>
            <p className="text-gray-500">
              {filter === 'today' ? 'Thư giãn và chuẩn bị cho buổi học tiếp theo!' : 'Hãy đăng ký lớp học để bắt đầu'}
            </p>
          </CardBody>
        </Card>
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
                    <Card
                      key={schedule.id}
                      className={today ? 'border-red-300 bg-red-50/50' : ''}
                    >
                      <CardBody>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-bold text-gray-900">{schedule.title}</h4>
                              {today && (
                                <Chip size="sm" color="danger" variant="solid">HÔM NAY</Chip>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Chip size="sm" variant="flat">{schedule.class.className}</Chip>
                              {schedule.class.level && (
                                <Chip size="sm" color="danger" variant="flat">
                                  {schedule.class.level}
                                </Chip>
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
                            <Button
                              as="a"
                              href={schedule.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="danger"
                              startContent={<Video className="w-4 h-4" />}
                              endContent={<ExternalLink className="w-4 h-4" />}
                            >
                              Tham gia
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </Card>
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
