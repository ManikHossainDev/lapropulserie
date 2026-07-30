'use client'
import React from 'react';

const IsLoading = ({ row }) => {
    return (
        <div>
            <div className="mx-auto w-full rounded-md border border-blue-300 p-4">
                <div className="flex animate-pulse space-x-4">
                    <div className="size-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-6 py-1">
                        <div className="space-y-3">
                            {
                                [...Array(row)].map((item , index) => (
                                    <div key={index} className="h-2 rounded bg-gray-200"></div>
                                ))
                            }
                            <div className="h-2 rounded bg-gray-200"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IsLoading;
