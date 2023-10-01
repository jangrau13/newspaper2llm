import React, { useState, useMemo, useRef } from 'react'
import TinderCard from 'react-tinder-card'
import axios from 'axios'


function Question (props) {

  const { questions } = props;
  const db = questions;
  const [currentIndex, setCurrentIndex] = useState(db.length - 1)
  const [lastDirection, setLastDirection] = useState()
  const [article, setArticle] = useState()
  const [prompt, setPrompt] = useState({})
  const [textareaValue, setTextareaValue] = useState('');
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex)


  async function callSupabaseFunction() {
    console.log('base prompt', prompt)
    try {
      const apiUrl = 'https://ukvxwzlvngifhtrxcjzo.supabase.co/functions/v1/helloai';
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdnh3emx2bmdpZmh0cnhjanpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYwMDUxNTIsImV4cCI6MjAxMTU4MTE1Mn0.3dTRGw8tNa0-ghr8pe6RMNudyoMkEkm0uI9tVRa6whM'; // Replace with your Supabase access token
      const data = {
        name: 'Functions',
        text: 'You are a local newspaper journalist. Write an newspaper article based on the following questions: ' + createZipStringFromObjectValues(prompt)
      };
  
      const response = await axios.post(apiUrl, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Handle the response as needed
      console.log('Response:', response.data);
      setArticle(response.data)
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
    }
  }

  const clearScreen = currentIndex === -1

  const childRefs = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  )

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canGoBack = currentIndex < db.length - 1

  const canSwipe = currentIndex >= 0

  function createZipStringFromObjectValues(obj) {
    // Get an array of the object's values
    const values = Object.values(obj);
  
    // Use the Array.prototype.map() method to transform each value
    // into a string representation and concatenate them with a space
    const zipString = values.map(value => String(value)).join('; ');
  
    return zipString;
  }

  // set last direction and decrease current index
  const swiped = (direction, nameToDelete, index) => {
    setLastDirection(direction)
    updateCurrentIndex(index - 1)
    setPrompt((prevState) => {
      const question_and_answer = 'question: ' + nameToDelete + '; answer: ' + textareaValue
      console.log('adding to prompt: ', question_and_answer)
      return {...prevState, [nameToDelete]: question_and_answer}
    })
    setTextareaValue('')
  }

  const outOfFrame = (question, idx) => {
    console.log(`${question} (${idx}) left the screen!`, currentIndexRef.current)

    
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard()
  }

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current.swipe(dir) // Swipe the card!
    }
  }

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return
    const newIndex = currentIndex + 1
    updateCurrentIndex(newIndex)
    await childRefs[newIndex].current.restoreCard()
  }


  return (
    <div>
      <h1>Newspaper2LLM</h1>
      <h2>Please answer the following questions</h2>
      {clearScreen ? <>
      <h3>Title of generated article</h3>
      <div class="article">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        </div></> : 
        <div className='cardContainer'>
        {db.map((question, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='swipe'
            key={question.id}
            onSwipe={(dir) => swiped(dir, question.question, index)}
            onCardLeftScreen={() => outOfFrame(question.question, index)}
          >
            <div
              className='card'
            >
              <h3>{question.question}</h3>
              <textarea
                id={"story" + question.id}
                name="story"
                rows="5"
                cols="33"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)} 
        />
            </div>
          </TinderCard>
        ))}
      </div>
        
        }
      
      <div className='buttons'>
        <button style={{ backgroundColor:  '#c3c4d3' }} onClick={() => callSupabaseFunction()}>call ChatGPT now</button>
        <button style={{ backgroundColor: !canGoBack && '#c3c4d3' }} onClick={() => goBack()}>undo</button>
        <button style={{ backgroundColor: !canSwipe && '#c3c4d3' }} onClick={() => swipe('right')}>answered</button>
      </div>
      <div>{article}</div>
    </div>
  )
}

export default Question