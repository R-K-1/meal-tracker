import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWSXRay from 'aws-xray-sdk'

const logger = createLogger('auth')

const XAWS = AWSXRay.captureAWS(AWS)

const XS3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.MEAL_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const mealId = event.pathParameters.mealId

    logger.info('Geting signed URL for meal ', mealId)

    const url = getUploadUrl(mealId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

function getUploadUrl(mealId: string) {
  return XS3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: mealId,
    Expires: urlExpiration
  })
}