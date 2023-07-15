import '../styles/Recommendation.css';
import axios from 'axios';
import { useEffect } from 'react';

function Recommendations() {
  async function getData() {
    const options = {
      method: 'POST',
      url: 'https://openai80.p.rapidapi.com/chat/completions',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '68ab718cb8msh84651a74857f9a7p17a609jsn475758353616',
        'X-RapidAPI-Host': 'openai80.p.rapidapi.com'
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Generate a short and catchy caption for an advertisement of a black tshirt for a teenager'
          }
        ]
      }
    };
    
    try {
      const response = await axios.request(options);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
      }
      useEffect(() => {
       getData();    
      }, []);

  return (
    <div className='recommendation-div' style={{ overflow: 'hidden' }}>
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20sexy%20man%20age%2020s%20using%20black%20tshirt%20model'
      />
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20in%20his%2020s%20using%20rolex%20watch%20model'
      />
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20%20american%20man%20age%2020%20using%20hp%20laptop'
      />
    </div>
  );
}

export default Recommendations;

  
  
