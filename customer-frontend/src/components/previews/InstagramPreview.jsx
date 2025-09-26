import { useState } from 'react'
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const InstagramPreview = ({ post, className = "" }) => {
  const { isDarkMode } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Mock user data
  const user = {
    username: "your_business",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    isVerified: true
  }

  // Parse hashtags and mentions from caption
  const formatCaption = (text) => {
    if (!text) return ""
    
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {word}{' '}
          </span>
        )
      } else if (word.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {word}{' '}
          </span>
        )
      }
      return word + ' '
    })
  }

  const renderMedia = () => {
    if (post.type === 'carousel' && post.media && post.media.length > 0) {
      return (
        <div className="relative aspect-square bg-gray-100">
          {/* Carousel Image */}
          <img 
            src={post.media[currentSlide]?.url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop"} 
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Carousel Navigation */}
          {post.media && post.media.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : post.media.length - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentSlide(prev => prev < post.media.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Slide Indicators */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {post.media.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )
    } else if (post.type === 'video') {
      return (
        <div className="relative aspect-square bg-gray-100">
          <img 
            src={post.thumbnail || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop"} 
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          {/* Video duration indicator */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            0:30
          </div>
        </div>
      )
    } else {
      // Single image post
      return (
        <div className="aspect-square bg-gray-100">
          <img 
            src={post.image || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop"} 
            alt="Post content"
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden max-w-sm mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            {/* Story ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full border-2 border-white"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`font-semibold text-sm ${isDarkMode ? 'text-slate-100' : ''}`}>{user.username}</span>
            {user.isVerified && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
        <button className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-800'}`}>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Media Content */}
      {renderMedia()}

      {/* Action Buttons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`transition-colors ${isLiked ? 'text-red-500' : isDarkMode ? 'text-slate-300 hover:text-slate-100' : 'text-gray-700 hover:text-gray-500'}`}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className={isDarkMode ? 'text-slate-300 hover:text-slate-100' : 'text-gray-700 hover:text-gray-500'}>
              <MessageCircle className="h-6 w-6" />
            </button>
            <button className={isDarkMode ? 'text-slate-300 hover:text-slate-100' : 'text-gray-700 hover:text-gray-500'}>
              <Send className="h-6 w-6" />
            </button>
          </div>
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={`transition-colors ${isSaved ? (isDarkMode ? 'text-slate-100' : 'text-gray-900') : (isDarkMode ? 'text-slate-300 hover:text-slate-100' : 'text-gray-700 hover:text-gray-500')}`}
          >
            <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="mb-2">
          <span className={`font-semibold text-sm ${isDarkMode ? 'text-slate-100' : ''}`}>
            {post.estimatedLikes || '1,234'} likes
          </span>
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span className={`font-semibold mr-2 ${isDarkMode ? 'text-slate-100' : ''}`}>{user.username}</span>
          <span className={isDarkMode ? 'text-slate-100' : 'text-gray-900'}>
            {formatCaption(post.caption || post.content?.caption)}
          </span>
        </div>

        {/* Hashtags (if separate from caption) */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-1 text-sm">
            {post.hashtags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-blue-600 font-medium mr-1">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
            {post.hashtags.length > 3 && (
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>... more</span>
            )}
          </div>
        )}

        {/* Comments Preview */}
        <div className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          View all {post.estimatedComments || '23'} comments
        </div>

        {/* Time */}
        <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} uppercase`}>
          {post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : '2 hours ago'}
        </div>
      </div>
    </div>
  )
}

export default InstagramPreview

