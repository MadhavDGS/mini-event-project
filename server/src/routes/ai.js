import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// gemini ai to enhance description
router.post('/enhance', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'title and description required' });
    }
   
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `make this event description more engaging and professional. Keep it 1-2 paragraphs max. and just return only the description and nothing else top or bottom nothing
    
Event Title: ${title}
Current Description: ${description}

Enhanced Description:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text();
    
    res.json({ enhancedDescription: enhancedText });
  } catch (error) {
    // if fails just send back original
    res.json({ 
      enhancedDescription: req.body.description,
      message: 'ai enhancement unavailable, using original description'
    });
  }
});

export default router;
