import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  grade?: string;
  points?: number;
  semesterId?: string;
}

export interface PlannerItem {
  id: string;
  title: string;
  courseId: string;
  category: 'Assignment' | 'Test' | 'Quiz' | 'Exam' | 'Project' | 'Reading' | 'Study' | 'Reminder';
  date: string;
  time: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  reminder: boolean;
  completed: boolean;
}

export interface StudySession {
  id: string;
  courseId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  recurring: boolean;
}

export interface RevisionTopic {
  id: string;
  courseId: string;
  title: string;
  completed: boolean;
}

export interface StudyGoal {
  id: string;
  title: string;
  type: 'time' | 'task';
  target: number; // minutes for time, count for task
  progress: number;
  date: string;
}

export interface StudyStats {
  date: string;
  hoursStudied: number;
  tasksCompleted: number;
  resourcesOpened: number;
}

interface EduSphereDB extends DBSchema {
  courses: {
    key: string;
    value: Course;
    indexes: { 'by-code': string };
  };
  planner: {
    key: string;
    value: PlannerItem;
    indexes: { 'by-date': string, 'by-course': string };
  };
  studySchedule: {
    key: string;
    value: StudySession;
    indexes: { 'by-day': string };
  };
  revision: {
    key: string;
    value: RevisionTopic;
    indexes: { 'by-course': string };
  };
  goals: {
    key: string;
    value: StudyGoal;
    indexes: { 'by-date': string };
  };
  stats: {
    key: string;
    value: StudyStats;
  };
}

let dbPromise: Promise<IDBPDatabase<EduSphereDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return null;

  if (!dbPromise) {
    dbPromise = openDB<EduSphereDB>('edusphere-local', 1, {
      upgrade(db) {
        const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
        courseStore.createIndex('by-code', 'code');

        const plannerStore = db.createObjectStore('planner', { keyPath: 'id' });
        plannerStore.createIndex('by-date', 'date');
        plannerStore.createIndex('by-course', 'courseId');

        const scheduleStore = db.createObjectStore('studySchedule', { keyPath: 'id' });
        scheduleStore.createIndex('by-day', 'day');

        const revisionStore = db.createObjectStore('revision', { keyPath: 'id' });
        revisionStore.createIndex('by-course', 'courseId');

        const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
        goalStore.createIndex('by-date', 'date');

        db.createObjectStore('stats', { keyPath: 'date' });
      },
    });
  }
  return dbPromise;
};

// Course Helpers
export const addCourse = async (course: Course) => {
  const db = await getDB();
  if (!db) return;
  return db.put('courses', course);
};

export const getCourses = async () => {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('courses');
};

export const deleteCourse = async (id: string) => {
  const db = await getDB();
  if (!db) return;
  return db.delete('courses', id);
};
