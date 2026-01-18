import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

const QuestsSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
                ))}
            </div>

            {/* Content List */}
            <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-card">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuestsSkeleton;
