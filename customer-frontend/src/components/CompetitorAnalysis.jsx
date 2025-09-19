import React, { useState, useEffect } from 'react';
import { useAnalyzeCompetitors } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Target, TrendingUp, TrendingDown, Users, MessageCircle, Share2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const CompetitorAnalysis = () => {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Competitor Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gain insights into your competitors' social media performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder="Enter competitor name or URL"
            className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            value={competitorNameInput}
            onChange={(e) => setCompetitorNameInput(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={isLoading || !competitorNameInput.trim()}>
            {isLoading ? 'Analyzing...' : 'Analyze Competitor'}
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading || !activeCompetitorName} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && activeCompetitorName && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-slate-600 dark:text-slate-400">Analyzing competitor data for {activeCompetitorName}...</p>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Competitor:</strong> {data.competitorName}</p>
              <p><strong>Total Followers:</strong> {data.totalFollowers}</p>
              <p><strong>Average Engagement Rate:</strong> {data.averageEngagementRate}%</p>
              <p><strong>Posts Last 30 Days:</strong> {data.postsLast30Days}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Likes per Post:</strong> {data.likesPerPost}</p>
              <p><strong>Comments per Post:</strong> {data.commentsPerPost}</p>
              <p><strong>Shares per Post:</strong> {data.sharesPerPost}</p>
              <p><strong>Reach per Post:</strong> {data.reachPerPost}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Audience Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Audience Growth (30d):</strong> {data.audienceGrowth}%</p>
              <p><strong>Top Demographics:</strong> {data.topDemographics?.join(', ')}</p>
              <p><strong>Geographic Focus:</strong> {data.geographicFocus}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-orange-600" />
                Content Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Top Performing Content Types:</strong> {data.topContentTypes?.join(', ')}</p>
              <p><strong>Keywords Used:</strong> {data.keywordsUsed?.join(', ')}</p>
              <p><strong>Posting Frequency:</strong> {data.postingFrequency}</p>
            </CardContent>
          </Card>

          {data.sentimentAnalysis && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-red-600" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Positive Sentiment:</strong> {data.sentimentAnalysis.positive}%</p>
                <Progress value={data.sentimentAnalysis.positive} className="h-2" />
                <p><strong>Negative Sentiment:</strong> {data.sentimentAnalysis.negative}%</p>
                <Progress value={data.sentimentAnalysis.negative} className="h-2" />
                <p><strong>Neutral Sentiment:</strong> {data.sentimentAnalysis.neutral}%</p>
                <Progress value={data.sentimentAnalysis.neutral} className="h-2" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!activeCompetitorName && !isLoading && !isError && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Enter a competitor name or URL above to start the analysis.
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;

