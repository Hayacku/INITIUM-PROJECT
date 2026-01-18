import React, { useState } from 'react';
import { useAi } from '../contexts/AiContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Brain, Mic, Send, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

const AxiomDecisionCard = () => {
    const { analyzeAction, analyzing } = useAi();
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [mode, setMode] = useState('input'); // input, processing, result

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setMode('processing');
        const data = await analyzeAction(input);
        if (data) {
            setResult(data);
            setMode('result');
        } else {
            setMode('input');
        }
    };

    const reset = () => {
        setResult(null);
        setInput('');
        setMode('input');
    };

    return (
        <Card className="border border-border/50 bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Brain className="w-4 h-4 text-violet-500" />
                    Axiom Engine
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
                {mode === 'input' && (
                    <div className="space-y-3 animate-in fade-in">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Décrivez un dilemme ou une action..."
                            className="w-full bg-background border border-border/50 rounded-lg p-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none h-20"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyze(); } }}
                        />
                        <div className="flex justify-between items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-muted-foreground">
                                <Mic className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={handleAnalyze}
                                disabled={!input.trim()}
                                size="sm"
                                className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4"
                            >
                                Analyser <Send className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {mode === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-6 animate-in fade-in">
                        <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-3" />
                        <p className="text-xs text-muted-foreground font-medium animate-pulse">Analyse des conséquences...</p>
                    </div>
                )}

                {mode === 'result' && result && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2">
                        {/* Verdict Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-foreground text-lg leading-tight">{result.winning_action}</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[90%]">{result.ai_rationale}</p>
                            </div>
                            <div className="flex flex-col items-center bg-background border border-border/50 rounded-lg p-2 min-w-[60px]">
                                <span className={`text-xl font-bold ${result.analyzed_actions[0].is_allowed ? 'text-violet-500' : 'text-red-500'}`}>
                                    {result.analyzed_actions[0].calculated_score}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Score</span>
                            </div>
                        </div>

                        {/* Analysis Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1 mb-1">
                                    <CheckCircle className="w-3 h-3" /> Gains
                                </span>
                                <p className="text-xs text-muted-foreground leading-snug">{result.analyzed_actions[0].impact.immediate_gain}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <span className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold flex items-center gap-1 mb-1">
                                    <AlertTriangle className="w-3 h-3" /> Risques
                                </span>
                                <p className="text-xs text-muted-foreground leading-snug">Sévérité: {result.analyzed_actions[0].impact.risk_severity}/10</p>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={reset} className="w-full text-xs h-8">
                            Nouvelle analyse
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AxiomDecisionCard;
