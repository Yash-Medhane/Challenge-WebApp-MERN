import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://192.168.37.86:5000/send', { email, message, category });
      setResponse(res.data.message || 'Thank you! Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-10 lg:relative lg:top-6 rounded-3xl' id='contact'>
      <h2 className='text-5xl font-bold mb-6 text-center text-blue-800'>Contact Us</h2>
      <div className='lg:flex justify-between items-center'>

        {/* Contact Form */}
        <div className='lg:flex lg:justify-around w-full lg:w-1/2 mx-auto'>
          <div className='w-full lg:w-2/3'>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className='flex flex-col'>
                <label htmlFor='email' className='font-semibold text-slate-400'>Email Address</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  className='border-2 border-blue-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Category Selection */}
              <div className='flex flex-col'>
                <label htmlFor='category' className='font-semibold text-slate-400'>Message Category</label>
                <select
                  id='category'
                  name='category'
                  className='border-2 border-blue-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value='General'>General Inquiry</option>
                  <option value='Bug'>Bug Report</option>
                  <option value='Feature'>Feature Request</option>
                </select>
              </div>

              {/* Message Input */}
              <div className='flex flex-col'>
                <label htmlFor='message' className='font-semibold text-slate-400'>Message</label>
                <textarea
                  id='message'
                  name='message'
                  rows='4'
                  className='border-2 border-blue-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className={`bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>

            {/* Response Message */}
            {response && <p className='mt-4 text-center text-2xl text-blue-800'>{response}</p>}
          </div>
        </div>

      </div>

      {/* Developer Contact Section */}
      <div className='mt-6'>
        <p className='text-center text-lg text-slate-200'>
          Facing issues or have suggestions? Contact the developer.
        </p>
      </div>
    </div>
  );
};

export default ContactForm;
