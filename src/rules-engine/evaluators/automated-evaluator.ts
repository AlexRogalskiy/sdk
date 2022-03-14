import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { Entity } from '../../types'
import { RuleFinding, Rule, ResourceData } from '../types'
import { RuleEvaluator } from './rule-evaluator'

export default abstract class AutomatedEvaluator<T extends Rule>
  implements RuleEvaluator<T>
{
  private readonly providerName

  private readonly entityName

  constructor(providerName: string, entityName: string) {
    this.providerName = providerName
    this.entityName = entityName
  }

  // eslint-disable-next-line
  canEvaluate(rule: T): boolean {
    throw new Error('Function canEvaluate has not been defined')
  }

  // eslint-disable-next-line
  evaluateSingleResource(rule: T, data?: ResourceData): Promise<RuleFinding> {
    throw new Error('Function evaluateSingleResource has not been defined')
  }

  prepareMutations(): Entity[] {
    throw new Error('Function prepareMutations has not been defined')
  }

  protected processFindings(findings: RuleFinding[]): Entity[] {
    const mutations = []

    // Group Findings by schema type
    const findingsByType = groupBy(findings, 'typename')

    for (const findingType in findingsByType) {
      if (!isEmpty(findingType)) {
        // Group Findings by resource
        const findingsByResource = groupBy(
          findingsByType[findingType],
          'resourceId'
        )

        for (const resource in findingsByResource) {
          if (resource) {
            const data = (
              (findingsByResource[resource] as RuleFinding[]) || []
            ).map(({ typename, ...properties }) => properties)

            // Create dynamically update mutations by resource
            const updateMutation = {
              name: `${this.providerName}${this.entityName}Findings`,
              mutation: `mutation update${findingType}($input: Update${findingType}Input!) {
                update${findingType}(input: $input) {
                  numUids
                }
              }
              `,
              data: {
                filter: {
                  id: { eq: resource },
                },
                set: {
                  [`${this.entityName}Findings`]: data,
                },
              },
            }

            mutations.push(updateMutation)
          }
        }
      }
    }

    return mutations
  }
}
