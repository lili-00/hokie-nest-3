import React, { useState, useEffect } from 'react';
import { Star, StarOff, Loader, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';
import { Link } from 'react-router-dom';

type Review = Database['public']['Tables']['reviews']['Row'];

interface ReviewSectionProps {
  propertyId: string;
}

export default function ReviewSection({ propertyId }: ReviewSectionProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchReviews();
    }
  }, [propertyId]);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      if (user) {
        const userReview = data?.find(review => review.user_id === user.id);
        if (userReview) {
          setUserReview(userReview);
          setRating(userReview.rating);
          setComment(userReview.comment);
        } else {
          setUserReview(null);
          setRating(5);
          setComment('');
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please log in to leave a review');
      return;
    }

    setSubmitting(true);

    try {
      if (editing && userReview) {
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success('Review updated successfully!');
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            rating,
            comment,
            reviewer_name: profile.full_name,
          });

        if (error) throw error;
        toast.success('Review submitted successfully!');
      }

      await fetchReviews();
      setEditing(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast.success('Review deleted successfully!');
      setUserReview(null);
      setRating(5);
      setComment('');
      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Reviews</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {typeof averageRating === 'string' ? (
              <span className="text-gray-600">{averageRating}</span>
            ) : (
              <>
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-medium">{averageRating}</span>
                <span className="text-gray-600 ml-1">({reviews.length} reviews)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {!user ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-700 mb-2">Please log in to leave a review</p>
          <Link
            to="/login"
            className="inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Log In
          </Link>
        </div>
      ) : !userReview && !editing ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-4">Write a Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <Star className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarOff className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Share your experience..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : null}

      {userReview && !editing && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium">Your Review</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="text-gray-600 hover:text-primary"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-600 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-700">{userReview.comment}</p>
        </div>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-4">Edit Your Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <Star className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarOff className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews
          .filter(review => review.user_id !== user?.id)
          .map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{review.reviewer_name}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}