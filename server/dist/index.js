import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export async function main() {
    const chatCompletion = await getGroqChatCompletion();
    console.log(chatCompletion.choices[0]?.message?.content || "");
}
export async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "hi",
            },
        ],
        model: "llama-3.3-70b-versatile",
    });
}
// Run main() if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error("Failed to run main():", error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map