import OtpTokenTypeEnum from 'App/Systems/Client/UserManagement/TypeChecking/OtpToken/OtpTokenTypeEnum'

interface TokenOptionsInterface {
  /**
   * This is the generated token
   */
  token: string

  /**
   * This is the type of token action being carried out
   */
  tokenType: OtpTokenTypeEnum

  /**
   * The email value to check for
   */
  email: string

  /**
   * The mobile number value to check for
   */
  mobileNumber: string

  /**
   * The Email's Subject
   */
  emailSubject: string

  /**
   * The Email Template to be Utilized
   */
  emailTemplate: string

  /**
   * The option definition of which value to use
   */
  userIdentifierOption: string | 'mobile_number' | 'email' | 'sms-and-email'
}

export default TokenOptionsInterface
