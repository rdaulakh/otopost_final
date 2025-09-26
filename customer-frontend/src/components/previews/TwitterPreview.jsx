import { useState } from 'react'
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  MoreHorizontal,
  Verified,
  Play,
  BarChart3
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const TwitterPreview = ({ post, className = "" }) => {
  const { isDarkMode } = useTheme()
  const [isLiked, setIsLiked] = useState(false)
  const [isRetweeted, setIsRetweeted] = useState(false)
  const [likes, setLikes] = useState(parseInt(post.estimatedLikes) || 42)
  const [retweets, setRetweets] = useState(parseInt(post.estimatedRetweets) || 8)

  // Mock user data
  const user = {
    name: "Your Business",
    username: "yourbusiness",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop",
    isVerified: true
  }

  // Format text with hashtags, mentions, and links
  const formatText = (text) => {
    if (!text) return ""
    
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        )
      } else if (word.startsWith('@')) {
        return (
          <span key={index} className="text-blue-500 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        )
      } else if (word.startsWith('http')) {
        return (
          <span key={index} className="text-blue-500 hover:underline cursor-pointer">
            {word.length > 30 ? word.substring(0, 30) + '...' : word}{' '}
          </span>
        )
      }
      return word + ' '
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted)
    setRetweets(prev => isRetweeted ? prev - 1 : prev + 1)
  }

  const formatNumber = (num) => {
    if (!num || num === 0) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const renderMedia = () => {
    if (post.type === 'video') {
      return (
        <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-200">
          <img 
            src={post.thumbnail || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
            alt="Video thumbnail"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-500 rounded-full p-3 shadow-lg">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            0:45
          </div>
        </div>
      )
    } else if (post.image || (post.media && post.media.length > 0)) {
      const mediaItems = post.media || [{ url: post.image }]
      
      if (mediaItems.length === 1) {
        return (
          <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
            <img 
              src={mediaItems[0].url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop"} 
              alt="Post media"
              className="w-full h-64 object-cover"
            />
          </div>
        )
      } else if (mediaItems.length === 2) {
        return (
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-gray-200">
            {(mediaItems || []).slice(0, 2).map((media, index) => (
              <img 
                key={index}
                src={media.url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=250&h=200&fit=crop"} 
                alt={`Media ${index + 1}`}
                className="w-full h-32 object-cover"
              />
            ))}
          </div>
        )
      } else if (mediaItems.length >= 3) {
        return (
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-gray-200">
            <img 
              src={mediaItems[0].url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=250&h=200&fit=crop"} 
              alt="Media 1"
              className="w-full h-32 object-cover"
            />
            <div className="grid grid-rows-2 gap-1">
              <img 
                src={mediaItems[1].url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=250&h=100&fit=crop"} 
                alt="Media 2"
                className="w-full h-16 object-cover"
              />
              <div className="relative">
                <img 
                  src={mediaItems[2].url || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=250&h=100&fit=crop"} 
                  alt="Media 3"
                  className="w-full h-16 object-cover"
                />
                {mediaItems.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{mediaItems.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    }
    return null
  }

  const getCharacterCount = () => {
    const text = post.caption || post.content?.caption || ""
    return text.length
  }

  const isOverLimit = getCharacterCount() > 280

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-600 hover:bg-slate-700/50' : 'bg-white border-gray-200 hover:bg-gray-50/50'} border-b transition-colors cursor-pointer max-w-lg mx-auto ${className}`}>
      <div className="p-4">
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img 
              src={user.avatar} 
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-1 mb-1">
              <h3 className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} hover:underline cursor-pointer`}>
                {user.name}
              </h3>
              {user.isVerified && (
                <Verified className="h-5 w-5 text-blue-500 fill-current" />
              )}
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>@{user.username}</span>
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>·</span>
              <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'} text-sm`}>
                {post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : '2h'}
              </span>
              <div className="ml-auto">
                <button className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-full p-1`}>
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tweet Text */}
            <div className={`${isDarkMode ? 'text-slate-100' : 'text-gray-900'} text-[15px] leading-normal mb-2`}>
              {formatText(post.caption || post.content?.caption)}
            </div>

            {/* Character Count Indicator (if over limit) */}
            {isOverLimit && (
              <div className="mb-2">
                <span className="text-red-500 text-sm font-medium">
                  {getCharacterCount()}/280 characters
                </span>
              </div>
            )}

            {/* Hashtags (if separate) */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mb-2">
                {(post.hashtags || []).map((tag, index) => (
                  <span key={index} className="text-blue-500 hover:underline cursor-pointer mr-1">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {/* Media */}
            {renderMedia()}

            {/* Engagement Actions */}
            <div className={`flex items-center justify-between max-w-md mt-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              <button className={`flex items-center space-x-2 hover:text-blue-500 group`}>
                <div className={`p-2 rounded-full ${isDarkMode ? 'group-hover:bg-slate-700' : 'group-hover:bg-blue-50'}`}>
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-sm">{post.estimatedComments || '12'}</span>
              </button>

              <button 
                onClick={handleRetweet}
                className={`flex items-center space-x-2 hover:text-green-500 group ${
                  isRetweeted ? 'text-green-500' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${isDarkMode ? 'group-hover:bg-slate-700' : 'group-hover:bg-green-50'}`}>
                  <Repeat2 className="h-5 w-5" />
                </div>
                <span className="text-sm">{formatNumber(retweets)}</span>
              </button>

              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 hover:text-red-500 group ${
                  isLiked ? 'text-red-500' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${isDarkMode ? 'group-hover:bg-slate-700' : 'group-hover:bg-red-50'}`}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-sm">{formatNumber(likes)}</span>
              </button>

              <button className="flex items-center space-x-2 hover:text-blue-500 group">
                <div className={`p-2 rounded-full ${isDarkMode ? 'group-hover:bg-slate-700' : 'group-hover:bg-blue-50'}`}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-sm">{post.estimatedViews || '1.2K'}</span>
              </button>

              <button className="hover:text-blue-500 group">
                <div className={`p-2 rounded-full ${isDarkMode ? 'group-hover:bg-slate-700' : 'group-hover:bg-blue-50'}`}>
                  <Share className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwitterPreview

