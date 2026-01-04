import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Zap,
  Target,
  Calendar
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [stats, setStats] = useState({
    totalXP: 0,
    avgXPPerDay: 0,
    totalQuests: 0,
    totalHabits: 0,
    completionRate: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      // Load analytics from last N days
      const startDate = subDays(new Date(), period);
      const analytics = await db.analytics
        .where('date')
        .above(startDate)
        .toArray();

      // Format for charts
      const chartData = analytics.map(a => ({
        date: format(new Date(a.date), 'dd/MM'),
        xp: a.xpEarned || 0,
        quests: a.questsCompleted || 0,
        habits: a.habitsCompleted || 0
      }));

      setAnalyticsData(chartData);

      // Calculate stats
      const totalXP = analytics.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
      const totalQuests = await db.quests.where('status').equals('completed').count();
      const totalHabits = await db.habits.count();
      const allQuests = await db.quests.count();
      const completionRate = allQuests > 0 ? Math.round((totalQuests / allQuests) * 100) : 0;

      setStats({
        totalXP,
        avgXPPerDay: Math.round(totalXP / period),
        totalQuests,
        totalHabits,
        completionRate
      });

      // Category breakdown
      const quests = await db.quests.toArray();
      const categoryMap = {};
      quests.forEach(q => {
        categoryMap[q.category] = (categoryMap[q.category] || 0) + 1;
      });

      const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
      }));

      setCategoryData(categoryChartData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 45%)', 'hsl(0 72% 55%)', 'hsl(45 93% 55%)'];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="analytics-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary" />
          Analytics
        </h1>
        <p className="text-foreground/60 text-lg">Analysez vos performances et progression</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2" data-testid="period-selector">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === days
                ? 'bg-primary text-white'
                : 'bg-foreground/5 hover:bg-foreground/10'
            }`}
            data-testid={`period-${days}-button`}
          >
            {days} jours
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" data-testid="analytics-stats">
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalXP}</p>
          <p className="text-foreground/60 text-sm">XP total ({period}j)</p>
        </div>

        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.avgXPPerDay}</p>
          <p className="text-foreground/60 text-sm">XP moyen/jour</p>
        </div>

        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Target className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalQuests}</p>
          <p className="text-foreground/60 text-sm">Quêtes complétées</p>
        </div>

        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalHabits}</p>
          <p className="text-foreground/60 text-sm">Habitudes actives</p>
        </div>

        <div className="card-modern">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.completionRate}%</p>
          <p className="text-foreground/60 text-sm">Taux de complétion</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP Evolution */}
        <div className="card-modern" data-testid="xp-chart">
          <h2 className="text-2xl font-bold mb-6">Evolution XP</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--foreground) / 0.5)" 
                tick={{ fill: 'hsl(var(--foreground) / 0.6)' }}
              />
              <YAxis 
                stroke="hsl(var(--foreground) / 0.5)" 
                tick={{ fill: 'hsl(var(--foreground) / 0.6)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--foreground) / 0.2)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="xp" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Chart */}
        <div className="card-modern" data-testid="activity-chart">
          <h2 className="text-2xl font-bold mb-6">Activité quotidienne</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--foreground) / 0.5)" 
                tick={{ fill: 'hsl(var(--foreground) / 0.6)' }}
              />
              <YAxis 
                stroke="hsl(var(--foreground) / 0.5)" 
                tick={{ fill: 'hsl(var(--foreground) / 0.6)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--foreground) / 0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="quests" fill="hsl(var(--primary))" name="Quêtes" />
              <Bar dataKey="habits" fill="hsl(var(--secondary))" name="Habitudes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="card-modern" data-testid="category-chart">
        <h2 className="text-2xl font-bold mb-6">Répartition par catégorie</h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-foreground/60">{category.value} quêtes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card-modern" data-testid="analytics-insights">
        <h2 className="text-2xl font-bold mb-6">Insights</h2>
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <p className="font-semibold text-primary mb-1">🎖️ Performance excellente!</p>
            <p className="text-sm text-foreground/70">
              Vous avez gagné {stats.totalXP} XP en {period} jours, soit une moyenne de {stats.avgXPPerDay} XP par jour.
            </p>
          </div>
          {stats.completionRate >= 70 && (
            <div className="p-4 bg-green-500/10 rounded-xl">
              <p className="font-semibold text-green-500 mb-1">✅ Taux de complétion élevé</p>
              <p className="text-sm text-foreground/70">
                {stats.completionRate}% de vos quêtes sont terminées. Continue comme ça!
              </p>
            </div>
          )}
          {stats.totalHabits >= 3 && (
            <div className="p-4 bg-secondary/10 rounded-xl">
              <p className="font-semibold text-secondary mb-1">🔥 Habitudes solides</p>
              <p className="text-sm text-foreground/70">
                {stats.totalHabits} habitudes actives. La constance est la clé du succès!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
