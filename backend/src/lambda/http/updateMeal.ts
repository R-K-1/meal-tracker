import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateMealRequest } from '../../requests/UpdateMealRequest'
import { getUserId } from '../utils'
import { updateMeal } from '../../businessLogic/meals'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const mealId = event.pathParameters.mealId
    const updatedMeal: UpdateMealRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    if (!mealId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing mealId' })
      }
    }

    logger.info(
      `Received request for updating meal item ${mealId} of user ${userId}...`
    )
    
    await updateMeal(userId, mealId, updatedMeal)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
