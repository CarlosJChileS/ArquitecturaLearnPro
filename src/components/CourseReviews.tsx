import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Star, Send, ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';

interface CourseReviewsProps {
  courseId: string;
  canReview?: boolean;
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_name: string;
  user_avatar_url?: string;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, canReview = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`id, rating, review_text, created_at, profiles:user_id(full_name, avatar_url)`) 
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        review_text: r.review_text,
        created_at: r.created_at,
        user_name: r.profiles?.full_name || 'Usuario',
        user_avatar_url: r.profiles?.avatar_url || undefined
      }));

      setReviews(formatted);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user || !newReview.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({
          user_id: user.id,
          course_id: courseId,
          rating,
          review_text: newReview,
        })
        .select(
          `id, rating, review_text, created_at, profiles:user_id(full_name, avatar_url)`
        )
        .single();

      if (error) throw error;

      const review: Review = {
        id: data.id,
        rating: data.rating,
        review_text: data.review_text,
        created_at: data.created_at,
        user_name: data.profiles?.full_name || 'Usuario',
        user_avatar_url: data.profiles?.avatar_url || undefined,
      };

      setReviews((prev) => [review, ...prev]);
      setNewReview('');
      setRating(5);

      toast({
        title: 'Reseña enviada',
        description: 'Gracias por tu comentario sobre el curso.',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la reseña',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando reseñas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Review Form */}
      {canReview && user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Escribir una reseña
            </CardTitle>
            <CardDescription>
              Comparte tu experiencia con este curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        star <= rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5 estrellas
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review">Tu reseña</Label>
              <Textarea
                id="review"
                placeholder="Describe tu experiencia con el curso, qué te gustó más, qué mejorarías..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <Button 
              onClick={submitReview} 
              disabled={isSubmitting || !newReview.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar reseña
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reseñas del curso</CardTitle>
          <CardDescription>
            {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} de estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Sin reseñas aún</h3>
              <p className="text-muted-foreground">Sé el primero en reseñar este curso</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {review.user_avatar_url ? (
                        <img
                          src={review.user_avatar_url}
                          alt={review.user_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {review.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{review.user_name}</h4>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {review.review_text}
                      </p>
                      
                      {/* Review Actions */}
                      <div className="flex items-center space-x-4 mt-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Útil
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseReviews;