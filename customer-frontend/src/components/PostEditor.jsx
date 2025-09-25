import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X,
  Upload,
  Image,
  Video,
  FileText,
  Sparkles,
  Eye,
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  Check,
  RefreshCw,
  Edit3,
  Crop,
  Palette,
  Type,
  Download,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Zap,
  Target,
  BarChart3,
  Clock,
  Users,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import PlatformPreview from './previews/PlatformPreview.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'

// Import API hooks and UX components
import { 
  useCreateContent,
  useUpdateContent,
  useUploadMedia,
  useAIContentGeneration
} from '../hooks/useCustomerApi.js'
import { useNotificationSystem } from './NotificationSystem.jsx'

const PostEditor = ({ post, isOpen, onClose, onSave }) => {
  const { isDarkMode } = useTheme()
  
  // UX hooks
  const { success, error, info } = useNotificationSystem()
  
  // Real API hooks
  const { 
    mutate: createContent, 
    isLoading: isCreating,
    error: createError 
  } = useCreateContent()
  
  const { 
    mutate: updateContent, 
    isLoading: isUpdating 
  } = useUpdateContent()
  
  const { 
    mutate: uploadMedia, 
    isLoading: isUploading 
  } = useUploadMedia()
  
  const { 
    mutate: generateAIContent, 
    isLoading: isGeneratingContent 
  } = useAIContentGeneration()
  
  // Mock hashtag generation for now
  const generateHashtags = (content) => {
    info('Generating hashtags...')
    // Mock hashtag generation - replace with real implementation
    setTimeout(() => {
      success('Hashtags generated successfully!')
    }, 1000)
  }
  
  // Mock content suggestions for now
  const contentSuggestions = []
  const isFetchingSuggestions = false

  // Hashtag generation state
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false)

  // Component state
  const [activeTab, setActiveTab] = useState('ai-content')
  const [editedPost, setEditedPost] = useState(post || {
    caption: '',
    hashtags: '',
    platforms: ['instagram'],
    type: 'image',
    media: [],
    scheduledTime: null
  })
  const [uploadedMedia, setUploadedMedia] = useState(post?.media || [])
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [selectedPostType, setSelectedPostType] = useState(post?.type || 'image')
  const [carouselSlides, setCarouselSlides] = useState(post?.media || [])
  const [videoSettings, setVideoSettings] = useState({
    duration: 30,
    thumbnail: null,
    trimStart: 0,
    trimEnd: 30
  })
  const fileInputRef = useRef(null)

  // Loading states
  const isSaving = isCreating || isUpdating
  const isProcessing = isGeneratingContent || isGeneratingHashtags || isFetchingSuggestions

  // Character limits per platform
  const platformLimits = {
    instagram: { caption: 2200, hashtags: 30 },
    linkedin: { caption: 3000, hashtags: 5 },
    twitter: { caption: 280, hashtags: 3 },
    facebook: { caption: 63206, hashtags: 10 },
    youtube: { caption: 5000, hashtags: 15 }
  }

  // Post type definitions
  const postTypes = {
    image: { 
      label: 'Single Image', 
      icon: Image, 
      description: 'Single photo post',
      platforms: ['instagram', 'facebook', 'linkedin', 'twitter']
    },
    carousel: { 
      label: 'Carousel', 
      icon: Grid, 
      description: 'Multiple images/slides',
      platforms: ['instagram', 'facebook', 'linkedin']
    },
    video: { 
      label: 'Video', 
      icon: Video, 
      description: 'Video content',
      platforms: ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube']
    },
    reel: { 
      label: 'Reel/Short', 
      icon: Video, 
      description: 'Short-form vertical video',
      platforms: ['instagram', 'facebook', 'youtube']
    },
    text_post: { 
      label: 'Text Only', 
      icon: FileText, 
      description: 'Text-based post',
      platforms: ['linkedin', 'twitter', 'facebook']
    }
  }

  // Carousel management functions
  const addCarouselSlide = (mediaItem) => {
    setCarouselSlides(prev => [...prev, mediaItem])
    setEditedPost(prev => ({
      ...prev,
      type: 'carousel',
      media: [...(prev.media || [])]
    }))
  }

  const removeCarouselSlide = (index) => {
    setCarouselSlides(prev => prev.filter((_, i) => i !== index))
    setEditedPost(prev => ({
      ...prev,
      media: prev.media?.filter((_, i) => i !== index)
    }))
  }

  const reorderCarouselSlides = (fromIndex, toIndex) => {
    setCarouselSlides(prev => {
      const newSlides = [...prev]
      const [removed] = newSlides.splice(fromIndex, 1)
      newSlides.splice(toIndex, 0, removed)
      return newSlides
    })
    setEditedPost(prev => ({
      ...prev,
      media: carouselSlides
    }))
  }

  const handlePostTypeChange = (newType) => {
    setSelectedPostType(newType)
    setEditedPost(prev => ({
      ...prev,
      type: newType
    }))
  }

  const handleFileUpload = useCallback(async (files) => {
    try {
      info(`Uploading ${files.length} file(s)...`)
      
      for (let file of files) {
        const mediaItem = {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadProgress: 0,
          aiAnalysis: null
        }
        
        setUploadedMedia(prev => [...prev, mediaItem])
        
        // Real API upload with progress tracking
        await uploadMedia(
          { file, type: selectedPostType },
          {
            onSuccess: (response) => {
              setUploadedMedia(prev => 
                prev.map(item => 
                  item.id === mediaItem.id 
                    ? { 
                        ...item, 
                        uploadProgress: 100,
                        url: response.url,
                        aiAnalysis: response.aiAnalysis
                      }
                    : item
                )
              )
              success(`${file.name} uploaded successfully`)
            },
            onError: (err) => {
              error(`Failed to upload ${file.name}`)
              setUploadedMedia(prev => prev.filter(item => item.id !== mediaItem.id))
            }
          }
        )
      }
    } catch (err) {
      error('Upload failed. Please try again.')
    }
  }, [uploadMedia, selectedPostType, success, error, info])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const generateAISuggestions = async () => {
    try {
      info('Generating AI suggestions...')
      
      // Generate AI content suggestions
      await generateAIContent(
        {
          currentCaption: editedPost.caption,
          hashtags: editedPost.hashtags,
          platforms: editedPost.platforms,
          postType: selectedPostType,
          media: uploadedMedia
        },
        {
          onSuccess: (suggestions) => {
            setAiSuggestions(suggestions)
            success('AI suggestions generated successfully!')
          },
          onError: (err) => {
            error('Failed to generate AI suggestions')
          }
        }
      )
    } catch (err) {
      error('AI suggestion generation failed. Please try again.')
    }
  }

  const applySuggestion = (suggestion) => {
    if (suggestion.type === 'caption') {
      setEditedPost(prev => ({
        ...prev,
        content: { ...prev.content, caption: suggestion.preview }
      }))
    } else if (suggestion.type === 'hashtags') {
      setEditedPost(prev => ({
        ...prev,
        content: { ...prev.content, hashtags: suggestion.preview }
      }))
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram
      case 'linkedin': return Linkedin
      case 'twitter': return Twitter
      case 'facebook': return Facebook
      case 'youtube': return Youtube
      default: return Globe
    }
  }

  // Handle save functions
  const handleSaveDraft = async () => {
    try {
      const contentData = {
        ...editedPost,
        media: uploadedMedia,
        type: selectedPostType,
        status: 'draft'
      }

      if (post?.id) {
        await updateContent({ id: post.id, ...contentData })
        success('Draft updated successfully!')
      } else {
        await createContent(contentData)
        success('Draft saved successfully!')
      }
      
      if (onSave) {
        onSave(contentData)
      }
    } catch (err) {
      error('Failed to save draft. Please try again.')
    }
  }

  const handleSaveChanges = async () => {
    try {
      const contentData = {
        ...editedPost,
        media: uploadedMedia,
        type: selectedPostType,
        status: 'ready'
      }

      if (post?.id) {
        await updateContent({ id: post.id, ...contentData })
        success('Content updated successfully!')
      } else {
        await createContent(contentData)
        success('Content created successfully!')
      }
      
      if (onSave) {
        onSave(contentData)
      }
      onClose()
    } catch (err) {
      error('Failed to save changes. Please try again.')
    }
  }

  // Generate hashtags with AI
  const handleGenerateHashtags = async () => {
    try {
      setIsGeneratingHashtags(true)
      await generateHashtags(
        {
          caption: editedPost.caption,
          platforms: editedPost.platforms,
          postType: selectedPostType
        },
        {
          onSuccess: (hashtags) => {
            setEditedPost(prev => ({
              ...prev,
              hashtags: hashtags.join(' ')
            }))
            success('AI hashtags generated!')
          },
          onError: (err) => {
            error('Failed to generate hashtags')
          }
        }
      )
    } catch (err) {
      error('Hashtag generation failed. Please try again.')
    } finally {
      setIsGeneratingHashtags(false)
    }
  }

  const currentLimit = platformLimits[post?.platform?.toLowerCase()] || platformLimits.instagram
  const captionLength = editedPost?.content?.caption?.length || 0
  const hashtagCount = editedPost?.content?.hashtags?.length || 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isDarkMode ? 'bg-slate-900/80' : 'bg-black/50'}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b min-h-[80px] ${
            isDarkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {(() => {
                  const PlatformIcon = getPlatformIcon(post?.platform)
                  return <PlatformIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                })()}
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  Edit Post: {post?.title}
                </h2>
              </div>
              <Badge variant="outline" className={`flex-shrink-0 ${isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                {post?.postType}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
                <span className="sm:hidden">{showPreview ? 'Hide' : 'Show'}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Main Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <TabsList className={`grid w-auto grid-cols-4 m-6 mb-0 flex-shrink-0 ${isDarkMode ? 'bg-slate-700/80' : 'bg-slate-100'}`}>
                  <TabsTrigger 
                    value="post-type" 
                    className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300' : ''}`}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Post Type
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ai-content" 
                    className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300' : ''}`}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload-media" 
                    className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300' : ''}`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hybrid-mode" 
                    className={`flex items-center ${isDarkMode ? 'data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300' : ''}`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Hybrid Mode
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="p-8 pt-6 h-full">
                  
                  {/* Post Type Selector Tab */}
                  <TabsContent value="post-type" className="space-y-6 mt-0 p-0">
                    <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                      <CardHeader>
                        <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                          <Type className="h-5 w-5 mr-2 text-blue-600" />
                          Select Post Format
                        </CardTitle>
                        <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                          Choose the format that best fits your content and platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(postTypes).map(([type, config]) => {
                            const IconComponent = config.icon
                            const isSupported = config.platforms.includes(post?.platform?.toLowerCase())
                            const isSelected = selectedPostType === type
                            
                            return (
                              <button
                                key={type}
                                onClick={() => isSupported && handlePostTypeChange(type)}
                                disabled={!isSupported}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  isSelected 
                                    ? `border-blue-500 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` 
                                    : isSupported
                                    ? `${isDarkMode ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`
                                    : `${isDarkMode ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'}`
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <IconComponent className={`h-6 w-6 mt-1 ${
                                    isSelected ? 'text-blue-600' : isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                  }`} />
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${
                                      isSelected ? (isDarkMode ? 'text-blue-300' : 'text-blue-900') : (isDarkMode ? 'text-slate-100' : 'text-slate-900')
                                    }`}>
                                      {config.label}
                                    </h4>
                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                      {config.description}
                                    </p>
                                    {!isSupported && (
                                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                        Not supported on {post?.platform}
                                      </p>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <Check className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {/* Format-specific settings */}
                        {selectedPostType === 'carousel' && (
                          <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                            <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Carousel Settings</h5>
                            <div className="space-y-3">
                              <div>
                                <Label className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Number of slides: {carouselSlides.length}</Label>
                                <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Upload images to create carousel slides</p>
                              </div>
                              {carouselSlides.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                  {carouselSlides.map((slide, index) => (
                                    <div key={index} className="relative group">
                                      <img 
                                        src={slide.url} 
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-16 object-cover rounded border"
                                      />
                                      <button
                                        onClick={() => removeCarouselSlide(index)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {(selectedPostType === 'video' || selectedPostType === 'reel') && (
                          <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                            <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>Video Settings</h5>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>Duration (seconds)</Label>
                                  <Input
                                    type="number"
                                    value={videoSettings.duration}
                                    onChange={(e) => setVideoSettings(prev => ({
                                      ...prev,
                                      duration: parseInt(e.target.value)
                                    }))}
                                    className={`mt-1 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`}
                                    min="1"
                                    max={selectedPostType === 'reel' ? 90 : 600}
                                  />
                                </div>
                                <div>
                                  <Label className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>Aspect Ratio</Label>
                                  <select className={`w-full mt-1 p-2 border rounded-md ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}`}>
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai-content" className="space-y-6 mt-0 p-0">
                    {/* AI-Generated Content Editor */}
                    <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                      <CardHeader>
                        <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                          <Edit3 className="h-5 w-5 mr-2 text-purple-600" />
                          Edit AI-Generated Content
                        </CardTitle>
                        <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                          Modify the AI-created caption, hashtags, and visual description
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        {/* Caption Editor */}
                        <div>
                          <Label htmlFor="caption" className="flex items-center justify-between">
                            <span>Caption</span>
                            <span className={`text-sm ${captionLength > currentLimit.caption ? 'text-red-600' : 'text-slate-500'}`}>
                              {captionLength}/{currentLimit.caption}
                            </span>
                          </Label>
                          <Textarea
                            id="caption"
                            value={editedPost?.content?.caption || ''}
                            onChange={(e) => setEditedPost(prev => ({
                              ...prev,
                              content: { ...prev.content, caption: e.target.value }
                            }))}
                            className="min-h-[120px] mt-2"
                            placeholder="Enter your post caption..."
                          />
                        </div>

                        {/* Hashtags Editor */}
                        <div>
                          <Label htmlFor="hashtags" className={`flex items-center justify-between ${isDarkMode ? 'text-slate-100' : ''}`}>
                            <span>Hashtags</span>
                            <span className={`text-sm ${hashtagCount > currentLimit.hashtags ? (isDarkMode ? 'text-red-400' : 'text-red-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                              {hashtagCount}/{currentLimit.hashtags}
                            </span>
                          </Label>
                          <div className={`flex flex-wrap gap-2 mt-2 p-3 border rounded-lg ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50'}`}>
                            {editedPost?.content?.hashtags?.map((tag, index) => (
                              <Badge key={index} variant="secondary" className={`flex items-center ${isDarkMode ? 'bg-slate-700 text-slate-200 border-slate-600' : ''}`}>
                                {tag}
                                <button
                                  onClick={() => {
                                    const newHashtags = editedPost.content.hashtags.filter((_, i) => i !== index)
                                    setEditedPost(prev => ({
                                      ...prev,
                                      content: { ...prev.content, hashtags: newHashtags }
                                    }))
                                  }}
                                  className={`ml-1 ${isDarkMode ? 'hover:text-red-400' : 'hover:text-red-600'}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            <Input
                              placeholder="Add hashtag..."
                              className={`w-32 h-6 text-sm border-0 bg-transparent ${isDarkMode ? 'text-slate-200 placeholder-slate-400' : ''}`}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  const newTag = e.target.value.trim().startsWith('#') 
                                    ? e.target.value.trim() 
                                    : `#${e.target.value.trim()}`
                                  setEditedPost(prev => ({
                                    ...prev,
                                    content: { 
                                      ...prev.content, 
                                      hashtags: [...(prev.content.hashtags || [])]
                                    }
                                  }))
                                  e.target.value = ''
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Visual Description Editor */}
                        <div>
                          <Label htmlFor="visual">Visual Description</Label>
                          <Textarea
                            id="visual"
                            value={editedPost?.content?.visualDescription || ''}
                            onChange={(e) => setEditedPost(prev => ({
                              ...prev,
                              content: { ...prev.content, visualDescription: e.target.value }
                            }))}
                            className="min-h-[80px] mt-2"
                            placeholder="Describe the visual design for this post..."
                          />
                        </div>

                        {/* AI Suggestions */}
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">AI Suggestions</h4>
                            <Button size="sm" variant="outline" onClick={generateAISuggestions}>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Get Suggestions
                            </Button>
                          </div>
                          {aiSuggestions.length > 0 && (
                            <div className="space-y-3">
                              {aiSuggestions.map((suggestion, index) => (
                                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        {suggestion.suggestion}
                                      </p>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {typeof suggestion.preview === 'string' 
                                          ? suggestion.preview 
                                          : suggestion.preview.join(' ')
                                        }
                                      </p>
                                    </div>
                                    <Button size="sm" onClick={() => applySuggestion(suggestion)}>
                                      Apply
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="upload-media" className="space-y-6 mt-0 p-0">
                    {/* Media Upload Interface */}
                    <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                      <CardHeader>
                        <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                          <Upload className="h-5 w-5 mr-2 text-green-600" />
                          Upload Your Media
                        </CardTitle>
                        <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                          Upload images, videos, or complete post designs. AI will analyze and optimize them.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Drag & Drop Zone */}
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Drop files here or click to upload
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Support for JPG, PNG, MP4, GIF up to 50MB
                          </p>
                          <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Choose Files
                          </Button>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                        />

                        {/* Uploaded Media Grid */}
                        {uploadedMedia.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                              Uploaded Media ({uploadedMedia.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {uploadedMedia.map((media) => (
                                <div key={media.id} className="relative group">
                                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                    {media.type.startsWith('image') ? (
                                      <img
                                        src={media.url}
                                        alt={media.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <video
                                        src={media.url}
                                        className="w-full h-full object-cover"
                                        controls
                                      />
                                    )}
                                    
                                    {/* Upload Progress */}
                                    {media.uploadProgress < 100 && (
                                      <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'bg-slate-800/80' : 'bg-black/50'}`}>
                                        <div className="text-center">
                                          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                                          <p className="text-white text-sm">{media.uploadProgress}%</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Media Info */}
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {media.name}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      {(media.size / 1024 / 1024).toFixed(1)} MB
                                    </p>
                                    
                                    {/* Add to Carousel Button */}
                                    {selectedPostType === 'carousel' && media.type.startsWith('image') && (
                                      <Button 
                                        size="sm" 
                                        className="w-full mt-2"
                                        onClick={() => addCarouselSlide(media)}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add to Carousel
                                      </Button>
                                    )}
                                  </div>

                                  {/* AI Analysis */}
                                  {media.aiAnalysis && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-green-800 dark:text-green-200">
                                          AI Analysis Complete
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                          {media.aiAnalysis.brandConsistency}% Brand Match
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-green-700 dark:text-green-300">
                                        Predicted: {media.aiAnalysis.performancePrediction.estimatedEngagement} engagement
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                        {/* Enhanced Image Editing Tools */}
                        {uploadedMedia.some(media => media.type.startsWith('image')) && (
                          <Card className={`mt-6 ${isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}`}>
                            <CardHeader>
                              <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                                <Crop className="h-5 w-5 mr-2 text-green-600" />
                                Advanced Image Editor
                              </CardTitle>
                              <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                                Professional editing tools for your images
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                {/* Primary Editing Tools */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <Button variant="outline" className="flex items-center">
                                    <Crop className="h-4 w-4 mr-2" />
                                    Crop & Resize
                                  </Button>
                                  <Button variant="outline" className="flex items-center">
                                    <Palette className="h-4 w-4 mr-2" />
                                    Filters & Effects
                                  </Button>
                                  <Button variant="outline" className="flex items-center">
                                    <Type className="h-4 w-4 mr-2" />
                                    Add Text Overlay
                                  </Button>
                                  <Button variant="outline" className="flex items-center">
                                    <Download className="h-4 w-4 mr-2" />
                                    Brand Elements
                                  </Button>
                                </div>

                                {/* Aspect Ratio Presets */}
                                <div>
                                  <Label className="text-sm font-medium">Platform Aspect Ratios</Label>
                                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                                    {[
                                      { label: 'Square', ratio: '1:1', platforms: 'IG Feed' },
                                      { label: 'Portrait', ratio: '4:5', platforms: 'IG Story' },
                                      { label: 'Landscape', ratio: '16:9', platforms: 'LinkedIn' },
                                      { label: 'Story', ratio: '9:16', platforms: 'Stories' },
                                      { label: 'Cover', ratio: '16:9', platforms: 'Facebook' },
                                      { label: 'Pin', ratio: '2:3', platforms: 'Pinterest' }
                                    ].map((preset) => (
                                      <button
                                        key={preset.label}
                                        className="p-2 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
                                      >
                                        <div className="font-medium">{preset.label}</div>
                                        <div className="text-slate-500">{preset.ratio}</div>
                                        <div className="text-slate-400 text-xs">{preset.platforms}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Advanced Filters */}
                                <div>
                                  <Label className="text-sm font-medium">Professional Filters</Label>
                                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                                    {[
                                      { name: 'Original', preview: 'bg-slate-100' },
                                      { name: 'Bright', preview: 'bg-yellow-100' },
                                      { name: 'Vintage', preview: 'bg-amber-100' },
                                      { name: 'B&W', preview: 'bg-gray-100' },
                                      { name: 'Warm', preview: 'bg-orange-100' },
                                      { name: 'Cool', preview: 'bg-blue-100' },
                                      { name: 'Vibrant', preview: 'bg-pink-100' },
                                      { name: 'Soft', preview: 'bg-purple-100' },
                                      { name: 'High Contrast', preview: 'bg-slate-200' },
                                      { name: 'Matte', preview: 'bg-stone-100' },
                                      { name: 'Film', preview: 'bg-green-100' },
                                      { name: 'Dramatic', preview: 'bg-red-100' }
                                    ].map((filter) => (
                                      <button
                                        key={filter.name}
                                        className={`p-3 text-xs border rounded hover:border-blue-300 transition-colors text-center ${filter.preview}`}
                                      >
                                        <div className="w-full h-8 rounded mb-1 bg-gradient-to-br from-slate-300 to-slate-400"></div>
                                        <div className="font-medium">{filter.name}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Text Overlay Tools */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                  <Label className="text-sm font-medium">Text Overlay Settings</Label>
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <Label className="text-xs">Font Style</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>Bold Sans-Serif</option>
                                        <option>Modern Script</option>
                                        <option>Clean Minimal</option>
                                        <option>Handwritten</option>
                                        <option>Corporate</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Position</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>Center</option>
                                        <option>Top Left</option>
                                        <option>Top Right</option>
                                        <option>Bottom Left</option>
                                        <option>Bottom Right</option>
                                        <option>Custom</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <Input 
                                      placeholder="Enter your text overlay..."
                                      className="text-sm"
                                    />
                                  </div>
                                </div>

                                {/* Brand Elements */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                                  <Label className="text-sm font-medium">Brand Elements</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Add Logo
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Brand Colors
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Watermark
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Frame/Border
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Enhanced Video Editing Tools */}
                        {uploadedMedia.some(media => media.type.startsWith('video')) && (
                          <Card className={`mt-6 ${isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}`}>
                            <CardHeader>
                              <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                                <Video className="h-5 w-5 mr-2 text-purple-600" />
                                Advanced Video Editor
                              </CardTitle>
                              <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                                Professional video editing tools for social media
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                {/* Primary Video Tools */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <Button variant="outline" className="flex items-center">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Trim & Cut
                                  </Button>
                                  <Button variant="outline" className="flex items-center">
                                    <Image className="h-4 w-4 mr-2" />
                                    Custom Thumbnail
                                  </Button>
                                  <Button variant="outline" className="flex items-center">
                                    <Type className="h-4 w-4 mr-2" />
                                    Add Captions
                                  </Button>
                                  <Button variant="outline" className="flex items-center">
                                    <Palette className="h-4 w-4 mr-2" />
                                    Video Filters
                                  </Button>
                                </div>

                                {/* Video Timeline Editor */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                  <Label className="text-sm font-medium">Video Timeline Editor</Label>
                                  <div className="mt-3 space-y-4">
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium">Start:</span>
                                        <Input
                                          type="number"
                                          value={videoSettings.trimStart}
                                          onChange={(e) => setVideoSettings(prev => ({
                                            ...prev,
                                            trimStart: parseInt(e.target.value)
                                          }))}
                                          className="w-20 h-8 text-xs"
                                          min="0"
                                        />
                                        <span className="text-xs">s</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium">End:</span>
                                        <Input
                                          type="number"
                                          value={videoSettings.trimEnd}
                                          onChange={(e) => setVideoSettings(prev => ({
                                            ...prev,
                                            trimEnd: parseInt(e.target.value)
                                          }))}
                                          className="w-20 h-8 text-xs"
                                          min="1"
                                        />
                                        <span className="text-xs">s</span>
                                      </div>
                                      <div className="text-xs text-slate-600">
                                        Duration: {videoSettings.trimEnd - videoSettings.trimStart}s
                                      </div>
                                    </div>
                                    
                                    {/* Visual Timeline */}
                                    <div className="relative">
                                      <div className="w-full h-12 bg-slate-200 rounded-lg relative overflow-hidden">
                                        {/* Timeline markers */}
                                        <div className="absolute inset-0 flex">
                                          {Array.from({ length: Math.ceil(videoSettings.duration / 5) }).map((_, i) => (
                                            <div key={i} className="flex-1 border-r border-slate-300 relative">
                                              <span className="absolute top-1 left-1 text-xs text-slate-500">
                                                {i * 5}s
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* Selected range */}
                                        <div 
                                          className="absolute top-0 h-full bg-purple-500 opacity-70 rounded"
                                          style={{ 
                                            left: `${(videoSettings.trimStart / videoSettings.duration) * 100}%`,
                                            width: `${((videoSettings.trimEnd - videoSettings.trimStart) / videoSettings.duration) * 100}%`
                                          }}
                                        />
                                        
                                        {/* Trim handles */}
                                        <div 
                                          className="absolute top-0 w-2 h-full bg-purple-600 cursor-ew-resize rounded-l"
                                          style={{ left: `${(videoSettings.trimStart / videoSettings.duration) * 100}%` }}
                                        />
                                        <div 
                                          className="absolute top-0 w-2 h-full bg-purple-600 cursor-ew-resize rounded-r"
                                          style={{ left: `${(videoSettings.trimEnd / videoSettings.duration) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Video Format Options */}
                                <div>
                                  <Label className="text-sm font-medium">Video Format & Quality</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    {[
                                      { label: 'Square', ratio: '1:1', desc: 'Instagram Feed' },
                                      { label: 'Portrait', ratio: '9:16', desc: 'Stories/Reels' },
                                      { label: 'Landscape', ratio: '16:9', desc: 'YouTube/LinkedIn' },
                                      { label: 'Original', ratio: 'Auto', desc: 'Keep Original' }
                                    ].map((format) => (
                                      <button
                                        key={format.label}
                                        className="p-3 text-xs border rounded hover:bg-purple-50 hover:border-purple-300 transition-colors text-center"
                                      >
                                        <div className="font-medium">{format.label}</div>
                                        <div className="text-slate-500">{format.ratio}</div>
                                        <div className="text-slate-400 text-xs">{format.desc}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Caption & Text Overlay */}
                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <Label className="text-sm font-medium">Auto-Generated Captions</Label>
                                  <div className="mt-3 space-y-3">
                                    <div className="flex items-center space-x-3">
                                      <input type="checkbox" className="rounded" />
                                      <span className="text-sm">Generate automatic captions</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs">Caption Style</Label>
                                        <select className="w-full mt-1 p-2 border rounded text-sm">
                                          <option>Modern Bold</option>
                                          <option>Clean Minimal</option>
                                          <option>Highlighted Box</option>
                                          <option>Outlined Text</option>
                                        </select>
                                      </div>
                                      <div>
                                        <Label className="text-xs">Position</Label>
                                        <select className="w-full mt-1 p-2 border rounded text-sm">
                                          <option>Bottom Center</option>
                                          <option>Top Center</option>
                                          <option>Center</option>
                                          <option>Custom</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Video Effects */}
                                <div>
                                  <Label className="text-sm font-medium">Video Effects & Filters</Label>
                                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                                    {[
                                      'Original', 'Bright', 'Cinematic', 'Vintage', 
                                      'High Contrast', 'Soft', 'Dramatic', 'Warm',
                                      'Cool', 'B&W', 'Sepia', 'Vibrant'
                                    ].map((effect) => (
                                      <button
                                        key={effect}
                                        className="p-2 text-xs border rounded hover:bg-purple-50 hover:border-purple-300 transition-colors text-center"
                                      >
                                        <div className="w-full h-6 rounded mb-1 bg-gradient-to-r from-purple-200 to-purple-300"></div>
                                        <div className="font-medium">{effect}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Export Settings */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                  <Label className="text-sm font-medium">Export Settings</Label>
                                  <div className="grid grid-cols-3 gap-3 mt-3">
                                    <div>
                                      <Label className="text-xs">Quality</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>High (1080p)</option>
                                        <option>Medium (720p)</option>
                                        <option>Optimized</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Format</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>MP4</option>
                                        <option>MOV</option>
                                        <option>WebM</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Compression</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>Balanced</option>
                                        <option>High Quality</option>
                                        <option>Small File</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Enhanced Carousel Builder */}
                        {selectedPostType === 'carousel' && carouselSlides.length > 0 && (
                          <Card className={`mt-6 ${isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}`}>
                            <CardHeader>
                              <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                                <Grid className="h-5 w-5 mr-2 text-blue-600" />
                                Advanced Carousel Builder
                              </CardTitle>
                              <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                                Professional carousel editing with slide management and transitions
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                {/* Carousel Overview */}
                                <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {carouselSlides.length}
                                    </div>
                                    <div>
                                      <div className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Total Slides</div>
                                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Optimal: 3-10 slides</div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add Slide
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Auto-Arrange
                                    </Button>
                                  </div>
                                </div>

                                {/* Slide Management Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {carouselSlides.map((slide, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-300 transition-colors">
                                        <img 
                                          src={slide.url} 
                                          alt={`Slide ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      
                                      {/* Slide Number */}
                                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                        {index + 1}
                                      </div>
                                      
                                      {/* Slide Actions */}
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                        <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                                          <Edit3 className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="destructive" 
                                          className="h-6 w-6 p-0"
                                          onClick={() => removeCarouselSlide(index)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      
                                      {/* Reorder Handles */}
                                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex justify-center space-x-1">
                                          {index > 0 && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-6 px-2 text-xs"
                                              onClick={() => reorderCarouselSlides(index, index - 1)}
                                            >
                                              ←
                                            </Button>
                                          )}
                                          {index < carouselSlides.length - 1 && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-6 px-2 text-xs"
                                              onClick={() => reorderCarouselSlides(index, index + 1)}
                                            >
                                              →
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Add New Slide */}
                                  <div className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors flex items-center justify-center cursor-pointer">
                                    <div className="text-center">
                                      <Plus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Add Slide</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Carousel Settings */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                  <Label className="text-sm font-medium">Carousel Settings</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                                    <div>
                                      <Label className="text-xs">Aspect Ratio</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>Square (1:1)</option>
                                        <option>Portrait (4:5)</option>
                                        <option>Landscape (16:9)</option>
                                        <option>Custom</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Transition Style</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>Slide</option>
                                        <option>Fade</option>
                                        <option>Zoom</option>
                                        <option>None</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Auto-Play</Label>
                                      <select className="w-full mt-1 p-2 border rounded text-sm">
                                        <option>Off</option>
                                        <option>3 seconds</option>
                                        <option>5 seconds</option>
                                        <option>10 seconds</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {/* Slide-Specific Editing */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                                  <Label className="text-sm font-medium">Individual Slide Editing</Label>
                                  <div className="mt-3 space-y-3">
                                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                      Select a slide above to edit its specific properties:
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <Crop className="h-3 w-3 mr-1" />
                                        Crop
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <Palette className="h-3 w-3 mr-1" />
                                        Filter
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <Type className="h-3 w-3 mr-1" />
                                        Text
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <Download className="h-3 w-3 mr-1" />
                                        Replace
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Carousel Performance Insights */}
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <Label className="text-sm font-medium">Performance Insights</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-green-600">+40%</div>
                                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Engagement vs Single Image</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-blue-600">85%</div>
                                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Completion Rate</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-purple-600">12K</div>
                                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Est. Reach</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-orange-600">7.8%</div>
                                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Est. Engagement</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* AI Analysis of Uploaded Media */}
                        {uploadedMedia.some(media => media.aiAnalysis) && (
                          <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                        <CardHeader>
                          <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                            <Target className="h-5 w-5 mr-2 text-blue-600" />
                            AI Analysis & Suggestions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {uploadedMedia.filter(media => media.aiAnalysis).map((media) => (
                            <div key={media.id} className="mb-6 last:mb-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                    {media.name}
                                  </h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Brand Consistency: {media.aiAnalysis.brandConsistency}%
                                  </p>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                    Suggested Caption
                                  </h5>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                      {media.aiAnalysis.suggestedCaption}
                                    </p>
                                    <Button size="sm" className="mt-2" onClick={() => {
                                      setEditedPost(prev => ({
                                        ...prev,
                                        content: { ...prev.content, caption: media.aiAnalysis.suggestedCaption }
                                      }))
                                    }}>
                                      Use This Caption
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                    Performance Prediction
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Estimated Reach:</span>
                                      <span className="font-medium">{media.aiAnalysis.performancePrediction.estimatedReach}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Estimated Engagement:</span>
                                      <span className="font-medium">{media.aiAnalysis.performancePrediction.estimatedEngagement}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>AI Confidence:</span>
                                      <span className="font-medium">{media.aiAnalysis.performancePrediction.confidence}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                  Optimization Suggestions
                                </h5>
                                <ul className="space-y-1">
                                  {media.aiAnalysis.optimizationSuggestions.map((suggestion, index) => (
                                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="hybrid-mode" className="space-y-6 mt-0 p-0">
                    {/* Hybrid AI + User Content */}
                    <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                      <CardHeader>
                        <CardTitle className={`flex items-center ${isDarkMode ? 'text-slate-100' : ''}`}>
                          <Zap className="h-5 w-5 mr-2 text-orange-600" />
                          Hybrid Mode: AI + Your Content
                        </CardTitle>
                        <CardDescription className={isDarkMode ? 'text-slate-400' : ''}>
                          Combine AI intelligence with your uploaded media for optimal results
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <Zap className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Hybrid Mode
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                            Upload your media first, then AI will adapt the content to match your visuals
                          </p>
                          <Button onClick={() => setActiveTab('upload-media')} className="px-6 py-2">
                            <Upload className="h-4 w-4 mr-2" />
                            Start by Uploading Media
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="w-96 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Live Preview</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    See how your post will look on {post?.platform}
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Platform Preview */}
                    <div className="flex justify-center">
                      <PlatformPreview 
                        post={{
                          ...editedPost,
                          type: selectedPostType,
                          content: {
                            caption: editedPost?.content?.caption,
                            hashtags: editedPost?.content?.hashtags
                          },
                          media: selectedPostType === 'carousel' ? carouselSlides : uploadedMedia,
                          image: uploadedMedia[0]?.url,
                          thumbnail: (selectedPostType === 'video' || selectedPostType === 'reel') ? 
                            uploadedMedia[0]?.url : undefined,
                          estimatedLikes: Math.floor(Math.random() * 1000) + 100,
                          estimatedComments: Math.floor(Math.random() * 50) + 5,
                          estimatedShares: Math.floor(Math.random() * 20) + 2,
                          estimatedRetweets: Math.floor(Math.random() * 30) + 5,
                          estimatedViews: Math.floor(Math.random() * 5000) + 500
                        }}
                        platform={post?.platform}
                        size="small"
                      />
                    </div>

                    {/* Performance Prediction */}
                    <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                      <CardHeader className="pb-3">
                        <CardTitle className={`text-sm ${isDarkMode ? 'text-slate-100' : ''}`}>Performance Prediction</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-300' : ''}`}>
                          <span>Estimated Reach:</span>
                          <span className="font-medium">{post?.performance?.estimatedReach || '8.5K-12K'}</span>
                        </div>
                        <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-300' : ''}`}>
                          <span>Engagement Rate:</span>
                          <span className="font-medium">{post?.performance?.estimatedEngagement || '7.8%'}</span>
                        </div>
                        <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-300' : ''}`}>
                          <span>AI Confidence:</span>
                          <span className="font-medium">{post?.aiInsights?.confidence || 89}%</span>
                        </div>
                        <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-300' : ''}`}>
                          <span>Post Type:</span>
                          <span className="font-medium capitalize">{selectedPostType.replace('_', ' ')}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Format-specific Info */}
                    {selectedPostType === 'carousel' && carouselSlides.length > 0 && (
                      <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                        <CardHeader className="pb-3">
                          <CardTitle className={`text-sm ${isDarkMode ? 'text-slate-100' : ''}`}>Carousel Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : ''}`}>
                            <div className="flex justify-between">
                              <span>Slides:</span>
                              <span className="font-medium">{carouselSlides.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Format:</span>
                              <span className="font-medium">Square (1:1)</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {(selectedPostType === 'video' || selectedPostType === 'reel') && (
                      <Card className={isDarkMode ? 'bg-slate-800/95 border-slate-600' : ''}>
                        <CardHeader className="pb-3">
                          <CardTitle className={`text-sm ${isDarkMode ? 'text-slate-100' : ''}`}>Video Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : ''}`}>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="font-medium">{videoSettings.duration}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="font-medium capitalize">{selectedPostType}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate with AI
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={handleSaveChanges} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSaving}
              >
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PostEditor

