import {
  teamMemberships,
  teamMembership,
  createTeamMembership,
  updateTeamMembership,
  deleteTeamMembership,
} from './teamMemberships'
import type { StandardScenario } from './teamMemberships.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('teamMemberships', () => {
  scenario(
    'returns all teamMemberships',
    async (scenario: StandardScenario) => {
      const result = await teamMemberships()

      expect(result.length).toEqual(Object.keys(scenario.teamMembership).length)
    }
  )

  scenario(
    'returns a single teamMembership',
    async (scenario: StandardScenario) => {
      const result = await teamMembership({
        id: scenario.teamMembership.one.id,
      })

      expect(result).toEqual(scenario.teamMembership.one)
    }
  )

  scenario('creates a teamMembership', async (scenario: StandardScenario) => {
    const result = await createTeamMembership({
      input: {
        userId: scenario.teamMembership.two.userId,
        teamId: scenario.teamMembership.two.teamId,
        role: 'String',
      },
    })

    expect(result.userId).toEqual(scenario.teamMembership.two.userId)
    expect(result.teamId).toEqual(scenario.teamMembership.two.teamId)
    expect(result.role).toEqual('String')
  })

  scenario('updates a teamMembership', async (scenario: StandardScenario) => {
    const original = await teamMembership({
      id: scenario.teamMembership.one.id,
    })
    const result = await updateTeamMembership({
      id: original.id,
      input: { role: 'String2' },
    })

    expect(result.role).toEqual('String2')
  })

  scenario('deletes a teamMembership', async (scenario: StandardScenario) => {
    const original = await deleteTeamMembership({
      id: scenario.teamMembership.one.id,
    })
    const result = await teamMembership({ id: original.id })

    expect(result).toEqual(null)
  })
})
