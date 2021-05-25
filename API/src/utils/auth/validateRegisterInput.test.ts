import { RegisterInput } from '../../resolvers/gqlTypes/registerInput';
import { passwordContainsSymbols, registerInputIsValid, shortEmail, shortUsername } from './validateRegisterInput';

describe('validateRegisterInput', () => {
    it('should return empty object if no errors found', () => {
        let input: RegisterInput = {
            username: 'test-user',
            password: '12345FDsdfsd!@£',
            email: 'test-user@test.com',
        };

        let result = registerInputIsValid(input, []);
        expect(result).toStrictEqual({});
    });

    it('should return password error', () => {
        let input: RegisterInput = {
            username: 'test-user',
            password: '12345FD',
            email: 'test-user@test.com',
        };

        let result = registerInputIsValid(input, [passwordContainsSymbols]);
        expect(result.passError?.length).toBeGreaterThan(0);
    });
    it('should return username error', () => {
        let input: RegisterInput = {
            username: 'te',
            password: '12345FD',
            email: 'test-user@test.com',
        };

        let result = registerInputIsValid(input, [shortUsername]);
        expect(result.userError?.length).toBeGreaterThan(0);
    });

    it('should return email error', () => {
        let input: RegisterInput = {
            username: 'te',
            password: '12345FD',
            email: '',
        };

        let result = registerInputIsValid(input, [shortEmail]);
        expect(result.emailError?.length).toBeGreaterThan(0);
    });
});
