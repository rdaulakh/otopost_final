const { Configuration, OpenAIApi } = require("openai");

const runAgent = async (prompt) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling OpenAI:", error.response ? error.response.data : error.message);
        throw new Error("Failed to get response from AI agent.");
    }
};


const intelligenceAgent = async (businessProfile) => {
    const prompt = `Analyze market trends for a business like this: ${JSON.stringify(businessProfile)}. Identify 3 key trends.`;
    console.log('[Orchestrator] Running Intelligence Agent...');
    return runAgent(prompt);
};

const strategyAgent = async (businessProfile, marketTrends) => {
    const prompt = `Based on these trends: ${marketTrends}, create a content strategy for this business: ${JSON.stringify(businessProfile)}. The strategy should define tone, key pillars, and post frequency.`;
    console.log('[Orchestrator] Running Strategy Agent...');
    return runAgent(prompt);
};

const contentDirectionAgent = async (contentStrategy) => {
    const prompt = `Based on this strategy: ${contentStrategy}, generate 3 distinct content ideas. Format as a numbered list.`;
    console.log('[Orchestrator] Running Content Direction Agent...');
    const result = await runAgent(prompt);
    return result.split('\n').filter(line => line.match(/^\d+\./)).map(line => line.replace(/^\d+\.\s*/, ''));
};

const postTypeSelectorAgent = async (idea) => {
    const prompt = `For the content idea "${idea}", what is the best post type? Choose one: Carousel, Single Image, Video, Text Only.`;
    console.log('[Orchestrator] Running Post Type Selector Agent...');
    return runAgent(prompt);
};

const completePostCreatorAgent = async (idea, postType, contentStrategy) => {
    const prompt = `Create a complete social media post.\nStrategy: ${contentStrategy}\nIdea: "${idea}"\nPost Type: ${postType}\n\nGenerate the post copy, relevant hashtags, and a suggestion for the visual. Format as a JSON object with keys: "copy", "hashtags", "visualSuggestion".`;
    console.log('[Orchestrator] Running Complete Post Creator Agent...');
    const result = await runAgent(prompt);
    try {
        const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedResult);
    } catch (e) {
        console.error("Failed to parse JSON from completePostCreatorAgent:", e);
        return { copy: "AI failed to generate valid post copy.", hashtags: "#error", visualSuggestion: "No visual available." };
    }
};


async function runContentGenerationWorkflow(businessProfile) {
  console.log('[Orchestrator] Starting content generation workflow...');

  try {
    const marketTrends = await intelligenceAgent(businessProfile);
    console.log('[Orchestrator] Step 1/5: Intelligence Agent Complete.');

    const contentStrategy = await strategyAgent(businessProfile, marketTrends);
    console.log('[Orchestrator] Step 2/5: Strategy Agent Complete.');

    const contentIdeas = await contentDirectionAgent(contentStrategy);
    console.log(`[Orchestrator] Step 3/5: Content Direction Agent Complete. Ideas: ${contentIdeas.join(', ')}`);

    const generatedPosts = [];
    for (const idea of contentIdeas) {
      const postType = await postTypeSelectorAgent(idea);
      console.log(`[Orchestrator] Step 4/5: Post Type Selected: ${postType}`);

      const completePost = await completePostCreatorAgent(idea, postType, contentStrategy);
      generatedPosts.push({ ...completePost, idea, postType });
      console.log('[Orchestrator] Step 5/5: Complete Post Created.');
    }

    console.log('[Orchestrator] Workflow complete. Generated posts ready.');
    return generatedPosts;

  } catch (error) {
    console.error('[Orchestrator] Error during agent workflow:', error);
    throw new Error('Failed to complete AI content generation workflow.');
  }
}

module.exports = { runContentGenerationWorkflow };
