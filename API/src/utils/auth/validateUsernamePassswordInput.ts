import { RegisterInput } from '../../resolvers/gqlTypes/registerInput';
import { Maybe } from 'purify-ts';
import { ValidatorResponse } from './types/validatorResponse';

export type ValidateUsernamePasswordInput = (input: RegisterInput) => Maybe<ValidatorResponse>;
