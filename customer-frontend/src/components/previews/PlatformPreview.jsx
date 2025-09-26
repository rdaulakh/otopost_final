import InstagramPreview from './InstagramPreview'
import LinkedInPreview from './LinkedInPreview'
import TwitterPreview from './TwitterPreview'
import FacebookPreview from './FacebookPreview'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const PlatformPreview = ({ post, platform, className = "", size = "default" }) => {
  const { isDarkMode } = useTheme()
  const platformType = platform || post?.platform || 'instagram'
  
  // Size variants
  const sizeClasses = {
    small: "scale-75 origin-top-left",
    default: "",
    large: "scale-110"
  }

  const renderPreview = () => {
    const previewProps = {
      post,
      className: `${sizeClasses[size]} ${className}`
    }

    switch (platformType.toLowerCase()) {
      case 'instagram':
        return <InstagramPreview {...previewProps} />
      case 'linkedin':
        return <LinkedInPreview {...previewProps} />
      case 'twitter':
        return <TwitterPreview {...previewProps} />
      case 'facebook':
        return <FacebookPreview {...previewProps} />
      default:
        return <InstagramPreview {...previewProps} />
    }
  }

  return (
    <div className="platform-preview-container">
      {renderPreview()}
    </div>
  )
}

export default PlatformPreview

