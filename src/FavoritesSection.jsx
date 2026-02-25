import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { api } from './api';

const FavoritesSection = ({ onWorkerSelect }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await api.get('/consumer/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (workerId) => {
    try {
      await api.delete(`/consumer/favorites/${workerId}`);
      loadFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Favorite Workers
      </h1>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((worker) => (
            <div
              key={worker.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h3 className="font-semibold text-lg mb-2">
                {worker.fullName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {worker.primarySkill}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onWorkerSelect(worker)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => handleRemoveFavorite(worker.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No favorite workers yet</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
