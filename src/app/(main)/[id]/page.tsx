'use client'

import { use } from "react";


export default function Page({ params }: { params: Promise<{ id: string }> }) {

    const { id } = use(params);

    return (
        <>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <p>Update Details</p>
                </div>
            </div>
        </>
    )
}