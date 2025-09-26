import { useState } from 'react'
import { 
  ThumbsUp, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Globe,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const FacebookPreview = ({ post, className = "" }) => {
  const { isDarkMode } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [reactions, setReactions] = useState({
    like: 42,
    love: 15,
    haha: 8,
    wow: 3,
    sad: 1,
    angry: 0
  })
  const [userReaction, setUserReaction] = useState(null)

  // Mock user data
  const user = {
    name: "Your Business",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop",
    isPage: true
  }

  // Format text with hashtags, mentions, and links
  const formatText = (text) => {
    if (!text) return ""
    
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-600 hover:underline cursor-pointer font-medium">
            {word}{' '}
          </span>
        )
      } else if (word.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 hover:underline cursor-pointer font-medium">
            {word}{' '}
          </span>
        )
      } else if (word.startsWith('http')) {
        return (
          <span key={index} className="text-blue-600 hover:underline cursor-pointer">
            {word.length > 30 ? word.substring(0, 30) + '...' : word}{' '}
          </span>
        )
      }
      return word + ' '
    })
  }

  const handleReaction = (reactionType) => {
    setReactions(prev => {
      const newReactions = { ...prev }
      
      // Remove previous reaction
      if (userReaction) {
        newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1)
      }
      
      // Add new reaction (or remove if same)
      if (userReaction !== reactionType) {
        newReactions[reactionType] = newReactions[reactionType] + 1
        setUserReaction(reactionType)
      } else {
        setUserReaction(null)
      }
      
      return newReactions
    })
  }

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const getReactionEmoji = (type) => {
    const emojis = {
      like: '👍',
      love: '❤️',
      haha: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😡'
    }
    return emojis[type] || '👍'
  }

  const getReactionColor = (type) => {
    const colors = {
      like: 'text-blue-500',
      love: 'text-red-500',
      haha: 'text-yellow-500',
      wow: 'text-yellow-500',
      sad: 'text-yellow-500',
      angry: 'text-orange-500'
    }
    return colors[type] || 'text-blue-500'
  }

  const renderMedia = () => {
    if (post.type === 'video') {
      return (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img 
            src={post.thumbnail || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
            alt="Video thumbnail"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-4">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-2 py-1 rounded">
            2:15
          </div>
        </div>
      )
    } else if (post.media && post.media.length > 0) {
      if (post.media.length === 1) {
        return (
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={post.media[0].url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
              alt="Post content"
              className="w-full h-64 object-cover"
            />
          </div>
        )
      } else {
        // Carousel for multiple images
        return (
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={post.media[currentSlide]?.url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-64 object-cover"
            />
            
            {/* Navigation */}
            {post.media.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : post.media.length - 1)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button 
                  onClick={() => setCurrentSlide(prev => prev < post.media.length - 1 ? prev + 1 : 0)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
                
                {/* Slide Counter */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded">
                  {currentSlide + 1} / {post.media.length}
                </div>
              </>
            )}
          </div>
        )
      }
    } else if (post.image) {
      return (
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={post.image || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
            alt="Post content"
            className="w-full h-64 object-cover"
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border rounded-lg shadow-sm overflow-hidden max-w-lg mx-auto ${className}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} hover:underline cursor-pointer`}>
                  {user.name}
                </h3>
                {user.isPage && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={`flex items-center space-x-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <span>{post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : '2 hours ago'}</span>
                <span>·</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>
          <button className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-full p-1`}>
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Post Text */}
        <div className={`mt-3 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} leading-relaxed`}>
          {formatText(post.caption || post.content?.caption)}
        </div>

        {/* Hashtags (if separate) */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="text-blue-600 hover:underline cursor-pointer font-medium mr-2">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {renderMedia() && (
        <div className="px-4 pb-3">
          {renderMedia()}
        </div>
      )}

        {/* Engagement Stats */}
        {totalReactions > 0 && (
          <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-100'}`}>
            <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                {topReactions.map(([type, count]) => (
                  <div key={type} className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} flex items-center justify-center text-xs ${getReactionColor(type)}`}>
                    {getReactionEmoji(type)}
                  </div>
                ))}
              </div>
              <span>{totalReactions}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{post.estimatedComments || '12'} comments</span>
              <span>{post.estimatedShares || '5'} shares</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-100'}`}>
        <div className="flex items-center justify-around">
          <button 
            onClick={() => handleReaction('like')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'} transition-colors ${
              userReaction === 'like' ? 'text-blue-500' : isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${userReaction === 'like' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-600'} transition-colors`}>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-600'} transition-colors`}>
            <Share className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Reaction Selector (hidden by default, shown on hover) */}
      <div className={`hidden group-hover:block absolute bottom-16 left-4 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'} rounded-full shadow-lg p-2`}>
        <div className="flex space-x-1">
          {Object.keys(reactions).map((type) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className="w-8 h-8 rounded-full hover:scale-125 transition-transform"
            >
              <span className="text-lg">{getReactionEmoji(type)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FacebookPreview

