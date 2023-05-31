import UpdateRecordGeneric from 'App/Common/TypeChecking/GeneralPurpose/UpdateRecordGeneric'
import UserIdentifierOptions from 'App/Systems/Client/UserManagementTypechecking/User/UserIdentifierOptions'
import UserInterface from 'App/Systems/Client/UserManagementTypechecking/User/UserInterface'

type UpdateUserRecordPayload = Partial<UserInterface>

type UpdateUserRecordOptions = UpdateRecordGeneric<
  UserIdentifierOptions,
  UpdateUserRecordPayload
>

export default UpdateUserRecordOptions
