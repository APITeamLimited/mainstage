import { JwtPayload } from 'jwt-decode'

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type InvitationDecodedToken = JwtPayload & {
  teamName: string
  invitationId: string
  invitationEmail: string
}
