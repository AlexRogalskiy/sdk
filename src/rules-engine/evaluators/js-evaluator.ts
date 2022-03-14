import { Entity } from '../../types'
import {
  JsRule,
  ResourceData,
  Rule,
  RuleResult,
  RuleFinding,
  Result,
} from '../types'
import AutomatedEvaluator from './automated-evaluator'

export default class JsEvaluator extends AutomatedEvaluator<JsRule> {
  private readonly findings: RuleFinding[] = []

  canEvaluate(rule: Rule | JsRule): boolean {
    return 'check' in rule
  }

  async evaluateSingleResource(
    rule: JsRule,
    data: ResourceData
  ): Promise<RuleFinding> {
    const { gql, check, resource, ...ruleMetadata } = rule
    const result = rule.check!(data)
      ? RuleResult.MATCHES
      : RuleResult.DOESNT_MATCH

    const finding = {
      id: `${rule.id}/${data.resource?.id}`,
      resourceId: data.resource?.id,
      result: result !== RuleResult.MATCHES ? Result.FAIL : Result.PASS,
      typename: data.resource?.__typename, // eslint-disable-line no-underscore-dangle
      rule: ruleMetadata,
    } as RuleFinding
    this.findings.push(finding)
    return finding
  }

  prepareMutations(): Entity[] {
    return this.processFindings(this.findings)
  }
}
