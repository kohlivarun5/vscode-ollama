// Inspired from https://github.com/ollama-ui/ollama-ui/blob/main/api.js#L60

import * as vscode from 'vscode';
import axios from 'axios';

async function postRequest(data:any) {
    return axios.post(`http://127.0.0.1:11434/api/generate`,data)
    .catch(error => {
        console.log(`Failed to axios with ${error}, for data=${JSON.stringify(data)}`);
    })
  }

  // Function to stream the response from the server
async function getResponse(response:any) {
    let res = response.data
        .split("\n")
        .map((data:string) => {
            if (data) {
                try {
                    return JSON.parse(data)
                } catch (error) {
                    console.log(error)
                    console.log(data)
                    return undefined;
                }
            } else {
                    return undefined;
            }
        })
        .map((data:any) => data ? data.response : "")
        return res
        .reduce((accu:string,text:string) => text ? accu + text : accu ,"");
  }

export async function submit(model:string,prompt:string) {
    const context : Array<Number> = []; 
    const data = { model, prompt: `Finish this code:${prompt}`, context};
    return postRequest(data)
    .then(getResponse)
      .catch(error => {
        console.error(error);
        return undefined;
      });
}
