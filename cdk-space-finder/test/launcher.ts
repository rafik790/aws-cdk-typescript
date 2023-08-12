import { handler } from "../src/services/spaces/space-lambda"

handler({
    httpMethod:'POST',
    body: JSON.stringify({
        location:'Noida'
    })
} as any,{} as any);