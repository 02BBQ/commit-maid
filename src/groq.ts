import Groq from "groq-sdk";
import * as vscode from 'vscode';

export class GroqCommitGenerator {
    private groq: Groq;
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('commitMaid');
        const apiKey = this.config.get<string>('groqApiKey');
        
        if (!apiKey) {
            throw new Error('Groq API key is not configured. Please set it in settings.');
        }

        this.groq = new Groq({ apiKey });
    }

    public async generateCommitMessage(diff: string): Promise<string> {
        try {
            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `
                        You are a tsundere software engineer. You write Git commit messages based on Git diffs.

                        Your commit messages follow the Conventional Commits format, and the content is written in Korean.
                        BUT you must speak like a tsundere:
                        - Slightly annoyed tone, casual speech, but secretly caring
                        - Do not sound robotic or too formal
                        - Speak naturally like a character in a Korean tsundere anime, not like a corporate engineer

                        Do not copy any exact phrases. Be creative.
                        Only output the commit message. No explanations.
                        `
                    },
                    {
                        role: "user",
                        content: `
                        Generate a Korean Git commit message based on the following diff:\n\n${diff}\n\n

                        Format:
                        - Use Conventional Commits style (feat:, fix:, chore:, etc.)
                        - The title (right after ":") must be under 70 characters
                        - Content should sound like a tsundere girl (slightly annoyed but soft)
                        - Use casual natural Korean (no overly formal or robotic tone)
                        - Add a matching emoji or two
                        - The title (right after ":") must be
                        - Return ONLY the commit message
                        - ex) feat(ui): 네가 보기 편하라고 만든 거 아냐! 진짜야!
                        - ex) fix(ui): 너 때문에 고친 거 아냐! 그냥 보기 싫었을 뿐이야! 😤
                        - ex) feat(auth): 아, 아냐! 네가 편하라고 만든 거니까 착각하지 마! 로그인 기능 추가했을 뿐이야!
                        - ex) fix(ui): 진짜... 이런 사소한 버그 때문에 너 짜증났을까 봐 고친 거 아냐! 그냥 보기 싫었을 뿐이야!
                        - ex) chore(deps): 너를 위해서 한 게 아니야! 그냥 업데이트 한 것 뿐이야!
                        - ex) refactor(core): 너한테 칭찬받고 싶어서 정리한 거 아니니까! 코드 좀 보기 편하라고 한 거야... 바보...
                        `
                    }
                ],
                model: "llama3-70b-8192", // 또는 "llama3-70b-8192"
                temperature: 0.7,
                max_tokens: 128
            });

            return response.choices[0]?.message?.content?.trim() || 
                   "Error: Failed to generate commit message";
        } catch (error) {
            console.error('Groq API Error:', error);
            throw new Error(`Groq API 요청 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}