
import { getJson } from "serpapi";

// Search Google using SerpApi and find the ranking of a target domain
export async function rankTracker(keyword, targetDomain) {
    try {
        const apiKey = process.env.SERPAPI_API_KEY;

        if (!apiKey) {
            throw new Error("SERPAPI_API_KEY is not configured in .env");
        }

        // Clean target domain
        const cleanTarget = targetDomain
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0]
            .toLowerCase()
            .trim();

        console.log(`Searching Google for keyword: "${keyword}"`);
        console.log(`Target domain: "${cleanTarget}"`);

        // Search Google through SerpApi
        const response = await getJson({
            engine: "google",
            api_key: apiKey,
            q: keyword,
            location: "United States",
            google_domain: "google.com",
            hl: "en",
            gl: "us",
            num: 100
        });

        if (response.error) {
            throw new Error(response.error);
        }

        const organicResults = response.organic_results || [];

        console.log(`Organic results found: ${organicResults.length}`);

        const allResults = [];
        let found = null;

        for (const result of organicResults) {
            if (!result.link) continue;

            const url = result.link;

            let domain;

            try {
                domain = new URL(url)
                    .hostname
                    .replace(/^www\./, "")
                    .toLowerCase();
            } catch {
                continue;
            }

            const position =
                result.position || allResults.length + 1;

            const item = {
                position,
                url,
                domain,
                title: result.title || "",
                snippet: result.snippet || ""
            };

            allResults.push(item);

            // Check whether this is our target website
            if (
                !found &&
                (
                    domain === cleanTarget ||
                    domain.endsWith("." + cleanTarget) ||
                    cleanTarget.endsWith("." + domain)
                )
            ) {
                found = item;
            }
        }

        // Get competitors
        const competitors = allResults
            .filter((result) => {
                return !(
                    result.domain === cleanTarget ||
                    result.domain.endsWith("." + cleanTarget) ||
                    cleanTarget.endsWith("." + result.domain)
                );
            })
            .slice(0, 10);

        if (found) {
            console.log(`Ranking found: #${found.position}`);
        } else {
            console.log("Target domain not found in Google results");
        }

        return {
            success: true,

            data: {
                keyword,
                targetDomain,

                position: found ? found.position : null,

                page: found
                    ? Math.ceil(found.position / 10)
                    : null,

                title: found?.title || "",

                snippet: found?.snippet || "",

                competitors,

                totalResultsScanned: allResults.length
            }
        };

    } catch (error) {
        console.error("Rank check error:", error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

