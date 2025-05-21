import fetch from 'node-fetch';
import * as vscode from 'vscode';

interface GPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateWithGPT(prompt: string): Promise<string> {
  const config = vscode.workspace.getConfiguration('commitMaid');
  const apiKey = config.get<string>('openaiApiKey');
  const model = config.get<string>('model', 'gpt-3.5-turbo');

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set it in settings.');
  }

  const messages: GPTMessage[] = [
    {
      role: 'system',
      content: 'You are an AI assistant that helps generate meaningful Git commit messages.'
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 100
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GPT API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}