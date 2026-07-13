'use client'

import { useState, useEffect, useCallback } from 'react';
import { getCourses, addCourse, deleteCourse, Course } from '@/lib/db';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const saveCourse = async (course: Course) => {
    await addCourse(course);
    await fetchCourses();
  };

  const removeCourse = async (id: string) => {
    await deleteCourse(id);
    await fetchCourses();
  };

  return { courses, loading, saveCourse, removeCourse, refreshCourses: fetchCourses };
}
