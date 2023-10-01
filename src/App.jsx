import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Question from "./Questions/Question"
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const App = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    getQuestions();
  }, []);

  async function getQuestions() {
    const { data } = await supabase
      .from("Questions")
      .select(`
          id, 
          question, 
          EventTypes ( id, name )
        `)
      .eq('EventTypes.name', 'Soccer');
    setQuestions(data.filter(row => row.EventTypes));
  }
  if(questions.length > 0){
    return (
      <>
            <Question questions={questions}></Question>
      </>
  );
    }else{
      <div>loading</div>
  }
 
}

export default App;