import lodash from 'lodash'
import {
  Condition,
  JsonRule,
  Operator,
  ResourceData,
  RuleResult,
  _ResourceData,
} from '../types'
import { RuleEvaluator } from './rule-evaluator'
import AdditionalOperators from '../operators'

export default class JsonEvaluator implements RuleEvaluator<JsonRule> {
  canEvaluate(rule: JsonRule): boolean {
    return 'conditions' in rule
  }

  async evaluateSingleResource(
    rule: JsonRule,
    data: ResourceData
  ): Promise<RuleResult> {
    return this.evaluateCondition(rule.conditions, data)
      ? RuleResult.MATCHES
      : RuleResult.DOESNT_MATCH
  }

  calculatePath = (data: _ResourceData, _path: string) => {
    let path = _path
    if (path.indexOf('@') === 0) {
      // @ means the curr resource, we replace by base path
      path = path.replace('@', data.resourcePath).substr(2) // remove `$.`
    }
    if (path.indexOf('[*]') === 0 && data.elementPath) {
      // @ means the curr resource, we replace by base path
      path = path.replace('[*]', data.elementPath)
    }
    return path
  }

  resolvePath = (data: _ResourceData, path: string): any => {
    return lodash.get(data.data, path)
  }

  operators: { [key: string]: Operator } = {
    or: (_, conditions: Condition[], data) => {
      for (let i = 0; i < conditions.length; i++) {
        // if 1 is true, it's true
        if (this.evaluateCondition(conditions[i], data)) return true
      }
      return false
    },
    and: (_, conditions: Condition[], data) => {
      for (let i = 0; i < conditions.length; i++) {
        // if 1 is false, it's false
        if (!this.evaluateCondition(conditions[i], data)) return false
      }
      return true
    },
    array_all: (array, conditions: Condition, data) => {
      // an AND, but with every resource item
      const baseElementPath = data.elementPath

      for (let i = 0; i < array.length; i++) {
        if (
          !this.evaluateCondition(conditions, {
            ...data,
            elementPath: `${baseElementPath}[${i}]`,
          })
        )
          return false
      }
      return true
    },
    array_any: (array, conditions, data) => {
      // an OR, but with every resource item

      const baseElementPath = data.elementPath
      for (let i = 0; i < array.length; i++) {
        if (
          this.evaluateCondition(conditions as Condition, {
            ...data,
            elementPath: `${baseElementPath}[${i}]`,
          })
        )
          return true
      }
      return false
    },
    ...AdditionalOperators,
  }

  isCondition = (a: unknown): boolean =>
    !!a && (a as any).constructor === Object

  evaluateCondition(
    _condition: Condition,
    _data: _ResourceData
  ): boolean | number {
    const condition = { ..._condition }
    const { path, value } = condition
    delete condition.path
    delete condition.value
    // remaining field should be the op name
    const op = Object.keys(condition)[0] //
    const operator = this.operators[op]
    const otherArgs = condition[op] // {[and]: xxx }
    if (!op || !operator) {
      throw new Error(`unrecognized operation${JSON.stringify(condition)}`)
    }

    const data = { ..._data }
    let firstArg

    if (path) {
      const elementPath = this.calculatePath(data, path)
      data.elementPath = elementPath
      firstArg = this.resolvePath(data, elementPath)
    } else if (this.isCondition(value)) {
      firstArg = this.evaluateCondition(value as any, data)
    } else {
      firstArg = value
    }
    return operator(firstArg, otherArgs, data)
  }
}
