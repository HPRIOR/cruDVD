import { ValidateUsernamePasswordInput } from './validateUsernamePassswordInput';
import { RegisterInput } from '../../resolvers/gqlTypes/registerInput';
import { Just, Nothing } from 'purify-ts';
import { UserResponseError } from '../../resolvers/gqlTypes/userResponseError';
import { ValidatorResponse } from './types/validatorResponse';

export const registerInputIsValid = (
    input: RegisterInput,
    validators: ValidateUsernamePasswordInput[]
): UserResponseError => {
    let errors: UserResponseError = {};
    validators.forEach((validator: ValidateUsernamePasswordInput) => {
        let maybeError = validator(input);
        if (maybeError.isJust()) {
            updateErrorObject(maybeError.extract(), errors);
        }
    });
    return errors;
};

const updateErrorObject = (validatorResponse: ValidatorResponse, errors: UserResponseError) => {
    switch (validatorResponse.option) {
        case 'passError':
            errors.passError
                ? errors.passError.push(validatorResponse.message)
                : (errors.passError = [validatorResponse.message]);
            return;

        case 'emailError':
            errors.emailError
                ? errors.emailError.push(validatorResponse.message)
                : (errors.emailError = [validatorResponse.message]);
            return;
        case 'userError':
            errors.userError
                ? errors.userError.push(validatorResponse.message)
                : (errors.userError = [validatorResponse.message]);
            return;
        case 'genericError':
            errors.genericError
                ? errors.genericError.push(validatorResponse.message)
                : (errors.genericError = [validatorResponse.message]);
            return;
    }
};

export const shortPassword: ValidateUsernamePasswordInput = input =>
    input.password.length < 5
        ? Just({
              option: 'passError',
              message: 'Password needs to contain at least 5 characters',
          })
        : Nothing;

export const shortUsername: ValidateUsernamePasswordInput = input =>
    input.username!.length <= 2
        ? Just({ option: 'userError', message: 'Username must contain at least 3 characters' })
        : Nothing;

export const shortEmail: ValidateUsernamePasswordInput = input =>
    input.email!.length <= 2
        ? Just({ option: 'emailError', message: 'Email must contain at least 3 characters' })
        : Nothing;

const symbolsIn = (inputString: string) =>
    inputString.split('').some(ch => {
        const code = ch.charCodeAt(0);
        return (
            !(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123) // lower alpha (a-z)
        );
    });

export const passwordContainsSymbols: ValidateUsernamePasswordInput = input =>
    !symbolsIn(input.password) ? Just({ option: 'passError', message: 'Password needs to contain symbols' }) : Nothing;

const containsUpperCase = (inputString: string) =>
    inputString.split('').some(ch => {
        const code = ch.charCodeAt(0);
        return code > 64 && code < 91;
    });

export const passwordContainsUpperCase: ValidateUsernamePasswordInput = input =>
    !containsUpperCase(input.password)
        ? Just({
              option: 'passError',
              message: 'Password must contain at least one upper case letter',
          })
        : Nothing;
