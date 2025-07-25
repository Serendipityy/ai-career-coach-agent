import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { roadmapId, userInput } = await req.json();
    const user = await currentUser();
    const resultIds = await inngest.send({
        name: 'AiRoadmapAgent',
        data: {
            userInput: userInput,
            roadmapId: roadmapId,
            userEmail: user?.primaryEmailAddress?.emailAddress
        }
    })
    const runId = resultIds?.ids[0];
    console.log(runId)
    let runStatus;
    // Use Polling to check Run status
    while (true) {
        runStatus = await getRuns(runId);
        console.log(runStatus?.data);
        if (runStatus?.data[0]?.status === 'Completed') {
            break;
        }
        if (runStatus?.data[0]?.status === 'Canceled') {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json(runStatus.data?.[0].output?.output[0])
}

// https://www.inngest.com/docs/examples/fetch-run-status-and-output
export async function getRuns(runId: string) {
    const result = await axios.get(`${process.env.INGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
        headers: {
            'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`
        }
    })

    return result.data;
}
