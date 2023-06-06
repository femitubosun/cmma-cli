import DbTransactionOptions from 'App/Common/TypeChecking/GeneralPurpose/DbTransactionOptions'

/*
|-------------------------------------------------------------------------------
| The Generic Shape of the object passed into the create method of Action Classes
|-------------------------------------------------------------------------------
*/
type CreateNewRecordGeneric<CreateRecordPayloadType> = {
  /**
   * This value defines the data to create the record with.
   */
  createPayload: CreateRecordPayloadType

  /**
   * This value defines the database transaction options.
   */
  dbTransactionOptions: DbTransactionOptions
}

export default CreateNewRecordGeneric
