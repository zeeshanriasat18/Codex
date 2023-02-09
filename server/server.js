import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
// openApi wrappers
import { Configuration, OpenAIApi } from 'openai'

// to use dotenv variables
dotenv.config()

console.log(process.env.OPENAI_API_KEY)

// setting configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

const app = express()
//Middleware allow us to make corss-origin requests => allow us to call server form the front end
app.use(cors())
//Middleware help to pass json from frontend to backend
app.use(express.json()) 

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    //openAi function
    const response = await openai.createCompletion({
      //code model capable of generating code
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // repeatiton of similar sentences
      presence_penalty: 0, // talks about other topics
    });

    //sending data back to frontend
    res.status(200).send({
    // (Q) => GPT => (A) => gpt gets multiple answer in context of one
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))