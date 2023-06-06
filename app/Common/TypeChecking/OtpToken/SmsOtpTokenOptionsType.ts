import TokenOptionsInterface from 'App/Common/TypeChecking/OtpToken/TokenOptionsInterface'

type SmsOtpTokenOptionsType = Pick<TokenOptionsInterface, 'token' | 'tokenType' | 'mobileNumber'>

export default SmsOtpTokenOptionsType
