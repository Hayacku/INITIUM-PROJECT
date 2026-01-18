import React, { Suspense } from 'react';

// Default loader if no skeleton provided
const DefaultLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
    </div>
);

const SuspensePage = ({ component: Component, skeleton: Skeleton }) => {
    return (
        <Suspense fallback={Skeleton ? <Skeleton /> : <DefaultLoader />}>
            <Component />
        </Suspense>
    );
};

export default SuspensePage;
