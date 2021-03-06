import * as React from 'react';

//* Import
import { InputTextContainer, InputTextError, InputTextField, InputTextLabel } from './style';

export interface InputTextProps {
        label: string;
        errorMessage: string;
        name: string;
        register: Function;
}

export const InputText: React.FunctionComponent<InputTextProps> = ({ errorMessage, label, name, register }) => {
        return (
                <InputTextContainer>
                        <InputTextLabel htmlFor={name}>{label}</InputTextLabel>
                        <InputTextField autoComplete="on" name={name} ref={(value) => register(value)} id={name} />
                        {errorMessage && <InputTextError>{`${label} ${errorMessage}`}</InputTextError>}
                </InputTextContainer>
        );
};
