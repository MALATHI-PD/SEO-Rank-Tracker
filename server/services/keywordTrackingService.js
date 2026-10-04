import KeywordTracking from "../models/keywordTracking.js";
import { rankTracker } from "./rankTrackerService.js";

// Check the ranking of one keyword
export const keywordTracking = async (trackingId) => {
    try {
        const tracking = await KeywordTracking.findById(trackingId);

        if (!tracking) {
            throw new Error("Keyword tracking not found");
        }

        console.log(
            `Checking keyword: "${tracking.keyword}" for ${tracking.domain}`
        );

        // Mark as checking
        tracking.status = "checking";
        await tracking.save();

        // Get Google ranking from SerpApi
        const result = await rankTracker(
            tracking.keyword,
            tracking.url
        );

        if (!result.success) {
            tracking.status = "error";
            tracking.lastChecked = new Date();

            await tracking.save();

            console.error(
                `Rank check failed: ${result.error}`
            );

            return {
                success: false,
                error: result.error
            };
        }

        const data = result.data;

        const newPosition = data.position;

        // Store previous position before updating
        const previousPosition = tracking.currentPosition;

        // Update current position
        tracking.currentPosition = newPosition;

        // Calculate position change
        //
        // Example:
        // Previous = 5
        // Current = 4
        // Change = +1 (improved)
        //
        // Previous = 4
        // Current = 7
        // Change = -3 (dropped)
        if (
            previousPosition !== null &&
            previousPosition !== undefined &&
            newPosition !== null &&
            newPosition !== undefined
        ) {
            tracking.positionChange =
                previousPosition - newPosition;
        } else {
            tracking.positionChange = 0;
        }

        // Update BEST position
        //
        // Smaller number means better rank.
        //
        // Example:
        // Best = 5
        // New = 4
        // Best becomes 4.
        //
        // Best = 4
        // New = 6
        // Best stays 4.
        if (newPosition !== null && newPosition !== undefined) {
            if (
                tracking.bestPosition === null ||
                tracking.bestPosition === undefined ||
                newPosition < tracking.bestPosition
            ) {
                tracking.bestPosition = newPosition;
            }
        }

        // Update current page
        tracking.currentPage = data.page;

        // Update competitors
        tracking.competitors = data.competitors || [];

        // Add rank history
        tracking.rankHistory.push({
            date: new Date(),
            position: newPosition,
            page: data.page,
            title: data.title || "",
            snippet: data.snippet || ""
        });

        // Keep only last 30 history records
        if (tracking.rankHistory.length > 30) {
            tracking.rankHistory =
                tracking.rankHistory.slice(-30);
        }

        // Update last checked time
        tracking.lastChecked = new Date();

        // Mark completed
        tracking.status = "completed";

        await tracking.save();

        console.log(
            `Keyword "${tracking.keyword}" updated successfully`
        );

        console.log(
            `Current Position: ${tracking.currentPosition}`
        );

        console.log(
            `Best Position: ${tracking.bestPosition}`
        );

        console.log(
            `Competitors: ${tracking.competitors.length}`
        );

        return {
            success: true,
            tracking
        };

    } catch (error) {
        console.error(
            "Keyword tracking error:",
            error.message
        );

        try {
            const tracking = await KeywordTracking.findById(trackingId);

            if (tracking) {
                tracking.status = "error";
                tracking.lastChecked = new Date();
                await tracking.save();
            }
        } catch (saveError) {
            console.error(
                "Error updating tracking status:",
                saveError.message
            );
        }

        return {
            success: false,
            error: error.message
        };
    }
};

