import '../styles/Recommendation.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
function Recommendations() {
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');
  var flag = 0;
  async function getData() {
    if (flag !== 0) {
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
            max_tokens: 128,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer <key_here>`,
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
  }

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, []);

  return (
    <div className='recommendation-div' style={{ overflow: 'hidden' }}>
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20age%2020s%20using%20black%20tshirt%20model'
      />
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20in%20his%2020s%20using%20rolex%20watch%20model'
      />
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20%20american%20man%20age%2020%20using%20hp%20laptop'
      />{' '}
    </div>
  );
}

export default Recommendations;
