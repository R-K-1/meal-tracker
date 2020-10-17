import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createMeal, deleteMeal, getMeals, patchMeal } from '../api/meals-api'
import Auth from '../auth/Auth'
import { Meal } from '../types/Meal'

interface MealsProps {
  auth: Auth
  history: History
}

interface MealsState {
  meals: Meal[]
  newMealName: string
  newMealCalories: number
  loadingMeals: boolean
}

export class Meals extends React.PureComponent<MealsProps, MealsState> {
  state: MealsState = {
    meals: [],
    newMealName: '',
    newMealCalories: 0,
    loadingMeals: true
  }

  handleMealChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newMealName: event.target.value })
  }

  onEditButtonClick = (mealId: string) => {
    this.props.history.push(`/meals/${mealId}/edit`)
  }

  onMealCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newMeal = await createMeal(this.props.auth.getIdToken(), {
        name: this.state.newMealName,
        calories: this.state.newMealCalories
      })
      this.setState({
        meals: [...this.state.meals, newMeal],
        newMealName: ''
      })
    } catch {
      alert('Meal creation failed')
    }
  }

  onMealDelete = async (mealId: string) => {
    try {
      await deleteMeal(this.props.auth.getIdToken(), mealId)
      this.setState({
        meals: this.state.meals.filter(meal => meal.mealId != mealId)
      })
    } catch {
      alert('Meal deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const meals = await getMeals(this.props.auth.getIdToken())
      this.setState({
        meals,
        loadingMeals: false
      })
    } catch (e) {
      alert(`Failed to fetch meals: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">MEALs</Header>

        {this.renderCreateMealInput()}

        {this.renderMeals()}
      </div>
    )
  }

  renderCreateMealInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New meal',
              onClick: this.onMealCreate
            }}
            fluid
            actionPosition="left"
            placeholder="What did you eat?"
            onChange={this.handleMealChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderMeals() {
    if (this.state.loadingMeals) {
      return this.renderLoading()
    }

    return this.renderMealsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading MEALs
        </Loader>
      </Grid.Row>
    )
  }

  renderMealsList() {
    return (
      <Grid padded>
        {this.state.meals.map((meal, pos) => {
          return (
            <Grid.Row key={meal.mealId}>
              <Grid.Column width={10} verticalAlign="middle">
                {meal.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {meal.calories}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(meal.mealId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onMealDelete(meal.mealId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {meal.attachmentUrl && (
                <Image src={meal.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
