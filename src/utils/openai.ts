
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "",
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
