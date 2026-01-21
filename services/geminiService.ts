
import { GoogleGenAI } from "@google/genai";
import type { FrameworkData, Source } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getApiErrorMessage = (error: unknown): string => {
    console.error("Gemini Service Error:", error);

    if (!(error instanceof Error)) {
        return "An unknown error occurred.";
    }

    const errorMessage = error.message;

    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
        return "There is a configuration issue with the application's API key. Please contact the administrator.";
    }
    
    if (error instanceof SyntaxError) {
        return `The AI returned a malformed response that could not be processed. Please try a different topic or try again later.`;
    }

    // Pass through custom, user-friendly errors that are already well-formed.
    if (errorMessage.startsWith('AI analysis is incomplete')) {
        return errorMessage;
    }

    // Try to extract a cleaner message from a JSON error object within the string
    const jsonMatch = errorMessage.match(/{[\s\S]*}/);
    if (jsonMatch && jsonMatch[0]) {
        try {
            const parsedJson = JSON.parse(jsonMatch[0]);
            if (parsedJson.error?.message) {
                return `An AI error occurred: ${parsedJson.error.message}`;
            }
        } catch (e) {
            // It wasn't valid JSON, fall through to the generic message
        }
    }

    // Fallback to a generic message to avoid showing raw errors.
    return "An unexpected error occurred while communicating with the AI. Please try again.";
};


const getPrompt = (topic: string): string => `
**PRIMARY DIRECTIVE:**
You are an AI policy analyst specializing in the Indian Civil Services (UPSC) examination. Your single task is to generate a valid JSON object for the topic: "${topic}".
The application UI depends on the exact structure below. **Every field is mandatory.** Do not omit any key. If information is not available, populate fields with "Data not available" or an empty array []. **Failure to include all keys will break the application.**

**MANDATORY JSON STRUCTURE:**
{
  "topicBrief": "A concise 3-4 sentence summary of the topic's core context and significance.",
  "whatYouNeedToKnow": {
    "introduction": ["Point 1 with specific dates, actors, and data.", "Point 2 with a statistic from a named source like a report or index."],
    "whyThisIsCritical": "Explain the issue's importance, linking it to a constitutional principle, major governance challenge, or its impact on national interest."
  },
  "liveNewsFeed": [
    { "title": "Most recent, relevant news headline 1.", "source": "Name of News Agency (e.g., The Hindu, Reuters)", "summary": "A 1-2 sentence summary of the news article.", "publishedDate": "YYYY-MM-DD" },
    { "title": "Second most recent, relevant news headline.", "source": "Name of News Agency", "summary": "A 1-2 sentence summary of the news article.", "publishedDate": "YYYY-MM-DD" }
  ],
  "multiDimensionalAnalysis": {
    "regulatoryInstitutional": { "points": ["Identify the specific law/institution.", "Cite a specific failure or a recommendation from a committee (e.g., Punchhi Commission)."], "crux": "Insight into the gap between law and execution." },
    "governancePolicyFailure": { "points": ["Name the specific scheme/policy and its implementation gap.", "Use data to show the failure or underperformance."], "crux": "Summary of the core governance deficit." },
    "technicalInfrastructure": { "points": ["Discuss a specific technology and its features.", "Provide data on its scale or impact."], "crux": "Key takeaway on the S&T or infra aspect." },
    "disasterSecurityConflict": { "points": ["Name specific security operations/protocols or disaster management frameworks.", "Use data on deployment or incidents."], "crux": "Insight into the security/disaster reality on the ground." },
    "economicGlobalRepercussions": { "points": ["Quantify economic impact (e.g., % of GDP, trade volume).", "Name affected international indices, partners, or treaties."], "crux": "The core economic or geopolitical truth." },
    "socialCulturalEthical": { "points": ["Cite data from a source (e.g., NFHS-5, NCRB data) for social impact.", "Reference specific constitutional values (Art. 14, 21) or ethical dilemmas."], "crux": "The fundamental socio-ethical conflict." }
  },
  "sourceValidation": {
    "summary": "A brief statement on the verification status of the key data points, mentioning the primary official sources checked (e.g., 'Key statistics were cross-referenced with recent PIB releases and Ministry of Home Affairs annual reports.').",
    "validatedPoints": [
      { "point": "A key statistic or fact from the analysis (e.g., 'India's GDP growth rate was 7.2% in 2022-23').", "source": "PIB, Ministry of Finance", "verificationStatus": "Verified" },
      { "point": "Another significant claim or data point.", "source": "Annual Report, Ministry of [Relevant Ministry]", "verificationStatus": "Verified" }
    ]
  },
  "previousYearQuestions": [
    { "year": 2021, "exam": "GS Paper 2", "question": "A relevant previous year question from UPSC Mains on this exact topic." }
  ],
  "prelimsQuestions": [
    { "type": "Statement-based (1,2,3 type)", "question": "Generate a statement-based question with 3 statements about the topic.", "options": { "A": "1 and 2 only", "B": "2 and 3 only", "C": "1 and 3 only", "D": "1, 2 and 3" }, "correctAnswer": "D" },
    { "type": "Factual Recall", "question": "Generate a direct factual question about the topic.", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "correctAnswer": "A" },
    { "type": "Conceptual Understanding", "question": "Generate a question testing a core concept related to the topic.", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "correctAnswer": "C" },
    { "type": "Current Affairs-based", "question": "Generate a question linking a recent event to the topic.", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "correctAnswer": "D" },
    { "type": "Match the Following", "question": "Generate a 'Match the Following' question with two lists related to the topic.", "options": { "A": "A-1, B-2", "B": "A-2, B-1", "C": "A-1, B-1", "D": "A-2, B-2" }, "correctAnswer": "A" }
  ],
  "mainsQuestions": [
    { "type": "Critically Examine", "question": "Generate a 'Critically Examine' question about the topic.", "answerStructure": ["Intro: Context + Stance", "Body: Arguments For/Pros", "Body: Arguments Against/Cons", "Conclusion: Balanced way forward"] },
    { "type": "Discuss", "question": "Generate a 'Discuss' question covering multiple dimensions of the topic.", "answerStructure": ["Intro: Definition + scope", "Body: Dimension 1 (e.g., Political)", "Body: Dimension 2 (e.g., Economic)", "Conclusion: Synthesized summary"] },
    { "type": "Analyze", "question": "Generate an 'Analyze' question that breaks down the topic into components.", "answerStructure": ["Intro: Topic breakdown", "Body: Component 1 analysis", "Body: Component 2 analysis", "Conclusion: Holistic perspective"] },
    { "type": "Compare and Contrast", "question": "Generate a 'Compare and Contrast' question related to the topic.", "answerStructure": ["Intro: Introduce A and B", "Body: Table or paragraphs on Similarities", "Body: Table or paragraphs on on Differences", "Conclusion: Concluding statement on significance."] }
  ],
  "interviewQuestions": [
    { "type": "Opinion-based", "question": "Generate a controversial question testing an opinion on the topic.", "answer": "Provide a balanced, constitutionally-grounded, and administratively feasible answer. Acknowledge multiple viewpoints but conclude with a firm, principle-based stance. Avoid extreme positions." },
    { "type": "Situational / Hypothetical", "question": "Generate a scenario where the candidate is a DM/official dealing with a crisis related to the topic.", "answer": "Provide a step-by-step administrative response. Start with immediate actions (containment, communication), followed by medium-term (resource mobilization, inter-departmental coordination) and long-term measures (policy suggestions, systemic improvements). Reference relevant laws or protocols (e.g., Disaster Management Act, 2005)." },
    { "type": "Background / DAF-based", "question": "Generate a question linking a common educational background (e.g., Engineering, Medicine, Arts) to solving a problem related to the topic.", "answer": "Provide a practical answer that showcases how specific skills from that background (e.g., analytical thinking for engineers, empathy for doctors, critical perspective for arts students) can be directly applied to governance and public service delivery related to the topic." },
    { "type": "Current Affairs Testing", "question": "Generate a question on a recent, significant news event related to the topic.", "answer": "Provide a concise summary of the event, followed by an analysis of its implications from a policy or administrative perspective. Quote key facts or data points accurately." },
    { "type": "Abstract / Curveball", "question": "Generate an unexpected, abstract question to test spontaneity, using the topic as a jumping-off point.", "answer": "Provide a thoughtful, structured answer that connects the abstract concept back to core principles of governance, ethics, or public service. Demonstrate clarity of thought under pressure." }
  ],
  "whatExaminerIsTesting": ["e.g., 'Data-Driven Analysis: Can the candidate quote precise data and sources?'", "e.g., 'Structural Thinking: Ability to break down a complex issue into its multi-dimensional parts.'", "e.g., 'Balanced Perspective: Can the candidate argue both for and against a proposition before reaching a conclusion?'"],
  "finalThoughts": "A single paragraph of deep, final insight, focusing on the systemic reality, the 'way forward,' or the core challenge.",
  "relatedTopics": ["Keyword 1", "Broader Associated Topic", "Specific Doctrine/Policy"]
}
`;

export const generateFramework = async (topic: string): Promise<{ data: FrameworkData; sources?: Source[] }> => {
    try {
        const prompt = getPrompt(topic);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as Source[] | undefined;
        
        if (!text) {
             throw new Error("No content generated by the AI. The response may have been blocked or is empty.");
        }

        let jsonStr = text.trim();
        
        // The AI may wrap the JSON in ```json ... ```. We need to extract it.
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonStr = jsonMatch[1];
        }

        const parsedData = JSON.parse(jsonStr) as Partial<FrameworkData>;

        // --- VALIDATION STEP ---
        const requiredKeys: (keyof FrameworkData)[] = [
            'topicBrief', 'whatYouNeedToKnow', 'liveNewsFeed', 'multiDimensionalAnalysis',
            'sourceValidation', 'previousYearQuestions', 'prelimsQuestions', 'mainsQuestions', 
            'interviewQuestions', 'whatExaminerIsTesting', 'finalThoughts', 'relatedTopics'
        ];

        const missingKeys = requiredKeys.filter(key => !(key in parsedData) || parsedData[key] === undefined || parsedData[key] === null);
        
        if (missingKeys.length > 0) {
            console.error("AI returned incomplete JSON. Missing keys:", missingKeys);
            throw new Error(`AI analysis is incomplete and cannot be displayed. The model failed to generate the following required sections: ${missingKeys.join(', ')}. This can happen with very broad or sensitive topics. Please try refining your topic.`);
        }


        return { data: parsedData as FrameworkData, sources };

    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
};

export const askFollowUpQuestion = async (topic: string, question: string): Promise<{ answer: string; sources?: Source[] }> => {
    try {
        const prompt = `You are a specialist AI policy analyst for the Indian Civil Services (UPSC) examination.
        A user is studying the topic: "${topic}".
        They have a follow-up question: "${question}".
        Provide a comprehensive, data-driven, and up-to-date answer based on the latest available information. Structure your answer clearly.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.3,
            }
        });

        const answer = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as Source[] | undefined;

        if (!answer) {
            throw new Error("No answer was generated. The AI's response might have been blocked or is empty.");
        }

        return { answer, sources };

    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
};