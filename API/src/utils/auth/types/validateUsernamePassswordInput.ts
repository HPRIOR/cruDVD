import { RegisterInput } from '../../../resolvers/types/registerInput';
import { Maybe } from 'purify-ts';
import { ValidatorResponse } from './validatorResponse';

export type ValidateUsernamePasswordInput = (input: RegisterInput) => Maybe<ValidatorResponse>;
