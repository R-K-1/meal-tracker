import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateMealRequest } from '../../requests/CreateMealRequest'
import { getUserId } from '../utils'
import { createMeal } from '../../businessLogic/meals'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newMeal: CreateMealRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const item = createMeal(newMeal, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

