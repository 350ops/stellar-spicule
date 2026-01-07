import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai('gpt-4-turbo'),
        messages: await convertToModelMessages(messages),
        system: "You are a helpful travel assistant for the 'HyperSpace' app. You help users plan trips, specifically a Japan trip for Camille and Miguel. You can propose actions. Be concise and helpful.",
    });

    return result.toTextStreamResponse();
}
