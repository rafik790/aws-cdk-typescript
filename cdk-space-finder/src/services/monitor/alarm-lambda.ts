import {Context, SNSEvent } from "aws-lambda";
const webHookUrl = 'https://hooks.slack.com/services/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';

async function handler(event:SNSEvent,context: Context){
    for (const record of event.Records) {
        await fetch(webHookUrl, {
            method: 'POST',
            body: JSON.stringify({
                "text": `${record.Sns.Message}`
            })
        })
    }
   
}
export {handler};