import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Briefcase, Clock, DollarSign, Award, MessageCircle, Calendar } from 'lucide-react';
import { api } from './api';

const WorkerDetailModal = ({ worker, onClose, onBook }) => {
  const [workerDetails, setWorkerDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    loadWorkerDetails();
  }, [worker.id]);

  const loadWorkerDetails = async () => {
    try {
      setLoading(true);
      const [detailsRes, reviewsRes] = await Promise.all([
        api.get(`/consumer/workers/${worker.id}`),
        api.get(`/consumer/workers/${worker.id}/reviews?page=0&size=5`),
      ]);
      setWorkerDetails(detailsRes.data);
      setReviews(reviewsRes.data.reviews);
    } catch (error) {
      console.error('Failed to load worker details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateChat = async () => {
    try {
      await api.post(`/consumer/chat/initiate/${worker.userId}`);
      // Navigate to chat or open chat modal
      alert('Chat initiated! Check your messages.');
    } catch (error) {
      console.error('Failed to initiate chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Worker Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {workerDetails.profilePictureUrl ? (
                <img
                  src={workerDetails.profilePictureUrl}
                  alt={workerDetails.fullName}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <Briefcase className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {workerDetails.isVerified && (
                <div className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full">
                  <Award className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{workerDetails.fullName}</h3>
                  <p className="text-gray-600">Worker ID: {workerDetails.workerId}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    workerDetails.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {workerDetails.isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="flex items-center space-x-1 text-yellow-500 mb-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold text-lg text-gray-900">
                      {workerDetails.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{workerDetails.totalReviews} reviews</p>
                </div>

                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-lg text-gray-900">
                      {workerDetails.totalJobsCompleted}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Jobs completed</p>
                </div>

                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-lg text-gray-900">
                      {workerDetails.experienceYears}y
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>

                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-lg text-gray-900">
                      ₹{workerDetails.hourlyRate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Per hour</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['about', 'skills', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{workerDetails.bio || 'No bio available'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {workerDetails.city}, {workerDetails.state} - {workerDetails.pincode}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                <p className="text-gray-700">{workerDetails.languagesSpoken || 'Not specified'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Response Rate</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${workerDetails.responseRate}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">{workerDetails.responseRate}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              {workerDetails.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{skill.categoryName}</h4>
                    {skill.isPrimary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{skill.categoryDescription}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-700">
                      <strong>Level:</strong> {skill.proficiencyLevel}
                    </span>
                    <span className="text-gray-700">
                      <strong>Experience:</strong> {skill.yearsOfExperience} years
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-gray-700">
                            {review.consumerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.consumerName}</p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    {review.isVerified && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Verified Booking
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <button
              onClick={handleInitiateChat}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Message</span>
            </button>
            <button
              onClick={onBook}
              disabled={!workerDetails.isAvailable}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailModal;