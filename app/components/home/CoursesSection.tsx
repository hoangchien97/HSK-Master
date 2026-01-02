import { getCourses } from '@/app/services';
import CoursesSectionClient from './CoursesSectionClient';

export default async function CoursesSection() {
  const courses = await getCourses();

  return <CoursesSectionClient courses={courses} />;
}
