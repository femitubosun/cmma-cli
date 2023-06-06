import TokenOptionsInterface from 'App/Common/TypeChecking/OtpToken/TokenOptionsInterface'

type EmailOtpTokenOptionsType = Pick<
  TokenOptionsInterface,
  'token' | 'email' | 'emailSubject' | 'emailTemplate'
>

export default EmailOtpTokenOptionsType
