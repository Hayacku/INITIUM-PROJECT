import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Timer, Play, Pause, SkipForward, Coffee, Music, RotateCcw, CheckCircle2, ListMusic, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Formatage mm:ss
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Configuration Spotify (À placer dans .env idéalement, mais ici pour simplification locale)
// L'utilisateur devra peut-être mettre son propre Client ID si celui-ci ne marche pas (localhost)
const SPOTIFY_CLIENT_ID = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"; // Placeholder: L'utilisateur devra mettre le sien s'il veut un vrai auth
const REDIRECT_URI = window.location.origin + "/pomodoro";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "playlist-read-private playlist-read-collaborative user-read-currently-playing";

const Pomodoro = () => {
  const { api } = useAuth();

  // États du Timer
  const [mode, setMode] = useState('work'); // work, short_break, long_break
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Timer Refs
  const timerRef = useRef(null);
  const endTimeRef = useRef(null);

  // Spotify Integration
  const [spotifyToken, setSpotifyToken] = useState(localStorage.getItem('spotify_token') || '');
  const [spotifyUrl, setSpotifyUrl] = useState(localStorage.getItem('pomodoro_spotify_url') || '');
  const [playlists, setPlaylists] = useState([]);
  const [showSpotifyInput, setShowSpotifyInput] = useState(false); // Fallback manual input

  // Tasks & Liaisons
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Stats
  const [stats, setStats] = useState({ today: 0 });

  const DURATIONS = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  const MODES_LABELS = {
    work: 'Concentration',
    short_break: 'Pause courte',
    long_break: 'Longue pause'
  };

  // 1. Initialisation & Auth Spotify check
  useEffect(() => {
    loadTasks();
    loadStats();

    // Check URL Hash for Spotify Token
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      window.location.hash = "";
      setSpotifyToken(token);
      localStorage.setItem('spotify_token', token);
      toast.success('Connecté à Spotify !');
    }

    const savedMode = localStorage.getItem('pomodoro_mode');
    if (savedMode) setMode(savedMode);
  }, []);

  // 2. Fetch Playlists if Token exists
  useEffect(() => {
    if (spotifyToken) {
      fetchPlaylists();
    }
  }, [spotifyToken]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=10', {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      if (response.status === 401) {
        // Token expired
        setSpotifyToken('');
        localStorage.removeItem('spotify_token');
        return;
      }
      const data = await response.json();
      if (data.items) {
        setPlaylists(data.items);
        // Si aucune URL n'est set, mettre la première
        if (!spotifyUrl && data.items.length > 0) {
          setSpotifyUrl(data.items[0].external_urls.spotify);
        }
      }
    } catch (e) {
      console.error("Spotify fetch error", e);
    }
  };

  const handleSpotifyLogin = () => {
    // On demande le Client ID si non configuré (simple prompt pour éviter complexité UI)
    let clientId = localStorage.getItem('spotify_client_id');
    if (!clientId) {
      clientId = window.prompt("Entrez votre Spotify Client ID (disponible sur developer.spotify.com):");
      if (clientId) localStorage.setItem('spotify_client_id', clientId);
    }

    if (!clientId) return;

    window.location.href = `${AUTH_ENDPOINT}?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
  };

  // 3. Timer Logic
  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((endTimeRef.current - now) / 1000);
        if (diff <= 0) {
          handleTimerComplete();
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      endTimeRef.current = null;
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem('pomodoro_spotify_url', spotifyUrl);
  }, [spotifyUrl]);

  useEffect(() => {
    localStorage.setItem('pomodoro_mode', mode);
  }, [mode]);

  const loadTasks = async () => {
    try {
      const activeQuests = await db.quests.where('status').equals('in_progress').toArray();
      setTasks(activeQuests);
    } catch (error) { console.error(error); }
  };

  const loadStats = () => {
    const storedCount = parseInt(localStorage.getItem('pomodoro_today_count') || '0');
    setStats({ today: storedCount });
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
    endTimeRef.current = null;
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => { });

    if (mode === 'work') {
      const newCount = stats.today + 1;
      setStats({ today: newCount });
      localStorage.setItem('pomodoro_today_count', newCount.toString());
      toast.success('Session terminée ! ☕');
      if (newCount % 4 === 0) switchMode('long_break');
      else switchMode('short_break');
    } else {
      toast.info('Pause terminée ! 🚀');
      switchMode('work');
    }
  };

  const getSpotifyEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname.startsWith('/embed')) return url;
      return `https://open.spotify.com/embed${urlObj.pathname}`;
    } catch (e) { return null; }
  };

  const totalDuration = DURATIONS[mode];
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Focus Station
          </h1>
          <p className="text-muted-foreground">Synchronisez votre énergie avec vos tâches</p>
        </div>

        {/* Task Selector */}
        <div className="glass-card p-1 rounded-lg flex items-center gap-2 max-w-xs w-full">
          <select
            className="bg-transparent border-none text-sm w-full focus:ring-0 cursor-pointer p-2"
            value={activeTaskId || ''}
            onChange={(e) => setActiveTaskId(e.target.value)}
          >
            <option value="">Sélectionner une quête...</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          {activeTaskId && <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TIMER */}
        <Card className="lg:col-span-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden relative" data-testid="pomodoro-timer">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary/20">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center space-y-12">
            <div className="flex p-1 bg-secondary/20 rounded-xl">
              {['work', 'short_break', 'long_break'].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${mode === m
                    ? 'bg-background shadow-lg text-primary scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                >
                  {MODES_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="relative group cursor-pointer" onClick={toggleTimer}>
              <div className="text-9xl font-mono font-bold tracking-tighter tabular-nums bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent transition-all group-hover:scale-105 duration-300 select-none">
                {formatTime(timeLeft)}
              </div>
              <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium uppercase tracking-widest transition-opacity ${isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                {isRunning ? 'En cours...' : 'En pause'}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={resetTimer} className="rounded-full w-12 h-12 hover:bg-destructive/10 hover:text-destructive">
                <RotateCcw className="w-6 h-6" />
              </Button>
              <Button size="xl" onClick={toggleTimer} className={`rounded-full w-20 h-20 shadow-xl transition-all duration-300 ${isRunning ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary hover:bg-primary/90 hover:scale-110'}`}>
                {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleTimerComplete()} className="rounded-full w-12 h-12 hover:bg-white/5">
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coffee className="w-4 h-4 text-primary" /> Sessions aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{stats.today}</span>
                <span className="text-muted-foreground mb-1">/ 8</span>
              </div>
              <Progress value={(stats.today / 8) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Spotify Widget */}
          <Card className="overflow-hidden border-none shadow-lg bg-black/40 backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-400">
                <Music className="w-4 h-4" /> Ambiance Sonore
              </CardTitle>
              {!spotifyToken ? (
                <Button variant="ghost" size="sm" onClick={handleSpotifyLogin} className="text-[10px] h-6 px-2 bg-green-600/20 text-green-400 hover:bg-green-600/30">
                  <LogIn className="w-3 h-3 mr-1" /> Login
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem('spotify_token'); setSpotifyToken(''); }} className="text-[10px] h-6 px-2 text-destructive hover:bg-white/5">
                  Logout
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {spotifyToken && (
                <div className="p-3 bg-black/50">
                  <Select onValueChange={(val) => {
                    const playlist = playlists.find(p => p.id === val);
                    if (playlist) setSpotifyUrl(playlist.external_urls.spotify);
                  }}>
                    <SelectTrigger className="h-8 text-xs bg-white/10 border-none">
                      <SelectValue placeholder="Choisir une playlist..." />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!spotifyToken && (
                <div className="p-2 text-center">
                  <button onClick={() => setShowSpotifyInput(!showSpotifyInput)} className="text-[10px] text-muted-foreground underline">
                    Saisir le lien manuellement
                  </button>
                  {showSpotifyInput && (
                    <Input
                      value={spotifyUrl}
                      onChange={e => setSpotifyUrl(e.target.value)}
                      placeholder="Lien Spotify..."
                      className="text-xs h-7 mt-1 bg-white/5 border-white/10"
                    />
                  )}
                </div>
              )}

              <div className="w-full aspect-square md:aspect-[3/2] lg:aspect-square bg-black/60 flex items-center justify-center">
                {getSpotifyEmbedUrl(spotifyUrl) ? (
                  <iframe
                    key={spotifyUrl}
                    title="Spotify Web Player"
                    src={getSpotifyEmbedUrl(spotifyUrl)}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                    className="animate-in fade-in"
                  ></iframe>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Connectez-vous pour choisir une playlist</p>
                    <Button
                      variant="link"
                      className="text-green-400 text-xs mt-2 h-auto p-0"
                      onClick={() => setSpotifyUrl('https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wqrS')}
                    >
                      Défaut: Lo-Fi Beats
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
