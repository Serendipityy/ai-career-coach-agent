import { HistoryTable } from "@/configs/schema";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
import ImageKit from "imagekit";
import { parse } from "path";
import { db } from "@/configs/db";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

// https://agentkit.inngest.com/getting-started/quick-start
export const AiCareerChatAgent = createAgent({
    name: 'AiCareerChatAgent',
    description: 'An Ai Agent that answers career related questions',
    system: `you are a helpful, professional AI career coach agent. Your role is to guide users with questions related to careers, including job search advice, interview preparation, resume improvement, skill development, career transitions, and industry trends. Always respond with clarity, encouragement, and actionable advice tailored to the user's needs. If the user asks something unrelated to careers (e.g., topics like health, relationshops, coding help, or general trivia), gently inform them that you are a career coach and suggest relevant career-focused questions instead.`,
    model: gemini({
        model: 'gemini-2.0-flash',
        apiKey: process.env.GEMINI_API_KEY
    })
})

export const AiResumeAnalyzerAgent = createAgent({
    name: 'AiResumeAnalyzerAgent',
    description: 'AI Resume Analyzer Agent help to Return Report',
    system: `You are an advanced AI Resume Analyzer Agent.
    Your task is to evaluate a candidate's resume and return a detailed analysis in the following structured JSON schema format.
    The schema must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.
    INPUT: I will provide a plain text resume.
    GOAL: Outout a JSON report as per the schema below. The report should reflect:
    overall_score (0-100)
    overall_feedback (short message e.g., "Excellent", "Needs improvement")
    summary_comment (1-2 sentence evaluation summary)
    Section scores for:
    Contact Info
    Experience
    Education
    Skills
    Each section should include:
    score (as percentage)
    Optional comment about that section
    Tips for improvement (3-5 tips)
    What's Good (1-3 strengths)
    Needs Improvement (1-3 weaknesses)
    Output JSON Schema:
    json
    Copy
    Edit
    {
    "overall_score": 85,
    "overall_feedback": "Excellent",
    "summary_comment": "Your resume is strong, but there are areas to refine.",
    "sections": {
        "contact_info": {
            "score": 95,
            "comment": "Perfectly structured and complete.",
        },
        "experience": {
            "score": 80,
            "comment": "Good experience, but could use more quantifiable achievements.",
        },
        "education": {
            "score": 90,
            "comment": "Strong educational background.",
        },
        "skills": {
            "score": 75,
            "comment": "Relevant skills, but could be more specific to the job.",
        },
    },
    "tips_for_improvement": [
        "Add more quantifiable achievements in your experience section.",
        "Tailor your skills section to match the job description more closely.",
        "Consider adding a summary section to highlight your key qualifications.",
    ],
    "whats_good": [
        "Strong educational background.",
        "Well-structured contact information.",
        "Relevant experience."
    ],
    "needs_improvement": [
        "More quantifiable achievements in experience.",
        "Skills could be more tailored to the job.",
        "Consider adding a summary section."
    ]
    }`,
    model: gemini({
        model: 'gemini-2.0-flash',
        apiKey: process.env.GEMINI_API_KEY
    }),
})

export const AiCareerAgent = inngest.createFunction(
    { id: "AiCareerAgent" },
    { event: 'AiCareerAgent' },
    async ({ event, step }) => {
        const { userInput } = await event?.data;
        const result = await AiCareerChatAgent.run(userInput);
        return result;
    }
)

var imagekit = new ImageKit({
    // @ts-ignore
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    // @ts-ignore
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    // @ts-ignore
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
});


export const AiResumeAgent = inngest.createFunction(
    { id: 'AiResumeAgent' },
    { event: 'AiResumeAgent' },
    async ({ event, step }) => {
        const { recordId, base64ResumeFile, pdfText, aiAgentType, userEmail } = await event.data;
        // Upload file to Cloud

        // https://www.npmjs.com/package/imagekit
        const uploadFileUrl = await step.run("uploadImage", async () => {
            const imageKitFile = await imagekit.upload({
                file: base64ResumeFile,
                fileName: `${Date.now()}.pdf`,
                isPublished: true,
            })
            return imageKitFile.url;
        })

        const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfText)
        //@ts-ignore
        const rawContent = aiResumeReport.output[0].content
        const rawContentJson = rawContent.replace('```json', '').replace('```', '');
        const parseJson = JSON.parse(rawContentJson);
        // return parseJson

        // Save to DB
        const saveToDb = await step.run("saveToDb", async () => {
            const result = await db.insert(HistoryTable).values({
                recordId: recordId,
                content: parseJson,
                aiAgentType: aiAgentType,
                createdAt: (new Date()).toString(),
                userEmail: userEmail,
                metaData: uploadFileUrl
            });
            console.log(result);
            return parseJson;
        })

    }
) 