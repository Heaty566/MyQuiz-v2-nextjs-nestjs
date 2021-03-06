export interface UserLoginDto {
        username: string;
        password: string;
}

export interface UserRegisterDto {
        username: string;
        password: string;
        fullName: string;
        confirmPassword: string;
}

export interface ForgotPasswordDto {
        email: string;
}
export interface ForgotPasswordUpdateDto {
        newPassword: string;
        resetKey: string;
        confirmPassword: string;
}
