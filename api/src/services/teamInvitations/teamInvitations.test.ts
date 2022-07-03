import {
  teamInvitations,
  teamInvitation,
  createTeamInvitation,
  updateTeamInvitation,
  deleteTeamInvitation,
} from './teamInvitations'
import type { StandardScenario } from './teamInvitations.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('teamInvitations', () => {
  scenario(
    'returns all teamInvitations',
    async (scenario: StandardScenario) => {
      const result = await teamInvitations()

      expect(result.length).toEqual(Object.keys(scenario.teamInvitation).length)
    }
  )

  scenario(
    'returns a single teamInvitation',
    async (scenario: StandardScenario) => {
      const result = await teamInvitation({
        id: scenario.teamInvitation.one.id,
      })

      expect(result).toEqual(scenario.teamInvitation.one)
    }
  )

  scenario('creates a teamInvitation', async (scenario: StandardScenario) => {
    const result = await createTeamInvitation({
      input: {
        email: 'String8995551',
        teamId: scenario.teamInvitation.two.teamId,
        role: 'String',
      },
    })

    expect(result.email).toEqual('String8995551')
    expect(result.teamId).toEqual(scenario.teamInvitation.two.teamId)
    expect(result.role).toEqual('String')
  })

  scenario('updates a teamInvitation', async (scenario: StandardScenario) => {
    const original = await teamInvitation({
      id: scenario.teamInvitation.one.id,
    })
    const result = await updateTeamInvitation({
      id: original.id,
      input: { email: 'String9046492' },
    })

    expect(result.email).toEqual('String9046492')
  })

  scenario('deletes a teamInvitation', async (scenario: StandardScenario) => {
    const original = await deleteTeamInvitation({
      id: scenario.teamInvitation.one.id,
    })
    const result = await teamInvitation({ id: original.id })

    expect(result).toEqual(null)
  })
})
