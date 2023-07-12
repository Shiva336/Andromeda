import '../styles/Recommendation.css';
// import axios from 'axios';
// import { useEffect } from 'react';

function Recommendations() {
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
      />
    </div>
  );
}

export default Recommendations;

/*
  async function getData() {
    const options = {
      method: 'POST',
      url: 'https://openai80.p.rapidapi.com/chat/completions',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '51494e2018mshea07d648334dbd1p187269jsn1a609db27914',
        'X-RapidAPI-Host': 'openai80.p.rapidapi.com',
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content:
              'Write me a catchy and short caption for an ad of a rolex watch',
          },
        ],
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    (async () => {
      await getData();
    })();
    return () => {};
  }, []);
  */
