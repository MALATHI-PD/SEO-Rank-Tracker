import Analysis from "../models/Analysis.js"
import { anlyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/scraperService.js";

//analyze a url
export const analyzeUrl = async(req, res) => {
    try {
        const {url} = req.body;

        if(!url) return res.status(400).json({success: false, message: "URL is required"});

        //validate URL format
        let validUrl;
        try {
            validUrl = new URL(url.startsWith("http") ? url: `https://${url}`);
            
        } catch (error) {
            return res.status(400).json({success: false, message: "Invalid URL format"}); 
        }

        //create analysis record with pending status
        const analysis = await Analysis.create({userId: req.userId, url: validUrl.href, status: "processing"});

        //send immediate response with analysis ID
        res.json({success: true, message: "Analysis started", analysisId: analysis._id})

        //run scraping and analysis in background
        try {
            //step1: scrape the url with browserbase
             const scrapeResult = await scrapeUrl(validUrl.href)

        if(!scrapeResult.success){
            analysis.status = "failed";
            await analysis.save();
            return;
        }
          
        //step2: analyze with gemini ai
        const aiResult = await anlyzeSeoData(scrapeResult.data)
        if(!aiResult.success){
            analysis.status = "failed";
            await analysis.save()
            return;
        }

        //step3: save results
        analysis.overallScore = aiResult.data.overallScore || 0;
        analysis.categories = aiResult.data.categories || {};
        analysis.metadata = scrapeResult.data.metaData || {};
        analysis.headings = scrapeResult.data.headings || {};
        analysis.links = scrapeResult.data.links || {};
        analysis.images = scrapeResult.data.images || {};
        analysis.keywords = aiResult.data.keywords || [];
        analysis.issues = aiResult.data.issues || [];
        analysis.loadTime = scrapeResult.data.loadTime || 0;
        analysis.pageSize = scrapeResult.data.pageSize || 0;
        analysis.wordCount = scrapeResult.data.wordCount || 0;
        analysis.status = "completed";

        await analysis.save();

            
        } catch (bgError) {
            console.error("Background analysis error:", bgError.message);
            try {
                analysis.status = "failed";
                await analysis.save()
                
            } catch (saveError) {
                console.error("Failed to dave failed status:", saveError.message);
                
            }
            
        }
        
    } catch (error) {
        console.error("Analyze URL error:", error.message);
        if(!res.headersSent){
            res.status(500).json({success: false, message: "Server error"})
        }
        
    }
}

//get analysis by id
export const getAnalysis = async(req, res) => {
    try {
        const analysis = await Analysis.findOne({_id: req.params.id, userId: req.userId})

        if(!analysis) return res.status(404).json({success: false, message: "Analysis not found"});

        res.json({success: true, analysis});
        
    } catch (error) {
        console.error("Get analysis error:", error.message);
        res.status(500).json({success: false, message: "Server error"});
        
    }

}

//get all analyses for user
export const getAnalyses = async(req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const analyses = await Analysis.find({userId: req.userId}).sort({createdAt: -1}).skip(skip).limit(limit).select("-issues -keywords");
        const total = await Analysis.countDocuments({userId: req.userId})

        res.json({success: true, analyses, pagination: {page, limit, total, pages: Math.ceil(total / limit)}});
        
    } catch (error) {
        console.error("Get analyses error:", error.message);
        res.status(500).json({success: false, message: "Server error"});
        
    }
    
}

//delete analysis
export const deleteAnalysis = async(req, res) => {
     try {
         const deleted = await Analysis.findByIdAndDelete({_id: req.params.id, userId: req.userId});
         if(!deleted) return res.status(404).json({success: false, message: "Analysis not found"});

         res.json({success: true, message: "Analysis deleted"});
        
    } catch (error) {
        console.error("Delete analysis error:", error.message);
        res.status(500).json({success: false, message: "Server error"});
        
    }

}