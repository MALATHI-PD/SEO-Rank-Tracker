
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const seoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER
        },

        categories: {
            type: Type.OBJECT,
            properties: {
                seo: {
                    type: Type.INTEGER
                },
                performance: {
                    type: Type.INTEGER
                },
                accessibility: {
                    type: Type.INTEGER
                },
                bestPractices: {
                    type: Type.INTEGER
                }
            },
            required: [
                "seo",
                "performance",
                "accessibility",
                "bestPractices"
            ]
        },

        keywords: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: {
                        type: Type.STRING
                    },
                    count: {
                        type: Type.INTEGER
                    },
                    density: {
                        type: Type.NUMBER
                    }
                },
                required: [
                    "word",
                    "count",
                    "density"
                ]
            }
        },

        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: {
                        type: Type.STRING,
                        enum: [
                            "critical",
                            "warning",
                            "info"
                        ]
                    },

                    category: {
                        type: Type.STRING
                    },

                    message: {
                        type: Type.STRING
                    },

                    recommendation: {
                        type: Type.STRING
                    }
                },
                required: [
                    "severity",
                    "category",
                    "message",
                    "recommendation"
                ]
            }
        }
    },

    required: [
        "overallScore",
        "categories",
        "keywords",
        "issues"
    ]
};


export async function anlyzeSeoData(scrapedData) {

    try {

        const prompt = `
You are an expert SEO analyst.

Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${scrapedData.url}

Load Time: ${scrapedData.loadTime}ms
Status Code: ${scrapedData.statusCode}
Page Size: ${Math.round(scrapedData.pageSize / 1024)}KB
Word Count: ${scrapedData.wordCount}

META DATA:
- Title: "${scrapedData.metaData.title}" (${scrapedData.metaData.title.length} chars)
- Description: "${scrapedData.metaData.description}" (${scrapedData.metaData.description.length} chars)
- Canonical: "${scrapedData.metaData.canonical}"
- Robots: "${scrapedData.metaData.robots}"
- OG Title: "${scrapedData.metaData.ogTitle}"
- OG Description: "${scrapedData.metaData.ogDescription}"
- OG Image: "${scrapedData.metaData.ogImage}"
- Twitter Card: "${scrapedData.metaData.twitterCard}"
- Viewport: "${scrapedData.metaData.viewport}"
- Charset: "${scrapedData.metaData.charset}"

HEADINGS:
- H1: ${scrapedData.headings.h1}
  Texts: ${JSON.stringify(scrapedData.headings.h1Texts)}

- H2: ${scrapedData.headings.h2}
- H3: ${scrapedData.headings.h3}
- H4: ${scrapedData.headings.h4}
- H5: ${scrapedData.headings.h5}
- H6: ${scrapedData.headings.h6}

LINKS:
- Internal: ${scrapedData.links.internal}
- External: ${scrapedData.links.external}
- Total: ${scrapedData.links.total}

IMAGES:
- Total: ${scrapedData.images.total}
- Missing Alt Text: ${scrapedData.images.missingAlt}
- With Alt Text: ${scrapedData.images.withAlt}

PAGE CONTENT (first 3000 chars):
${scrapedData.bodyText}

SCORING GUIDELINES:

- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s okay, >5s poor
- Page size: <3MB good
- Must have viewport meta
- Must have charset
- Must have canonical
- OG tags are important
- Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Severity levels must be exactly one of:

"critical"
"warning"
"info"

Provide 5-15 issues sorted by severity.

Critical issues should come first.

Be specific and actionable with recommendations.

Extract the top 10 keywords by frequency from the page content.
`;

        let response = null;

        // Retry ONLY temporary 503 errors
        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                console.log(
                    `Gemini analysis attempt ${attempt}/3`
                );

                response = await ai.models.generateContent({

                    model: "gemini-3.8-flash",

                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],

                    config: {
                        responseMimeType: "application/json",
                        responseSchema: seoAnalysisSchema
                    }
                });

                console.log(
                    "Gemini analysis successful"
                );

                break;

            } catch (error) {

                const errorMessage =
                    error?.message || "";

                console.error(
                    `Gemini attempt ${attempt} failed:`,
                    errorMessage
                );

                // 429 = quota exceeded
                // DO NOT retry
                if (
                    errorMessage.includes("429") ||
                    errorMessage.includes("RESOURCE_EXHAUSTED")
                ) {

                    console.error(
                        "Gemini quota exceeded. Stopping without retry."
                    );

                    throw error;
                }

                // 404 = model not available
                // DO NOT retry
                if (
                    errorMessage.includes("404") ||
                    errorMessage.includes("NOT_FOUND")
                ) {

                    console.error(
                        "Gemini model not found. Stopping without retry."
                    );

                    throw error;
                }

                // 503 = temporary server problem
                // Retry only this error
                if (
                    errorMessage.includes("503") ||
                    errorMessage.includes("UNAVAILABLE")
                ) {

                    if (attempt === 3) {

                        console.error(
                            "Gemini failed after 3 attempts."
                        );

                        throw error;
                    }

                    const delay = attempt * 2000;

                    console.log(
                        `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
                    );

                    await new Promise(resolve =>
                        setTimeout(resolve, delay)
                    );

                    continue;
                }

                // Any other error
                // DO NOT retry
                console.error(
                    "Unexpected Gemini error. Stopping without retry."
                );

                throw error;
            }
        }

        if (!response) {

            throw new Error(
                "Gemini did not return a response"
            );
        }

        const analysis = JSON.parse(
            response.text
        );

        return {
            success: true,
            data: analysis
        };

    } catch (error) {

        console.error(
            "Gemini analysis error:",
            error.message
        );

        return {
            success: false,
            error: error.message
        };
    }
}
