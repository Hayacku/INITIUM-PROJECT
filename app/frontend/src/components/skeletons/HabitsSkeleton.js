import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

const HabitsSkeleton = () => {
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

            {/* Content List */}
            <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="glass-card">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-2 w-32 mt-2" />
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex gap-1">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default HabitsSkeleton;
