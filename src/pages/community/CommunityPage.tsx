import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { Community } from '../../types/Community';
import { Users, Search, Plus, Lock, Globe } from 'lucide-react';

const CommunityPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    const fetchCommunities = async () => {
      try {
        const response = await api.get('/communities');
        setCommunities(response.data.communities);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load communities');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory.toLowerCase() === 'all' ||
      community.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communities</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Join communities of professionals and share knowledge
          </p>
        </div>
        <Link
          to="/communities/create"
          className="mt-4 md:mt-0 btn-primary py-2 px-4 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Community
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities..."
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
      </div>

      {error && (
        <div className="bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-200 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCommunities.map(community => (
          <Link
            key={community._id}
            to={`/communities/${community._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500 relative">
              {community.image ? (
                <img
                  src={community.image}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
              )}
              {community.isPrivate && (
                <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                  <Lock className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {community.name}
                </h3>
                <span className="badge-primary">
                  {community.members.length} members
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {community.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="badge-secondary">{community.category}</span>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Globe className="h-4 w-4 mr-1" />
                  {community.isPrivate ? 'Private' : 'Public'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No communities found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;