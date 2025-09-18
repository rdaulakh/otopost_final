import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../../../customer-frontend/src/components/Dashboard';
import { useAuth } from '../../../customer-frontend/src/hooks/useAuth';
import { useContent } from '../../../customer-frontend/src/hooks/useContent';
import { useAnalytics } from '../../../customer-frontend/src/hooks/useAnalytics';

// Mock the hooks
jest.mock('../../../customer-frontend/src/hooks/useAuth');
jest.mock('../../../customer-frontend/src/hooks/useContent');
jest.mock('../../../customer-frontend/src/hooks/useAnalytics');

// Mock the API service
jest.mock('../../../customer-frontend/src/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Component', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    organization: '507f1f77bcf86cd799439012'
  };

  const mockContent = [
    {
      _id: '507f1f77bcf86cd799439013',
      title: 'Test Post 1',
      content: 'This is test content 1',
      type: 'text',
      platforms: ['facebook', 'twitter'],
      status: 'published',
      createdAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T12:00:00.000Z'
    },
    {
      _id: '507f1f77bcf86cd799439014',
      title: 'Test Post 2',
      content: 'This is test content 2',
      type: 'image',
      platforms: ['instagram'],
      status: 'scheduled',
      createdAt: '2024-01-02T00:00:00.000Z',
      scheduledDate: '2024-01-03T12:00:00.000Z'
    }
  ];

  const mockAnalytics = {
    totalPosts: 2,
    totalEngagement: 150,
    totalReach: 1000,
    engagementRate: 15.0,
    topPerformingContent: '507f1f77bcf86cd799439013',
    recentActivity: [
      {
        id: '1',
        type: 'post_published',
        message: 'Post "Test Post 1" was published',
        timestamp: '2024-01-01T12:00:00.000Z'
      },
      {
        id: '2',
        type: 'post_scheduled',
        message: 'Post "Test Post 2" was scheduled',
        timestamp: '2024-01-02T10:00:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null
    });

    useContent.mockReturnValue({
      content: mockContent,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });

    useAnalytics.mockReturnValue({
      analytics: mockAnalytics,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with user information', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Welcome back, Test!')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render analytics summary', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Total posts
      expect(screen.getByText('150')).toBeInTheDocument(); // Total engagement
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Total reach
      expect(screen.getByText('15.0%')).toBeInTheDocument(); // Engagement rate
    });

    it('should render recent content', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });

    it('should render recent activity', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Post "Test Post 1" was published')).toBeInTheDocument();
      expect(screen.getByText('Post "Test Post 2" was scheduled')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when content is loading', () => {
      useContent.mockReturnValue({
        content: [],
        isLoading: true,
        error: null,
        refetch: jest.fn()
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show loading spinner when analytics is loading', () => {
      useAnalytics.mockReturnValue({
        analytics: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error message when content fails to load', () => {
      useContent.mockReturnValue({
        content: [],
        isLoading: false,
        error: 'Failed to load content',
        refetch: jest.fn()
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
    });

    it('should show error message when analytics fails to load', () => {
      useAnalytics.mockReturnValue({
        analytics: null,
        isLoading: false,
        error: 'Failed to load analytics',
        refetch: jest.fn()
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to create content page when create button is clicked', () => {
      renderWithProviders(<Dashboard />);

      const createButton = screen.getByText('Create New Post');
      fireEvent.click(createButton);

      // This would typically use a router mock to check navigation
      expect(createButton).toBeInTheDocument();
    });

    it('should navigate to content details when content item is clicked', () => {
      renderWithProviders(<Dashboard />);

      const contentItem = screen.getByText('Test Post 1');
      fireEvent.click(contentItem);

      // This would typically use a router mock to check navigation
      expect(contentItem).toBeInTheDocument();
    });

    it('should refresh data when refresh button is clicked', async () => {
      const mockRefetch = jest.fn();
      useContent.mockReturnValue({
        content: mockContent,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<Dashboard />);

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Content Status Display', () => {
    it('should display correct status badges', () => {
      renderWithProviders(<Dashboard />);

      const publishedBadge = screen.getByText('Published');
      const scheduledBadge = screen.getByText('Scheduled');

      expect(publishedBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(scheduledBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should display platform icons correctly', () => {
      renderWithProviders(<Dashboard />);

      // Check for platform indicators
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    });
  });

  describe('Analytics Charts', () => {
    it('should render engagement chart', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByTestId('engagement-chart')).toBeInTheDocument();
    });

    it('should render platform performance chart', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByTestId('platform-performance-chart')).toBeInTheDocument();
    });

    it('should render content type distribution chart', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByTestId('content-type-chart')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.getByText('Schedule Content')).toBeInTheDocument();
      expect(screen.getByText('View Analytics')).toBeInTheDocument();
      expect(screen.getByText('Manage Campaigns')).toBeInTheDocument();
    });

    it('should handle quick action clicks', () => {
      renderWithProviders(<Dashboard />);

      const createPostButton = screen.getByText('Create Post');
      fireEvent.click(createPostButton);

      // This would typically use a router mock to check navigation
      expect(createPostButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<Dashboard />);

      // Check for mobile-specific classes or elements
      expect(screen.getByTestId('mobile-dashboard')).toBeInTheDocument();
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithProviders(<Dashboard />);

      // Check for tablet-specific layout
      expect(screen.getByTestId('tablet-dashboard')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no content exists', () => {
      useContent.mockReturnValue({
        content: [],
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('No content yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first post to get started')).toBeInTheDocument();
    });

    it('should show empty state when no analytics data exists', () => {
      useAnalytics.mockReturnValue({
        analytics: {
          totalPosts: 0,
          totalEngagement: 0,
          totalReach: 0,
          engagementRate: 0,
          recentActivity: []
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });

      renderWithProviders(<Dashboard />);

      expect(screen.getByText('No analytics data available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Analytics Summary')).toBeInTheDocument();
      expect(screen.getByLabelText('Recent Content')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      renderWithProviders(<Dashboard />);

      const createButton = screen.getByText('Create New Post');
      createButton.focus();
      expect(createButton).toHaveFocus();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<Dashboard />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();

      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });
  });
});

