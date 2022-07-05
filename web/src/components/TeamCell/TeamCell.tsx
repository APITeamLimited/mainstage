import type { FindTeamQuery, FindTeamQueryVariables } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

export const QUERY = gql`
  query FindTeamQuery($id: String!) {
    team: team(id: $id) {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({
  error,
}: CellFailureProps<FindTeamQueryVariables>) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({
  team,
}: CellSuccessProps<FindTeamQuery, FindTeamQueryVariables>) => {

}

export const Cell = () => {
  return (
    <Query query={QUERY}>
      {({ error, loading, data }) => {
        if (error) {
          if (Failure) {
            return <Failure error={error} />
          } else {
            console.error(error)
          }
        } else if (loading) {
          return <Loading />
        } else if (data) {
          if (typeof Empty !== 'undefined' && isEmpty(data)) {
            return <Empty />
          } else {
            return <Success {...data} />
          }
        } else {
          throw 'Cannot render Cell: graphQL success but `data` is null'
        }
      }}
    </Query>
  )
}
