import TokenOptionsInterface from 'App/Common/TypeChecking/OtpToken/TokenOptionsInterface'

type SmsAndEmailOtpTokenOptionsType = Pick<
  TokenOptionsInterface,
  'token' | 'tokenType' | 'mobileNumber' | 'email' | 'emailSubject' | 'emailTemplate'
>

export default SmsAndEmailOtpTokenOptionsType
