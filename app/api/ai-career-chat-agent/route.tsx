import { inngest } from "@/inngest/client";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: any) {
    const { userInput } = await req.json();

    const resultIds = await inngest.send({
        name: 'AiCareerAgent',
        data: {
            userInput: userInput
        }
    })
    const runId = resultIds?.ids[0];

    let runStatus;
    while (true) {
        runStatus = await getRuns(runId);
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
