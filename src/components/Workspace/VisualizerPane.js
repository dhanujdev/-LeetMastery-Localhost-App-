"use client";
import React from 'react';
import DataStructureVisualizer from '../Visualizers/DataStructureVisualizer';

export default function VisualizerPane() {
    return (
        <div className="h-full w-full flex flex-col p-4">
            <DataStructureVisualizer />
        </div>
    );
}
