// ============================================
// THREAD CARD COMPONENT
// ============================================
// Component untuk menampilkan card thread di halaman Home
// Menampilkan preview thread dengan title, excerpt, author, dan timestamp

import { MessageSquare, User, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function ThreadCard({ thread, onClick }) {
  // Format timestamp menggunakan date-fns
  // Jika createdAt adalah Firestore Timestamp, convert ke Date object
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Baru saja';
    
    try {
      // Firestore Timestamp memiliki method toDate()
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (error) {
      return 'Waktu tidak valid';
    }
  };

  // Truncate content untuk preview
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onClick(thread)}
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold hover:text-primary transition-colors">
          {thread.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          {/* Author Info */}
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {thread.authorName || 'Anonymous'}
          </span>
          
          {/* Timestamp */}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(thread.createdAt)}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Content Preview */}
        <p className="text-muted-foreground mb-3">
          {getExcerpt(thread.content)}
        </p>
        
        {/* Reply Count (optional - akan ditambahkan jika ada field replyCount) */}
        {thread.replyCount !== undefined && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>{thread.replyCount} balasan</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
