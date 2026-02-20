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
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

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

      // --- NEW: Dynamic Insights Calculation ---

      // 1. Best Day
      const xpByDay = {}; // 'Monday' -> [100, 50, 200]
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      analytics.forEach(a => {
        const d = new Date(a.date);
        const dayName = days[d.getDay()];
        if (!xpByDay[dayName]) xpByDay[dayName] = [];
        xpByDay[dayName].push(a.xpEarned || 0);
      });

      let bestDay = { name: '...', avg: 0 };
      Object.entries(xpByDay).forEach(([day, values]) => {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / values.length) || 0;
        if (avg > bestDay.avg) bestDay = { name: day, avg };
      });

      // 2. Productivity Time (Morning vs Afternoon vs Evening)
      // We need to fetch ALL completed quests for this stats, or just recent ones.
      // Let's fetch last 50 completed quests to be efficient
      const recentCompletedQuests = await db.quests
        .where('status').equals('completed')
        .reverse()
        .limit(50)
        .toArray();

      let timeStats = { morning: 0, afternoon: 0, evening: 0 };
      recentCompletedQuests.forEach(q => {
        if (!q.completedAt) return;
        const hour = new Date(q.completedAt).getHours();
        if (hour >= 5 && hour < 12) timeStats.morning++;
        else if (hour >= 12 && hour < 18) timeStats.afternoon++;
        else timeStats.evening++;
      });

      const totalTimeStats = timeStats.morning + timeStats.afternoon + timeStats.evening;
      let productivityInsight = null;
      if (totalTimeStats > 0) {
        const maxTime = Math.max(timeStats.morning, timeStats.afternoon, timeStats.evening);
        const periodName = maxTime === timeStats.morning ? 'matin' : (maxTime === timeStats.afternoon ? 'après-midi' : 'soir');
        const percentage = Math.round((maxTime / totalTimeStats) * 100);
        productivityInsight = { period: periodName, percentage };
      }

      // 3. Category Completion Rate
      // categoryMap has counts of ALL quests. We need counts of COMPLETED quests per category.
      const completedCategoryMap = {};
      recentCompletedQuests.forEach(q => {
        completedCategoryMap[q.category] = (completedCategoryMap[q.category] || 0) + 1;
      });
      // We need total per category. We already have categoryMap from before? No that was just iterator.
      // Let's rebuild a global map
      const allCategoryCounts = {};
      allQuests.forEach /* wait, we don't have allQuests array, just count */
      // Optimization: Let's use the quests we fetched for category chart if possible, or fetch all (overhead?)
      // We fetched `quests` earlier: const quests = await db.quests.toArray();
      const catStats = {};
      quests.forEach(q => {
        if (!catStats[q.category]) catStats[q.category] = { total: 0, completed: 0 };
        catStats[q.category].total++;
        if (q.status === 'completed') catStats[q.category].completed++;
      });

      let bestCategory = { name: null, rate: 0 };
      Object.entries(catStats).forEach(([cat, data]) => {
        if (data.total < 3) return; // Ignore small sample size
        const rate = Math.round((data.completed / data.total) * 100);
        if (rate > bestCategory.rate) bestCategory = { name: cat, rate };
      });


      setInsights({
        bestDay,
        productivity: productivityInsight,
        bestCategory: bestCategory.name ? bestCategory : null
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const [insights, setInsights] = useState({ bestDay: null, productivity: null, bestCategory: null });
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('analytics-content');
    if (!element) {
      setIsExporting(false);
      return;
    }

    try {
      // Temporary hide controls for cleaner PDF
      const controls = document.querySelectorAll('[data-export-hide="true"]');
      controls.forEach(el => el.style.display = 'none');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b', // zinc-950 (app background)
        logging: false
      });

      // Restore controls
      controls.forEach(el => el.style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Initium_Analytics_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('Rapport exporté avec succès !');
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 45%)', 'hsl(0 72% 55%)', 'hsl(45 93% 55%)'];

  return (
    <div id="analytics-content" className="space-y-6 animate-fade-in" data-testid="analytics-page">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-primary" />
            Analytics
          </h1>
          <p className="text-foreground/60 text-lg">Analysez vos performances et progression</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          data-export-hide="true"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Export...' : 'Exporter PDF'}
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2" data-testid="period-selector">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${period === days
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
                  <p className="font-bold">{category.name}</p>
                  <p className="text-sm text-foreground/60">{category.value} quêtes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REPLACING THE PREVIOUS INSIGHTS SECTION */}

      {/* Insights */}
      <div className="card-modern" data-testid="analytics-insights">
        <h2 className="text-2xl font-bold mb-6">Insights</h2>
        <div className="space-y-4">

          {/* Best Day Insight */}
          {insights.bestDay && insights.bestDay.avg > 0 && (
            <div className="p-4 bg-primary/10 rounded-xl">
              <p className="font-bold text-primary mb-1">📅 Votre meilleur jour</p>
              <p className="text-sm text-foreground/70">
                Le <span className="font-bold">{insights.bestDay.name}</span> est votre jour le plus productif avec une moyenne de {insights.bestDay.avg} XP.
              </p>
            </div>
          )}

          {/* Productivity Time Insight */}
          {insights.productivity && (
            <div className="p-4 bg-secondary/10 rounded-xl">
              <p className="font-bold text-secondary mb-1">⚡ Pic de productivité</p>
              <p className="text-sm text-foreground/70">
                Vous êtes <span className="font-bold">{insights.productivity.percentage}%</span> plus efficace le {insights.productivity.period}.
              </p>
            </div>
          )}

          {/* Category Insight */}
          {insights.bestCategory && (
            <div className="p-4 bg-green-500/10 rounded-xl">
              <p className="font-bold text-green-500 mb-1">🏆 Domaine d'excellence</p>
              <p className="text-sm text-foreground/70">
                Vos quêtes <span className="font-bold">{insights.bestCategory.name}</span> ont un taux de réussite de {insights.bestCategory.rate}%.
              </p>
            </div>
          )}

          {/* Fallback general stats if not enough data for specific insights yet */}
          {!insights.bestDay?.avg && !insights.productivity && (
            <div className="p-4 bg-accent/50 rounded-xl">
              <p className="font-bold mb-1">Analyses en cours...</p>
              <p className="text-sm text-foreground/70">
                Continuez à utiliser l'application pour débloquer des insights personnalisés !
              </p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Analytics;
