import '../styles/Recommendation.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
function Recommendations() {
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');
  async function getData() {
    const apiKey = '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';

    try {
      setPrompt(
        'Create a catchy caption (of 6 words) for an ad for a t-shirt used by american man age 20'
      );
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 1,
          max_tokens: 256,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const generatedCaption = response.data.choices[0].message.content;
      setCaption(generatedCaption);
      console.log(caption);
    } catch (error) {
      console.error('Error generating caption:', error);
    }
  }

  return (
    <div className='recmmendation-div'>
      <div className='rec-img-div'>
        <div className='rec-1 all-recs'>
          <img
            alt='test'
            src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20sexy%20man%20age%2020s%20using%20black%20tshirt%20model'
            width='96%'
          />
          <div className='all-captions caption-1'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            vel.
          </div>
        </div>
        <div className='rec-2 all-recs'>
          <img
            alt='test'
            src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20in%20his%2020s%20using%20rolex%20watch%20model'
            width='96%'
          />
          <div className='all-captions caption-2'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            vel.
          </div>
        </div>
        <div className='rec-3 all-recs'>
          <img
            alt='test'
            src='http://image.pollinations.ai/prompt/image%20of%20%20american%20man%20age%2020%20using%20hp%20laptop'
            width='96%'
          />
          <div className='all-captions caption-3'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            vel.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
