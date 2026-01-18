import React, { useState } from 'react';
import { useAi } from '../contexts/AiContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';

const AxiomTest = () => {
    const { analyzeAction, analyzing } = useAi();
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        const data = await analyzeAction(input);
        setResult(data);
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-neon-violet">Axiom Engine Test Lab</h1>

            <Card>
                <CardHeader><CardTitle>Input Dilemma</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <textarea
                        className="w-full h-32 p-4 bg-background border border-border rounded-md"
                        placeholder="Describe your action or dilemma..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onClick={handleAnalyze} disabled={analyzing || !input}>
                        {analyzing ? 'Processing...' : 'Analyze with Axiom'}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-neon-blue">
                        <CardHeader><CardTitle>Analysis Result</CardTitle></CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto h-96">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    {/* Visual Preview of the Card */}
                    <Card className="border-neon-violet bg-black/40 backdrop-blur-md">
                        <CardHeader><CardTitle className="text-neon-violet">Decision Card Preview</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {result.analyzed_actions.map((action, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="text-xl font-bold">{action.action_name}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="p-2 border border-green-500/50 rounded">
                                            <span className="text-gray-400">Gain (Short):</span>
                                            <div className="font-semibold">{action.impact.immediate_gain}</div>
                                        </div>
                                        <div className="p-2 border border-red-500/50 rounded">
                                            <span className="text-gray-400">Cost (Real):</span>
                                            <div className="font-semibold">{action.impact.visible_cost}</div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="text-xs text-gray-500 uppercase">Alignment</div>
                                        <div className="text-2xl font-bold text-neon-blue">
                                            {action.calculated_score.toFixed(1)} / 100
                                        </div>
                                        {action.rejection_reason && (
                                            <div className="mt-2 text-red-400 font-bold border border-red-500 p-2 rounded bg-red-900/20">
                                                ⚠️ REJECTED: {action.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-6 p-4 bg-neon-violet/10 border border-neon-violet rounded">
                                <div className="font-bold text-neon-violet">AI Rationale</div>
                                <p className="text-sm mt-1">{result.ai_rationale}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AxiomTest;
