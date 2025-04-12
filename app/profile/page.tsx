//app/profile/page.tsx for sourcelens

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import Recharts components for data visualization
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Types from your library context
import { useLibrary, SavedDraft, SavedSource, SavedAnalysis, SavedReference } from '@/lib/libraryContext';
import { useAppStore } from '@/lib/store';

// Calendar heatmap component
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

export default function ProfileActivityPage() {
  const { user, isLoading } = useAuth();
  const { 
    drafts, 
    sources, 
    analyses, 
    references, 
    isLoading: libraryLoading 
  } = useLibrary();
  const { isDarkMode } = useAppStore();
  const router = useRouter();
  
  // Activity state
  const [activityData, setActivityData] = useState<{
    date: string;
    count: number;
    items: Array<{type: string; title: string; date: number}>;
  }[]>([]);
  
  const [recentItems, setRecentItems] = useState<Array<{
    id: string;
    title: string;
    type: 'draft' | 'source' | 'analysis' | 'reference';
    date: number;
    icon?: string;
  }>>([]);
  
  const [stats, setStats] = useState({
    totalSources: 0,
    totalDrafts: 0,
    totalAnalyses: 0,
    totalCitations: 0,
    typeDistribution: [] as {name: string; value: number}[],
    activityByMonth: [] as {name: string; count: number}[],
    recentActivity: [] as {date: string; count: number}[]
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('year');
  
  // Set document title
  useEffect(() => {
    document.title = 'Your Activity | SourceLens';
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isLoading, router]);

  // Process library data to create visualizations
  useEffect(() => {
    if (libraryLoading || !drafts || !sources || !analyses || !references) return;
    
    // Calculate total counts
    const totalSources = sources.length;
    const totalDrafts = drafts.length;
    const totalAnalyses = analyses.length;
    const totalCitations = references.length;
    
    // Create type distribution data for pie chart
    const typeDistribution = [
      { name: 'Sources', value: totalSources },
      { name: 'Drafts', value: totalDrafts },
      { name: 'Analyses', value: totalAnalyses },
      { name: 'Citations', value: totalCitations }
    ].filter(item => item.value > 0);
    
    // Create activity calendar data
    const allItems = [
      ...sources.map(s => ({ type: 'source', date: s.dateAdded, title: s.metadata.title || 'Untitled Source' })),
      ...drafts.map(d => ({ type: 'draft', date: d.lastEdited || d.dateAdded, title: d.title })),
      ...analyses.map(a => ({ type: 'analysis', date: a.dateAdded, title: a.title })),
      ...references.map(r => ({ type: 'citation', date: r.dateAdded, title: r.citation.substring(0, 30) + '...' }))
    ];
    
    // Sort by date (most recent first)
    allItems.sort((a, b) => b.date - a.date);
    
    // Create calendar heatmap data
    const activityMap = new Map();
    allItems.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { date, count: 0, items: [] });
      }
      const dateData = activityMap.get(date);
      dateData.count += 1;
      dateData.items.push(item);
    });
    
    const activityData = Array.from(activityMap.values());
    
    // Create monthly activity data
    const monthlyActivity = new Map();
    allItems.forEach(item => {
      const date = new Date(item.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyActivity.has(monthYear)) {
        monthlyActivity.set(monthYear, { 
          name: date.toLocaleString('default', { month: 'short', year: 'numeric' }), 
          count: 0 
        });
      }
      monthlyActivity.get(monthYear).count += 1;
    });
    
    const activityByMonth = Array.from(monthlyActivity.values())
      .sort((a, b) => {
        // Sort by date (oldest first for the chart)
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-12); // Last 12 months
    
    // Get recent items for display
    const recentItems = allItems.slice(0, 10).map(item => {
      const getIcon = (type: string) => {
        switch(type) {
          case 'source': return '📄';
          case 'draft': return '✏️';
          case 'analysis': return '🔍';
          case 'citation': return '📌';
          default: return '📄';
        }
      };
      
      return {
        id: Math.random().toString(36).substring(2, 9), // Temporary ID
        title: item.title,
        type: item.type as any,
        date: item.date,
        icon: getIcon(item.type)
      };
    });
    
    // Update state
    setStats({
      totalSources,
      totalDrafts,
      totalAnalyses,
      totalCitations,
      typeDistribution,
      activityByMonth,
      recentActivity: activityData.slice(-30) // Last 30 days
    });
    
    setActivityData(activityData);
    setRecentItems(recentItems);
    
  }, [libraryLoading, drafts, sources, analyses, references]);

  // Generate activity heatmap for the calendar
  const getActivityHeatmap = () => {
    const endDate = new Date();
    let startDate;
    
    if (timeRange === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (timeRange === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else { // 'week'
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    }
    
    // Filter activity data for selected time range
    const filteredData = activityData.filter(item => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    });
    
    // Format data for heatmap
    const values = filteredData.map(item => ({
      date: item.date,
      count: item.count
    }));
    
    return { startDate, endDate, values };
  };

  // LOADING STATE
  if (isLoading || libraryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // FALLBACK IF USER ISN'T FOUND
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          You need to be logged in to view this page. Please{' '}
          <Link href="/login" className='text-indigo-600 dark:text-indigo-400 hover:underline font-medium'>log in</Link>.
        </p>
      </div>
    );
  }

  // EMPTY STATE
  const isEmpty = 
    stats.totalSources === 0 && 
    stats.totalDrafts === 0 && 
    stats.totalAnalyses === 0 && 
    stats.totalCitations === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 mb-10">
            {/* Avatar */}
            <div className="relative">
              {user.user_metadata?.avatar_url ? (
                <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    fill
                    sizes="112px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white font-medium text-3xl shadow-md">
                  {(user.email || user.user_metadata?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* User info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                {user.email}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {/* Empty state message */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg 
                className="h-20 w-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                No activity yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your activity graph and visualizations will appear here once you start using SourceLens. 
                Begin by uploading sources, creating drafts, or generating analyses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  Upload a Source
                </Link>
                <Link
                  href="/library"
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  Go to Library
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare heatmap data
  const heatmapData = getActivityHeatmap();
  
  // Define chart colors based on dark mode
  const chartColors = {
    sourceColor: isDarkMode ? '#818cf8' : '#4f46e5', // indigo
    draftColor: isDarkMode ? '#34d399' : '#059669',  // emerald
    analysisColor: isDarkMode ? '#fb7185' : '#e11d48', // rose
    citationColor: isDarkMode ? '#fbbf24' : '#d97706', // amber
    textColor: isDarkMode ? '#94a3b8' : '#64748b', // slate
    gridColor: isDarkMode ? '#334155' : '#e2e8f0' // slate
  };

  // MAIN PROFILE PAGE WITH ACTIVITY VISUALIZATIONS
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            {/* Avatar */}
            <div className="relative">
              {user.user_metadata?.avatar_url ? (
                <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    fill
                    sizes="112px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white font-medium text-3xl shadow-md">
                  {(user.email || user.user_metadata?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              
              <button 
                className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                aria-label="Change profile picture"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            {/* User info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                {user.email}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link 
                href="/library?tab=sources" 
                className="bg-white dark:bg-slate-800 shadow-sm rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                >
                  {stats.totalSources}
                </motion.div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Sources</div>
              </Link>
              
              <Link 
                href="/library?tab=drafts" 
                className="bg-white dark:bg-slate-800 shadow-sm rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                >
                  {stats.totalDrafts}
                </motion.div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Drafts</div>
              </Link>
              
              <Link 
                href="/library?tab=analyses" 
                className="bg-white dark:bg-slate-800 shadow-sm rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-rose-600 dark:text-rose-400"
                >
                  {stats.totalAnalyses}
                </motion.div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Analyses</div>
              </Link>
              
              <Link 
                href="/library?tab=citations" 
                className="bg-white dark:bg-slate-800 shadow-sm rounded-lg px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-amber-600 dark:text-amber-400"
                >
                  {stats.totalCitations}
                </motion.div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Citations</div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Activity Tabs */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'recent'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                Recent Items
              </button>
            </nav>
          </div>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto">
            {/* Activity Calendar */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2 sm:mb-0">
                  Activity Calendar
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 py-1 text-xs rounded-md ${
                      timeRange === 'week' 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 py-1 text-xs rounded-md ${
                      timeRange === 'month' 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeRange('year')}
                    className={`px-3 py-1 text-xs rounded-md ${
                      timeRange === 'year' 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              {/* Calendar heatmap */}
              <div className={`${timeRange === 'week' ? 'px-20' : ''}`}>
                <CalendarHeatmap
                  startDate={heatmapData.startDate}
                  endDate={heatmapData.endDate}
                  values={heatmapData.values}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return 'color-empty';
                    }
                    
                    let intensity;
                    if (value.count >= 10) intensity = 4;
                    else if (value.count >= 7) intensity = 3;
                    else if (value.count >= 4) intensity = 2;
                    else intensity = 1;
                    
                    return `color-scale-${intensity}`;
                  }}
                  titleForValue={(value) => {
                    if (!value || value.count === 0) {
                      return 'No activity';
                    }
                    return `${value.count} activities on ${value.date}`;
                  }}
                  tooltipDataAttrs={(value: any) => {
                    if (!value || !value.date) {
                      return { 'data-tooltip': 'No activity' };
                    }
                    return {
                      'data-tooltip': `${value.count} activities on ${value.date}`,
                    };
                  }}
                />
              </div>
              
              {/* Legend */}
              <div className="flex justify-end items-center mt-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1 mr-2">
                  <div className="w-3 h-3 bg-slate-100 dark:bg-slate-700"></div>
                  <span>Less</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-900"></div>
                  <div className="w-3 h-3 bg-indigo-400 dark:bg-indigo-700"></div>
                  <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-500"></div>
                  <div className="w-3 h-3 bg-indigo-800 dark:bg-indigo-300"></div>
                  <span>More</span>
                </div>
              </div>
            </div>
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Activity by Type Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Content Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.typeDistribution.map((entry, index) => {
                        const COLORS = [
                          chartColors.sourceColor,
                          chartColors.draftColor,
                          chartColors.analysisColor,
                          chartColors.citationColor
                        ];
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} items`, null]}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#334155'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center mt-4 gap-x-4 gap-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 mr-2"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Sources</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 mr-2"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Drafts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-rose-600 dark:bg-rose-400 mr-2"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Analyses</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-600 dark:bg-amber-400 mr-2"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Citations</span>
                  </div>
                </div>
              </div>
              
              {/* Activity by Month */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Monthly Activity
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.activityByMonth}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartColors.gridColor}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: chartColors.textColor }}
                      axisLine={{ stroke: chartColors.gridColor }}
                      tickLine={{ stroke: chartColors.gridColor }}
                    />
                    <YAxis 
                      tick={{ fill: chartColors.textColor }}
                      axisLine={{ stroke: chartColors.gridColor }}
                      tickLine={{ stroke: chartColors.gridColor }}
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value} activities`, null]}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#334155'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Activities"
                      fill={chartColors.sourceColor}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Activity Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
                <button
                  onClick={() => setActiveTab('recent')}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  View all
                </button>
              </div>
              
              <div className="space-y-3">
                {recentItems.slice(0, 5).map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="mr-3 text-lg">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="ml-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.type === 'source'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                          : item.type === 'draft'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                            : item.type === 'analysis'
                              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="max-w-7xl mx-auto">
            {/* Content Type Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Activity by Content Type
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={stats.activityByMonth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartColors.gridColor}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: chartColors.textColor }}
                    />
                    <YAxis tick={{ fill: chartColors.textColor }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#334155'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stackId="1"
                      stroke={chartColors.sourceColor} 
                      fill={chartColors.sourceColor} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                <div className="flex flex-col justify-center">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Activity Breakdown
                    </h4>
                    <div className="space-y-4">
                      {/* Sources Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sources</span>
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{stats.totalSources}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (stats.totalSources / (stats.totalSources + stats.totalDrafts + stats.totalAnalyses + stats.totalCitations) * 100) || 0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Drafts Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Drafts</span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{stats.totalDrafts}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (stats.totalDrafts / (stats.totalSources + stats.totalDrafts + stats.totalAnalyses + stats.totalCitations) * 100) || 0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Analyses Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Analyses</span>
                          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{stats.totalAnalyses}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-rose-600 dark:bg-rose-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (stats.totalAnalyses / (stats.totalSources + stats.totalDrafts + stats.totalAnalyses + stats.totalCitations) * 100) || 0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Citations Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Citations</span>
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{stats.totalCitations}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-amber-600 dark:bg-amber-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (stats.totalCitations / (stats.totalSources + stats.totalDrafts + stats.totalAnalyses + stats.totalCitations) * 100) || 0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Content Creation Timeline */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Activity Timeline
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.activityByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartColors.gridColor}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: chartColors.textColor }}
                    />
                    <YAxis tick={{ fill: chartColors.textColor }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#334155'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke={chartColors.sourceColor} 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Activity Heat Map */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Activity Intensity
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.activityByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartColors.gridColor}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: chartColors.textColor }}
                    />
                    <YAxis tick={{ fill: chartColors.textColor }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        color: isDarkMode ? '#e2e8f0' : '#334155'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Activity Count"
                      fill={chartColors.sourceColor}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Items Tab */}
        {activeTab === 'recent' && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Recently Modified Items
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Your most recently created or modified content across all types
                </p>
              </div>
              
              {recentItems.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="mr-4 text-2xl">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Last modified {new Date(item.date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.type === 'source'
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                            : item.type === 'draft'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                              : item.type === 'analysis'
                                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <button className="ml-4 p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No recent items found. Start creating content to see your activity.
                </div>
              )}
            </div>
            
            {/* Recently Viewed Sources */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Recently Viewed Sources
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sources you've recently accessed for analysis
                </p>
              </div>
              
              {/* Source cards */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.slice(0, 6)
                  .sort((a, b) => (b.lastAccessed || b.dateAdded) - (a.lastAccessed || a.dateAdded))
                  .map((source) => (
                    <div 
                      key={source.id}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="text-lg mr-2">
                            {source.type === 'pdf' ? '📄' : source.type === 'image' ? '🖼️' : '📝'}
                          </div>
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {source.metadata.title || 'Untitled Source'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {source.metadata.author || 'Unknown Author'}
                          {source.metadata.date ? ` • ${source.metadata.date}` : ''}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                          {source.content.substring(0, 100)}...
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Last viewed: {source.lastAccessed
                            ? new Date(source.lastAccessed).toLocaleDateString()
                            : 'Never viewed'
                          }
                        </div>
                      </div>
                      <div className="flex divide-x divide-slate-200 dark:divide-slate-700 border-t border-slate-200 dark:border-slate-700">
                        <button className="flex-1 text-xs py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                          View
                        </button>
                        <button className="flex-1 text-xs py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                          Analyze
                        </button>
                      </div>
                    </div>
                  ))
                }
                
                {sources.length === 0 && (
                  <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-8">
                    No sources yet. Upload your first source to see it here.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}