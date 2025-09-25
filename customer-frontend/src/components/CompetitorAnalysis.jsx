import React, { useState, useEffect } from 'react';
import { useAnalyzeCompetitors } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Target, TrendingUp, TrendingDown, Users, MessageCircle, Share2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useTheme } from '../contexts/ThemeContext.jsx';

const CompetitorAnalysis = () => {
  const { isDarkMode } = useTheme();
  const [competitorNameInput, setCompetitorNameInput] = useState('');
  const [activeCompetitorName, setActiveCompetitorName] = useState('');

  const { data, isLoading, isError, error, refetch } = useAnalyzeCompetitors(activeCompetitorName);

  const handleAnalyze = () => {
    if (competitorNameInput.trim()) {
      setActiveCompetitorName(competitorNameInput);
    }
  };

  const handleRefresh = () => {
    if (activeCompetitorName) {
      refetch();
    }
  };

  useEffect(() => {
    // Optionally, clear results if input is cleared
    if (!competitorNameInput.trim()) {
      setActiveCompetitorName('');
    }
  }, [competitorNameInput]);

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400">
        Error: {error?.message || 'Failed to fetch competitor analysis data.'}
        <Button onClick={handleRefresh} className="ml-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen' 
        : ''
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Competitor Analysis
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Gain insights into your competitors' social media performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder="Enter competitor name or URL"
            className={`px-4 py-2 border rounded-md ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-gray-300'
            }`}
            value={competitorNameInput}
            onChange={(e) => setCompetitorNameInput(e.target.value)}
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading || !competitorNameInput.trim()}
            className={`${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
            }`}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Competitor'}
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading || !activeCompetitorName} 
            variant="outline" 
            size="sm"
            className={`${
              isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && activeCompetitorName && (
        <div className="text-center py-8">
          <RefreshCw className={`h-8 w-8 animate-spin mx-auto ${
            isDarkMode ? 'text-blue-400' : 'text-blue-500'
          }`} />
          <p className={`mt-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Analyzing competitor data for {activeCompetitorName}...
          </p>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Target className={`h-5 w-5 mr-2 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Competitor:</strong> {data.competitorName}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Total Followers:</strong> {data.totalFollowers}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Average Engagement Rate:</strong> {data.averageEngagementRate}%
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Posts Last 30 Days:</strong> {data.postsLast30Days}
              </p>
            </CardContent>
          </Card>

          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <TrendingUp className={`h-5 w-5 mr-2 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Likes per Post:</strong> {data.likesPerPost}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Comments per Post:</strong> {data.commentsPerPost}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Shares per Post:</strong> {data.sharesPerPost}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Reach per Post:</strong> {data.reachPerPost}
              </p>
            </CardContent>
          </Card>

          <Card className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Users className={`h-5 w-5 mr-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                Audience Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Audience Growth (30d):</strong> {data.audienceGrowth}%
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Top Demographics:</strong> {data.topDemographics?.join(', ')}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Geographic Focus:</strong> {data.geographicFocus}
              </p>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-3 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
              : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <MessageCircle className={`h-5 w-5 mr-2 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`} />
                Content Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Top Performing Content Types:</strong> {data.topContentTypes?.join(', ')}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Keywords Used:</strong> {data.keywordsUsed?.join(', ')}
              </p>
              <p className={`${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Posting Frequency:</strong> {data.postingFrequency}
              </p>
            </CardContent>
          </Card>

          {data.sentimentAnalysis && (
            <Card className={`lg:col-span-3 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow' 
                : 'bg-white'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <Share2 className={`h-5 w-5 mr-2 ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`} />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className={`${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Positive Sentiment:</strong> {data.sentimentAnalysis.positive}%
                </p>
                <Progress value={data.sentimentAnalysis.positive} className="h-2" />
                <p className={`${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Negative Sentiment:</strong> {data.sentimentAnalysis.negative}%
                </p>
                <Progress value={data.sentimentAnalysis.negative} className="h-2" />
                <p className={`${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Neutral Sentiment:</strong> {data.sentimentAnalysis.neutral}%
                </p>
                <Progress value={data.sentimentAnalysis.neutral} className="h-2" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!activeCompetitorName && !isLoading && !isError && (
        <div className={`text-center py-8 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Enter a competitor name or URL above to start the analysis.
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;

