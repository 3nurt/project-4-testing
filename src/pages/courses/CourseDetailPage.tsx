import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Course, Lesson } from '../../types/Course';
import {
  BookOpen,
  Clock,
  Star,
  Play,
  FileText,
  CheckCircle,
  Lock,
  AlertCircle,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        // Expand first section by default
        if (response.data.content.length > 0) {
          setExpandedSections([response.data.content[0]._id]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) return;

    try {
      setEnrolling(true);
      await api.post(`/courses/${id}/enroll`);
      
      // Refresh course data
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (!course?.isPaid || course.students.includes(user?._id || '')) {
      setSelectedLesson(lesson);
    }
  };

  const getTotalDuration = () => {
    return course?.content.reduce(
      (total, section) =>
        total + section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0),
      0
    ) || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Course not found'}
        </h2>
        <Link to="/courses" className="text-primary-600 dark:text-primary-400 hover:underline">
          Back to Courses
        </Link>
      </div>
    );
  }

  const isEnrolled = course.students.includes(user?._id || '');
  const isInstructor = course.instructor === user?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Course Header */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {getTotalDuration()} minutes
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  {course.rating.toFixed(1)} ({course.reviews.length} reviews)
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.students.length} students
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {course.reviews.length} discussions
                </div>
              </div>
            </div>

            {/* Video Player or Preview */}
            {selectedLesson ? (
              <div className="aspect-w-16 aspect-h-9 bg-black">
                {selectedLesson.type === 'video' ? (
                  <div className="w-full h-[400px] bg-gray-900 flex items-center justify-center">
                    {selectedLesson.videoUrl ? (
                      <video
                        src={selectedLesson.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <Play className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                ) : (
                  <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900 p-6 overflow-auto">
                    <h2 className="text-xl font-bold mb-4">{selectedLesson.title}</h2>
                    <div className="prose dark:prose-invert max-w-none">
                      {selectedLesson.content}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-gray-900">
                <div className="w-full h-[400px] flex items-center justify-center">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  )}
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Course Content
              </h2>
              <div className="space-y-4">
                {course.content.map((section) => (
                  <div
                    key={section._id}
                    className="border dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {section.lessons.length} lessons •{' '}
                          {section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)} minutes
                        </p>
                      </div>
                      {expandedSections.includes(section._id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    
                    {expandedSections.includes(section._id) && (
                      <div className="divide-y dark:divide-gray-700">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson._id}
                            onClick={() => handleLessonSelect(lesson)}
                            className={`w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                              selectedLesson?._id === lesson._id
                                ? 'bg-primary-50 dark:bg-primary-900/20'
                                : ''
                            }`}
                            disabled={!lesson.isFree && !isEnrolled && !isInstructor}
                          >
                            <div className="mr-4">
                              {lesson.type === 'video' ? (
                                <Play className="h-5 w-5" />
                              ) : (
                                <FileText className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {lesson.duration} minutes
                              </p>
                            </div>
                            {!lesson.isFree && !isEnrolled && !isInstructor && (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="p-6 border-t dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Student Reviews
              </h2>
              {course.reviews.length > 0 ? (
                <div className="space-y-6">
                  {course.reviews.map((review) => (
                    <div key={review._id} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                            {review.user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.user.name}
                          </h4>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          {review.comment}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No reviews yet. Be the first to review this course!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="mt-8 lg:mt-0">
          <div className="sticky top-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {course.isPaid ? `$${course.price}` : 'Free'}
                </div>
              </div>

              {!isEnrolled && !isInstructor ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !isAuthenticated}
                  className="btn-primary w-full py-3 mb-4"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <div className="bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-200 p-4 rounded-lg mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isInstructor ? "You're the instructor" : "You're enrolled"}
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                  Please{' '}
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
                    sign in
                  </Link>
                  {' '}to enroll in this course
                </p>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Total lessons</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.content.reduce((acc, section) => acc + section.lessons.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Total duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getTotalDuration()} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Enrolled students</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.students.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Last updated</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <hr className="my-6 border-gray-200 dark:border-gray-700" />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  This course includes
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    {course.content.reduce(
                      (acc, section) =>
                        acc + section.lessons.filter(l => l.type === 'video').length,
                      0
                    )} video lessons
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {course.content.reduce(
                      (acc, section) =>
                        acc + section.lessons.filter(l => l.type === 'text').length,
                      0
                    )} reading materials
                  </li>
                  <li className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discussion forums
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Certificate of completion
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;