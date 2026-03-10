import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../../lib/auth';
import { generateWithFallback, parseJsonFromText, MODEL_CASCADE, GeminiModelId } from '../../../../lib/gemini';

// Malaika's brand persona used across all prompts
const PERSONA = `You are assisting Malaika Nisar, a results-driven Digital Marketing Specialist based in Pakistan.
She manages social media, paid ad campaigns, content strategy, and Shopify e-commerce for brands like Bacha Toys, Junior Land, and Golu Baby.
Her writing style is professional yet approachable, data-informed, and geared towards driving measurable ROI.`;

const BLOG_FOOTER = `

---

**Let's Connect!**

If you found this article helpful, I'd love to hear your thoughts. Feel free to reach out:

- **LinkedIn:** [Malaika Nisar](https://www.linkedin.com/in/malaikaanisar)
- **Email:** [malaikaanisar2521@gmail.com](mailto:malaikaanisar2521@gmail.com)
- **Portfolio:** [malaikaa.space](https://malaikaa.space)

*Follow me for more digital marketing insights, tips, and strategies!*
`;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Add GEMINI_API_KEY to your environment variables.',
    });
  }

  const { action, model: preferredModel } = req.body as { action: string; model?: string };

  try {

    /* ─── 1. Blog/content idea generator ─── */
    if (action === 'ideas') {
      const { topic } = req.body as { topic: string };
      if (!topic?.trim()) return res.status(400).json({ error: '"topic" is required.' });

      const prompt = `${PERSONA}
Generate exactly 7 compelling blog post title ideas for a digital marketing blog on the topic: "${topic}".
Titles should be practical, SEO-friendly, and relevant to digital marketers, social media managers, and brand owners.
Focus on actionable insights, case studies, strategy guides, or growth tips.
Return ONLY a valid JSON array of strings. No markdown, no extra text.
Example: ["Title 1", "Title 2"]`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const ideas = parseJsonFromText<string[]>(text);
      return res.status(200).json({ ideas, modelUsed });
    }

    /* ─── 2. Blog post outline ─── */
    if (action === 'outline') {
      const { topic } = req.body as { topic: string };
      if (!topic?.trim()) return res.status(400).json({ error: '"topic" is required.' });

      const prompt = `${PERSONA}
Create a detailed blog post outline for the digital marketing topic: "${topic}".
Include an introduction, 4-6 main sections each with 3 bullet-point sub-topics, and a conclusion with a CTA.
The content should be suitable for brand owners, entrepreneurs, and fellow marketers.
Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "title": "Suggested blog post title",
  "intro": "One sentence describing what the intro will cover",
  "sections": [
    { "heading": "Section Heading", "points": ["point 1", "point 2", "point 3"] }
  ],
  "conclusion": "One sentence describing the conclusion including a call-to-action"
}`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const outline = parseJsonFromText<{
        title: string;
        intro: string;
        sections: { heading: string; points: string[] }[];
        conclusion: string;
      }>(text);
      return res.status(200).json({ outline, modelUsed });
    }

    /* ─── 3. SEO optimizer ─── */
    if (action === 'seo') {
      const { title, description } = req.body as { title: string; description: string };
      if (!title?.trim()) return res.status(400).json({ error: '"title" is required.' });

      const prompt = `${PERSONA}
You are an SEO expert for digital marketing content. Given the post title "${title}" and description "${description || 'N/A'}", produce SEO-optimised copy targeting digital marketers and business owners.
Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "seoTitle": "SEO-optimized title (max 60 characters)",
  "metaDescription": "Compelling meta description with a CTA (max 155 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const seo = parseJsonFromText<{
        seoTitle: string;
        metaDescription: string;
        keywords: string[];
      }>(text);
      return res.status(200).json({ seo, modelUsed });
    }

    /* ─── 4. Suggest a reply to a blog comment ─── */
    if (action === 'suggest-reply') {
      const { comment, authorName } = req.body as { comment: string; authorName?: string };
      if (!comment?.trim()) return res.status(400).json({ error: '"comment" is required.' });

      const prompt = `${PERSONA}
A reader named "${authorName || 'someone'}" left the following comment on Malaika's digital marketing blog:

"${comment}"

Write a warm, professional, and genuine reply (2-3 sentences max) from Malaika. Acknowledge their point specifically, add a brief insight or value, and encourage further discussion. Do not use clichés like "Great comment!". Return ONLY the reply text, nothing else.`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const reply = text.trim();
      return res.status(200).json({ reply, modelUsed });
    }

    /* ─── 5. Social media caption generator ─── */
    if (action === 'social-caption') {
      const { platform, topic, tone, goal } = req.body as {
        platform: string;
        topic: string;
        tone: string;
        goal: string;
      };
      if (!platform?.trim() || !topic?.trim()) {
        return res.status(400).json({ error: '"platform" and "topic" are required.' });
      }

      const platformGuidelines: Record<string, string> = {
        Instagram: 'Engaging, visual-first. Use emojis naturally. 150-220 characters for the hook, then 2-3 lines of value, end with CTA. Include a "caption continues" break if needed.',
        Facebook: 'Conversational and story-driven. 3-5 sentences. Ask a question to drive comments. Minimal emojis.',
        LinkedIn: 'Professional and insightful. Start with a bold hook line. 3-5 short paragraphs with line breaks. Use relevant hashtags at end. No excessive emojis.',
        'Twitter/X': 'Punchy and direct. Max 280 characters. One key insight or question. 1-2 hashtags max.',
        TikTok: 'Energetic and casual. Hook in first line. 2-3 engaging sentences. Hashtags at end.',
      };

      const guideline = platformGuidelines[platform] || 'Write a clear, engaging social media post.';

      const prompt = `${PERSONA}
Write a ${platform} caption for the following:
- Topic: ${topic}
- Tone: ${tone || 'professional yet relatable'}
- Goal: ${goal || 'drive engagement'}

${platform} guidelines: ${guideline}

Return ONLY the caption text, ready to copy-paste. No explanations, no labels.`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const caption = text.trim();
      return res.status(200).json({ caption, modelUsed });
    }

    /* ─── 6. Ad copy generator ─── */
    if (action === 'ad-copy') {
      const { platform, objective, product, audience, usp } = req.body as {
        platform: string;
        objective: string;
        product: string;
        audience: string;
        usp: string;
      };
      if (!product?.trim()) return res.status(400).json({ error: '"product" is required.' });

      const prompt = `${PERSONA}
Write high-converting ad copy for the following campaign:
- Platform: ${platform || 'Meta (Facebook/Instagram)'}
- Objective: ${objective || 'Conversions'}
- Product/Service: ${product}
- Target Audience: ${audience || 'general audience'}
- Unique Selling Point: ${usp || 'not specified'}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "headline": "Primary headline (max 40 characters)",
  "primaryText": "Main ad body copy (2-3 sentences, engaging, benefit-focused)",
  "description": "Ad description or sub-headline (max 30 characters)",
  "cta": "Call-to-action button text (e.g. Shop Now, Learn More)",
  "hookVariants": ["Alternative hook 1", "Alternative hook 2", "Alternative hook 3"]
}`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const adCopy = parseJsonFromText<{
        headline: string;
        primaryText: string;
        description: string;
        cta: string;
        hookVariants: string[];
      }>(text);
      return res.status(200).json({ adCopy, modelUsed });
    }

    /* ─── 7. Hashtag generator ─── */
    if (action === 'hashtags') {
      const { topic, platform, niche } = req.body as {
        topic: string;
        platform: string;
        niche: string;
      };
      if (!topic?.trim()) return res.status(400).json({ error: '"topic" is required.' });

      const prompt = `${PERSONA}
Generate a strategic set of hashtags for a ${platform || 'Instagram'} post about: "${topic}".
Niche/Industry: ${niche || 'digital marketing, e-commerce, social media'}.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "highVolume": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "midVolume": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7"],
  "niche": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "branded": ["#MalaikaNisar", "#DigitalMarketing"]
}`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const hashtags = parseJsonFromText<{
        highVolume: string[];
        midVolume: string[];
        niche: string[];
        branded: string[];
      }>(text);
      return res.status(200).json({ hashtags, modelUsed });
    }

    /* ─── 8. Email newsletter builder ─── */
    if (action === 'email-newsletter') {
      const { subject, goal, keyPoints, audience } = req.body as {
        subject: string;
        goal: string;
        keyPoints: string;
        audience: string;
      };
      if (!subject?.trim()) return res.status(400).json({ error: '"subject" is required.' });

      const prompt = `${PERSONA}
Write a professional email newsletter based on the following brief:
- Subject: ${subject}
- Goal: ${goal || 'educate and engage subscribers'}
- Key points to cover: ${keyPoints || 'not specified'}
- Audience: ${audience || 'digital marketers and business owners'}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "subjectLine": "Optimised email subject line (with emoji if appropriate)",
  "preheader": "Preview text (max 100 characters)",
  "greeting": "Opening greeting line",
  "body": "Full email body (3-5 short paragraphs, conversational, value-driven)",
  "cta": "Primary call-to-action text",
  "signOff": "Sign-off line"
}`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const email = parseJsonFromText<{
        subjectLine: string;
        preheader: string;
        greeting: string;
        body: string;
        cta: string;
        signOff: string;
      }>(text);
      return res.status(200).json({ email, modelUsed });
    }

    /* ─── 9. Full blog writer ─── */
    if (action === 'write-blog') {
      const { title, tags, tone } = req.body as { title: string; tags?: string; tone?: string };
      if (!title?.trim()) return res.status(400).json({ error: '"title" is required.' });

      const prompt = `${PERSONA}
Write a complete, high-quality blog post with the title: "${title}"
${tags ? `Related tags/topics: ${tags}` : ''}
${tone ? `Writing tone: ${tone}` : 'Writing tone: professional, insightful, and actionable'}

The blog should be written for digital marketers, brand owners, and social media managers.

Requirements:
- Start with a compelling introduction that hooks the reader
- Include 4-6 main sections with clear headings (use ## for headings)
- Each section should have 2-4 paragraphs of substantive content
- Include practical tips, examples, and actionable advice
- Use bullet points or numbered lists where appropriate
- End with a strong conclusion and call-to-action
- Total length: 1500-2500 words
- Write in Markdown format

DO NOT include the title at the top (it will be added separately).
DO NOT include any footer or author bio (it will be added automatically).

Return ONLY the blog post content in Markdown format. No JSON wrapping.`;

      const { text, modelUsed } = await generateWithFallback(prompt, preferredModel);
      const blogContent = text.trim();
      const blogWithFooter = blogContent + BLOG_FOOTER;

      return res.status(200).json({ blogContent: blogWithFooter, modelUsed });
    }

    return res.status(400).json({ error: `Unknown action "${action}".` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[AI Generate]', message);

    if (message.includes('Quota exceeded') || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'All AI models have hit their quota limits. Please wait a few minutes and try again, or upgrade your Gemini API plan at ai.google.dev.',
      });
    }

    return res.status(500).json({ error: `Gemini API error: ${message}` });
  }
}

export default withAuth(handler);
