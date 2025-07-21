import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import AITools from './_components/AITools'
import History from './_components/History'

function Dashboard() {
    return (
        <div>
            <WelcomeBanner />
            <AITools />
            <History />
        </div>
    )
}

export default Dashboard