import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Community, Post } from '../../types/Community';
import {
  Users,
  Lock,
  Globe,
  MessageSquare,
  Share2,
  ThumbsUp,
  Send,
  Plus,
  AlertCircle,
  Calendar,
  Settings,
} from 'lucide-react';

const CommunityDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await api.get(`/communities/${id}`);
        setCommunity(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [id]);

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setJoinLoading(true);
      if (community?.isPrivate && !showPasscodeModal) {
        setShowPasscodeModal(true);
        return;
      }

      await api.post(`/communities/${id}/join`, {
        passcode: community?.isPrivate ? passcode : undefined,
      });

      // Refresh community data
      const response = await api.get(`/communities/${id}`);
      setCommunity(response.data);
      setShowPasscodeModal(false);
      setPasscode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join community');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const response = await api.post(`/communities/${id}/posts`, {
        content: postContent,
      });

      // Update posts list
      setCommunity(prev => prev ? {
        ...prev,
        posts: [response.data, ...prev.posts],
      } : null);
      setPostContent('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Community not found'}
        </h2>
        <Link to="/communities" className="text-primary-600 dark:text-primary-400 hover:underline">
          Back to Communities
        </Link>
      </div>
    );
  }

  const isMember = community.members.includes(user?._id || '');
  const isOwner = community.owner === user?._id;
  const isModerator = community.moderators.includes(user?._id || '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Community Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500 relative">
          {community.image ? (
            <img
              src={community.image}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="h-16 w-16 text-white" />
            </div>
          )}
          {community.isPrivate && (
            <div className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2">
              <Lock className="h-5 w-5" />
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {community.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {community.description}
              </p>
            </div>
            {isAuthenticated && !isMember && (
              <button
                onClick={handleJoinCommunity}
                disabled={joinLoading}
                className="btn-primary py-2 px-4"
              >
                {joinLoading ? 'Joining...' : 'Join Community'}
              </button>
            )}
            {isOwner && (
              <Link
                to={`/communities/${id}/settings`}
                className="btn-outline py-2 px-4 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Community
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Users className="h-5 w-5 mr-2" />
              {community.members.length} members
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MessageSquare className="h-5 w-5 mr-2" />
              {community.posts.length} posts
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Globe className="h-5 w-5 mr-2" />
              {community.isPrivate ? 'Private' : 'Public'} community
            </div>
          </div>
        </div>
      </div>

      {/* Create Post */}
      {isMember && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share something with the community..."
              className="form-input min-h-[100px]"
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="btn-primary py-2 px-4 flex items-center"
                disabled={!postContent.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts */}
      <div className="mt-8 space-y-6">
        {community.posts.map((post: Post) => (
          <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {post.author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.author.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{post.content}</p>
                {post.media && post.media.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {post.media.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Post media ${index + 1}`}
                        className="rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <ThumbsUp className="h-5 w-5 mr-1" />
                    {post.likes.length}
                  </button>
                  <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <MessageSquare className="h-5 w-5 mr-1" />
                    {post.comments.length}
                  </button>
                </div>
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {comment.author.avatar ? (
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                              {comment.author.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.author.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isMember && (
                  <div className="mt-4 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="form-input flex-1"
                    />
                    <button className="btn-primary p-2">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Enter Community Passcode
            </h3>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="form-input mb-4"
              placeholder="Enter passcode"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasscodeModal(false)}
                className="btn-outline py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinCommunity}
                className="btn-primary py-2 px-4"
                disabled={!passcode}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetailPage;