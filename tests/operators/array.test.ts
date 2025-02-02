import ArrayOperators from '../../src/rules-engine/operators/array'

describe('Array Operators', () => {
  describe('In Operator', () => {
    test('Should pass given a filled array with the searched element', () => {
      expect(ArrayOperators.in('rule', ['rule'])).toBeTruthy()
    })

    test('Should fail given a filled array without the searched element', () => {
      expect(ArrayOperators.in('rule', [])).toBeFalsy()
    })

    test('Should fail given an empty array', () => {
      expect(ArrayOperators.in('rule', [])).toBeFalsy()
    })
  })

  describe('NotIn Operator', () => {
    test('Should fail given a filled array with the searched element', () => {
      expect(ArrayOperators.notIn('rule', ['rule'])).toBeFalsy()
    })

    test('Should fail given a filled array without the searched element', () => {
      expect(ArrayOperators.notIn('rule', [])).toBeTruthy()
    })

    test('Should fail given an empty array', () => {
      expect(ArrayOperators.notIn('rule', [])).toBeTruthy()
    })
  })
})
