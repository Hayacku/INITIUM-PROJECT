import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';

const ProjectsSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="glass-card h-64 flex flex-col">
                        <CardHeader className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent className="flex-1">
                            <Skeleton className="h-2 w-full mt-4 rounded-full" />
                            <div className="mt-4 flex gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-white/5 pt-4">
                            <Skeleton className="h-4 w-32" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProjectsSkeleton;
