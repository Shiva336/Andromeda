import '../styles/Recommendation.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../api';
function Recommendations() {
  const currUser = localStorage.getItem('loggedUser');
  var userDetails = {};
  var prompt1, caption1='';
  const [count,setCount]=useState(0);
  const [generatedCaption,setGeneratedCaption] = useState("");
  async function getData() {
    
    
  }
  useEffect(() => {
    (async () => {
      setCount(1);
    try {
      let data = {
        name: currUser,
      };
      const response = await api.post(`/user/search-by-name`, data);
      if (response.data.name === data.name) {
        userDetails = {
          nationality: response.data.nationality,
          gender: response.data.gender,
          age: response.data.age,
        };
      }
    } catch (error) {
      console.log(error);
      return;
    }

    //***sk-gzV2c5wQPD***fcIa2zQxy5T3B***lbkFJMJiwFeRGa4IuQynppV9F***
    const apiKey = '';
    var flag=false
    if(flag===true){
      try {
        var age = userDetails.age;
        var nationality = userDetails.nationality;
        var gender = userDetails.gender;
        if (gender === 'Male') {
          if (age < 20) gender = 'boy';
          else gender = 'man';
        }
        if (gender === 'Female') {
          if (age < 20) gender = 'girl';
          else gender = 'lady';
        }
        prompt1 =
          'Create a catchy caption of 7 words for an advertisement for a t-shirt used by ' +
          nationality +
          ' ' +
          gender +
          ' of age ' +
          age;

        console.log(prompt1);
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant.',
              },
              {
                role: 'user',
                content: prompt1,
              },
            ],
            temperature: 0.8,
            max_tokens: 30,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        setGeneratedCaption(response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error generating caption:', error);
      }
    }}  )();
  }, []);

  return (
    <div className='recmmendation-div'>{count===1&&(
      <>
      <div className='rec-img-div'>
        <div className='rec-1 all-recs'>
          <img
            alt='test'
            src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20sexy%20man%20age%2020s%20using%20black%20tshirt%20model'
            width='96%'
          />
          <div className='all-captions caption-1'>
           {generatedCaption}
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
      </>
    )}
    </div>
  );
}

export default Recommendations;
