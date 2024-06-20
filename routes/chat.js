const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../helpers/googleGenerativeAI');

router.post('/chat', async (req, res) => { 
  const { message } = req.body;
  console.log({message})
  try {
    const aiResponse = await getAIResponse(message);
    res.json({ reply: aiResponse });
    console.log(aiResponse)
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process the message' });
  }
});

module.exports = router;
