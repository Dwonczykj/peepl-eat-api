// api/interfaces/turtle.ts
//see https://medium.com/geekculture/how-to-use-typescript-sails-js-for-your-rest-api-safer-seas-6e8a319862c7

export interface Turtle {
  shellColor: string
  size: { length: number, weight?: number },
  age?: number
}