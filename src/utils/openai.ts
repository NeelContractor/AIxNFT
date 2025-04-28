
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export default async function handler(prompt: string): Promise<string | undefined> {

  if (!prompt) {
    throw new Error("Prompt is required");
  }

//   try {
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024"
    });

    const imageUrl = image.data[0].url;
    console.log("image: ", imageUrl);
    return imageUrl;
    
//   } catch (error) {
//     console.error("OpenAI Error:", error);
//     return
//   }
}
