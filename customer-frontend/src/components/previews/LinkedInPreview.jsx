import { useState } from 'react'
import { 
  ThumbsUp, 
  MessageCircle, 
  Repeat2, 
  Send, 
  MoreHorizontal,
  Building2,
  Globe,
  Users
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const LinkedInPreview = ({ post, className = "" }) => {
  const { isDarkMode } = useTheme()
  const [isLiked, setIsLiked] = useState(false)
  const [reactions, setReactions] = useState({
    like: 42,
    celebrate: 8,
    support: 3,
    love: 12,
    insightful: 15,
    funny: 2
  })

  // Mock user/company data
  const profile = {
    name: "Your Business",
    title: "SaaS Company",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop",
    isCompany: true,
    followers: "1,234",
    connectionDegree: null // null for company pages
  }

  // Format text with hashtags and mentions
  const formatText = (text) => {
    if (!text) return ""
    
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-600 font-medium hover:underline cursor-pointer">
            {word}{' '}
          </span>
        )
      } else if (word.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium hover:underline cursor-pointer">
            {word}{' '}
          </span>
        )
      }
      return word + ' '
    })
  }

  const handleReaction = () => {
    setIsLiked(!isLiked)
    setReactions(prev => ({
      ...prev,
      like: isLiked ? prev.like - 1 : prev.like + 1
    }))
  }

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)

  const renderMedia = () => {
    if (post.type === 'video') {
      return (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={post.thumbnail || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
            alt="Video thumbnail"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 rounded-full p-4 shadow-lg">
              <svg className="h-6 w-6 text-white fill-white ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            2:30
          </div>
        </div>
      )
    } else if (post.image || (post.media && post.media.length > 0)) {
      return (
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={post.image || post.media?.[0]?.url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
            alt="Post content"
            className="w-full h-64 object-cover"
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden max-w-lg mx-auto ${className}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {profile.isCompany && (
                <div className="absolute -bottom-1 -right-1 bg-gray-600 rounded-full p-1">
                  <Building2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} hover:text-blue-600 cursor-pointer`}>
                  {profile.name}
                </h3>
                {profile.connectionDegree && (
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>• {profile.connectionDegree}</span>
                )}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{profile.title}</p>
              <div className={`flex items-center space-x-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mt-1`}>
                <span>{post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : '2h'}</span>
                <span>•</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>
          <button className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}>
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mt-3">
          <div className={`${isDarkMode ? 'text-slate-100' : 'text-gray-900'} text-sm leading-relaxed whitespace-pre-wrap`}>
            {formatText(post.caption || post.content?.caption)}
          </div>
          
          {/* Hashtags (if separate) */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-2">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-blue-600 text-sm font-medium hover:underline cursor-pointer mr-2">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media */}
      {renderMedia() && (
        <div className="px-4 pb-3">
          {renderMedia()}
        </div>
      )}

      {/* Engagement Stats */}
      <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-100'}`}>
        <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          <div className="flex items-center space-x-1">
            {/* Reaction Icons */}
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
              </div>
              <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👏</span>
              </div>
              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">❤️</span>
              </div>
            </div>
            <span>{totalReactions}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{post.estimatedComments || '8'} comments</span>
            <span>{post.estimatedShares || '3'} reposts</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-100'}`}>
        <div className="flex items-center justify-around">
          <button 
            onClick={handleReaction}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'} transition-colors ${
              isLiked ? 'text-blue-600' : isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-600'} transition-colors`}>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-600'} transition-colors`}>
            <Repeat2 className="h-5 w-5" />
            <span className="text-sm font-medium">Repost</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-600'} transition-colors`}>
            <Send className="h-5 w-5" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LinkedInPreview

