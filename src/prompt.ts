// Inspired from https://github.com/ollama-ui/ollama-ui/blob/main/api.js#L60

import * as vscode from 'vscode';
import axios from 'axios';

async function postRequest(data:any) {
        console.log(`data=${JSON.stringify(data)}`);
    return axios.post(`http://127.0.0.1:11434/api/generate`,data, {responseType: 'stream'})
    .catch(error => {
        console.log(`Failed to axios with ${error}, for data=${JSON.stringify(data)}`);
    });
  }

  // Function to stream the response from the server
async function getResponse(response:any) {
    let res = response.data
        .split("\n")
        .map((data:string) => {
            if (data) {
                try {
                    return JSON.parse(data);
                } catch (error) {
                    console.log(error);
                    console.log(data);
                    return undefined;
                }
            } else {
                    return undefined;
            }
        })
        .map((data:any) => data ? data.response : "");
        return res
        .reduce((accu:string,text:string) => text ? accu + text : accu ,"");
  }

  async function getResponseStream(response:any, callback:any) {
    const reader = response.body.getReader();
    let partialLine = '';
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Decode the received value and split by lines
      const textChunk = new TextDecoder().decode(value);
      const lines = (partialLine + textChunk).split('\n');
      partialLine = lines.pop() || ""; // The last line might be incomplete
  
      for (const line of lines) {
        if (line.trim() === '') {continue;}
        const parsedResponse = JSON.parse(line);
        callback(parsedResponse); // Process each response word
      }
    }
  
    // Handle any remaining line
    if (partialLine.trim() !== '') {
      const parsedResponse = JSON.parse(partialLine);
      callback(parsedResponse);
    }
  }

export async function submit(model:string,prompt:string) : Promise<string> {
    const data = { 
      model,
      prompt,
      stream:true,
      raw : true
    };

    let response = await postRequest(data);
    return new Promise((resolve,reject) => {


    if (!response) {
        console.log("");
        return "";
    }

    const stream = response.data;

    let partialLine = '';
    let results = "";
    stream.on('data', (data:any) => {
        const textChunk = new TextDecoder().decode(data);
        const lines = (partialLine + textChunk).split('\n');
        partialLine = lines.pop() || ""; // The last line might be incomplete
        //console.log(data);
        for (const line of lines) {
            if (line.trim() === '') {continue;}
            const parsedResponse = JSON.parse(line);
            results = results + parsedResponse.response;

        }
    });

    stream.on('end', () => {
        if (partialLine.trim() !== '') {
            const parsedResponse = JSON.parse(partialLine);
            results = results + parsedResponse.response;
        }
        console.log("stream done");
        console.log(results);
    resolve(results);
    });

    });
}

export async function submitStream(model:string,prompt:string, onText:any) {
  const data = { 
    model,
    prompt,
    stream:true,
    raw : true
  };

  let response = await postRequest(data);
  const stream = response!.data;

  let partialLine = '';
  stream.on('data', (data:any) => {
      const textChunk = new TextDecoder().decode(data);
      const lines = (partialLine + textChunk).split('\n');
      partialLine = lines.pop() || ""; // The last line might be incomplete
      //console.log(data);
      for (const line of lines) {
          if (line.trim() === '') {continue;}
          const parsedResponse = JSON.parse(line);
          onText(parsedResponse.response);
      }
  });

  stream.on('end', () => {
      if (partialLine.trim() !== '') {
          const parsedResponse = JSON.parse(partialLine);
          onText(parsedResponse.response);
      }
      console.log("stream done");
  });

}