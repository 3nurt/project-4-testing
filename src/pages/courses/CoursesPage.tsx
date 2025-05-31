import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { Course } from '../../types/Course';
import { BookOpen, Search, Plus, Star, Clock } from 'lucide-react';

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const categories = [
    'All',
    'Web Development',
    'Mobile Development',
    'Machine Learning',
    'Data Science',
    'Cybersecurity',
    'UI/UX Design',
    'DevOps',
    'Blockchain',
    'Cloud Computing',
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data.courses);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory.toLowerCase() === 'all' ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'free' && !course.isPaid) ||
      (priceFilter === 'paid' && course.isPaid);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Learn from experts and advance your career
          </p>
        </div>
        <Link
          to="/courses/create"
          className="mt-4 md:mt-0 btn-primary py-2 px-4 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Course
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-input"
        >
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="form-input"
        >
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {error && (
        <div className="bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-200 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map(course => (
          <Link
            key={course._id}
            to={`/courses/${course._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500 relative">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              )}
              {course.isPaid && (
                <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full px-2 py-1 text-sm font-medium">
                  ${course.price}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {course.title}
                </h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="badge-secondary">{course.category}</span>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.content.reduce((total, section) => 
                    total + section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0), 0
                  )} mins
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.content.reduce((total, section) => total + section.lessons.length, 0)} lessons
                </div>
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  {course.isPaid ? `$${course.price}` : 'Free'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;