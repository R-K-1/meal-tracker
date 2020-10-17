import * as uuid from 'uuid'
import { MealItem } from '../models/MealItem'
import { MealAccess } from '../dataLayer/mealsAccess'
import { CreateMealRequest } from '../requests/CreateMealRequest'
import { UpdateMealRequest } from '../requests/UpdateMealRequest'

const mealAccess = new MealAccess()

const bucketName = process.env.MEAL_IMAGES_S3_BUCKET

export async function createMeal(
  createMealRequest: CreateMealRequest,
  userId: string
): Promise<MealItem> {
  const itemId = uuid.v4()

  return await mealAccess.createMeal({
    mealId: itemId,
    createdAt: new Date().toISOString(),
    ...createMealRequest,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
    userId
  })
}

export async function getMeals(userId: string): Promise<MealItem[]> {
  return await mealAccess.getMeals(userId)
}

export async function updateMeal(
  userId: string,
  mealId: string,
  updatedMeal: UpdateMealRequest
) {
  return await mealAccess.updateMeal(userId, mealId, updatedMeal)
}

export async function deleteMeal(userId: string, mealId: string) {
  return await mealAccess.deleteMeal(userId, mealId)
}
