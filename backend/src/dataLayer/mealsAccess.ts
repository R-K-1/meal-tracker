import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { MealItem } from '../models/MealItem'
import { UpdateMealRequest } from '../requests/UpdateMealRequest'

const XAWS = AWSXRay.captureAWS(AWS)

export class MealAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly mealsTable = process.env.MEALS_TABLE,
    private readonly createdAtIndex = process.env.CREATED_AT_INDEX
  ) {}

  async createMeal(meal: MealItem): Promise<MealItem> {
    await this.docClient
      .put({
        TableName: this.mealsTable,
        Item: meal
      })
      .promise()

    return meal
  }

  async getMeals(userId: string): Promise<MealItem[]> {
    console.log('Getting all meals for user ' + userId)

    const result = await this.docClient
      .query({
        TableName: this.mealsTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    console.log('query result: ' + JSON.stringify(result))

    const items = result.Items
    return items as MealItem[]
  }

  async updateMeal(
    userId: string,
    mealId: string,
    updatedMeal: UpdateMealRequest
  ) {
    await this.docClient
      .update({
        TableName: this.mealsTable,
        Key: {
          userId,
          mealId
        },
        UpdateExpression:
          'set #name = :name, #calories = :calories',
        ExpressionAttributeValues: {
          ':name': updatedMeal.name,
          ':calories': updatedMeal.calories,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#calories': 'calories'
        }
      })
      .promise()
  }

  async deleteMeal(userId: string, mealId: string) {
    await this.docClient
      .delete({
        TableName: this.mealsTable,
        Key: {
          userId,
          mealId
        }
      })
      .promise()
  }
}