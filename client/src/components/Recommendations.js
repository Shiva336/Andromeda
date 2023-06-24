import '../styles/Recommendation.css';

const Recommendations = () => {
  return (
    <div className='recommendation-div' style={{ overflow: 'hidden' }}>
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20in%20his%2020s%20wearing%20black%20tshirt%20model'
      />
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20in%20his%2020s%20wearing%20rolex%20watch%20model'
      />
      <img
        alt='test'
        src='http://image.pollinations.ai/prompt/image%20of%20an%20american%20man%20in%20his%2020s%20running%20in%20park%20with%20nike%20shoes'
      />
    </div>
  );
};

export default Recommendations;
